import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// Simple in-memory cache
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache
const cache = new Map();

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;
const requestCounts = new Map();

// Helper function to safely parse JSON from LLM responses
function safeJsonParse(text: string) {
  try {
    // Step 1: Clean up the text
    let cleanedText = text.trim();
    
    // Step 2: Remove markdown code blocks if present
    if (cleanedText.includes('```')) {
      const jsonMatch = cleanedText.match(/```(?:json)?([\s\S]*?)```/);
      cleanedText = jsonMatch ? jsonMatch[1].trim() : cleanedText;
    }
    
    // Step 3: Remove any control characters that would break JSON parsing
    cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Step 4: Make sure it starts with { or [
    cleanedText = cleanedText.trim();
    if (!cleanedText.startsWith('{') && !cleanedText.startsWith('[')) {
      const objectMatch = cleanedText.match(/\{[\s\S]*\}/);
      const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
      
      if (objectMatch) {
        cleanedText = objectMatch[0];
      } else if (arrayMatch) {
        cleanedText = arrayMatch[0];
      }
    }
    
    // Step 5: Try parsing the cleaned JSON
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('JSON parse error even after cleaning:', error);
    console.log('Failed text:', text);
    throw error; // Re-throw so the calling function can handle the fallback
  }
}

// Default questions by role and level
const defaultQuestions = {
  frontend: {
    junior: [
      "Can you explain the difference between let, const, and var in JavaScript?",
      "How do you make a website responsive?",
      "What is the box model in CSS?",
      "Explain the concept of event bubbling in JavaScript.",
      "How would you optimize a website's loading performance?"
    ],
    mid: [
      "Explain how React's Virtual DOM works and why it's beneficial.",
      "Describe your approach to state management in front-end applications.",
      "How would you implement authentication in a client-side application?",
      "What strategies do you use for testing front-end code?",
      "How do you handle cross-browser compatibility issues?"
    ],
    senior: [
      "Describe how you would architect a large-scale front-end application.",
      "How would you implement a design system for consistency across multiple applications?",
      "Explain your approach to performance optimization in complex web applications.",
      "How do you handle security concerns in front-end development?",
      "What strategies would you use for code splitting in a large React application?"
    ]
  },
  backend: {
    junior: [
      "What is REST and how does it work?",
      "Explain the difference between SQL and NoSQL databases.",
      "How do you handle error handling in your code?",
      "What is middleware and how is it used?",
      "Describe basic security practices for API development."
    ],
    mid: [
      "How would you design an API for scale?",
      "Explain your approach to database optimization.",
      "How do you implement authentication and authorization in APIs?",
      "Describe strategies for handling asynchronous operations.",
      "How would you monitor and debug a production API?"
    ],
    senior: [
      "How would you architect a microservices system?",
      "Describe your approach to designing highly available and fault-tolerant systems.",
      "How do you manage database migrations and schema evolution?",
      "Explain strategies for optimizing database performance at scale.",
      "How do you approach system security and compliance requirements?"
    ]
  },
  fullstack: {
    junior: [
      "How do front-end and back-end components communicate?",
      "Explain the concept of MVC architecture.",
      "What databases have you worked with, and what are their pros and cons?",
      "How do you debug issues that span both front-end and back-end?",
      "Describe your experience with version control systems."
    ],
    mid: [
      "How do you balance front-end and back-end responsibilities in your work?",
      "Describe your ideal tech stack and why you prefer it.",
      "How would you implement a feature that requires changes across the entire stack?",
      "What strategies do you use for testing full-stack applications?",
      "How do you handle deployment of full-stack applications?"
    ],
    senior: [
      "How would you architect a scalable full-stack application from scratch?",
      "Describe your approach to managing technical debt across the stack.",
      "How do you make architectural decisions that affect both front-end and back-end?",
      "Explain your strategies for mentoring junior developers across the stack.",
      "How do you keep up with rapidly evolving technologies in both domains?"
    ]
  }
};

// Default interviewer suggestions by role
const defaultInterviewerSuggestions = {
  frontend: [
    "Ask them to walk through their approach to responsive design and consider asking them to sketch a responsive layout.",
    "For JavaScript questions, probe their understanding of closures and asynchronous programming with follow-up examples.",
    "When discussing frameworks, ask them to compare and contrast different options they've used.",
    "Consider having them review a snippet of CSS code with some issues to fix."
  ],
  backend: [
    "When discussing databases, ask them to explain their query optimization approaches with specific examples.",
    "For system design questions, have them explain their scalability considerations and tradeoffs.",
    "Ask them to describe how they handle error scenarios or edge cases in their code.",
    "Consider posing a scenario where they need to debug a production issue to see their troubleshooting process."
  ],
  fullstack: [
    "Ask them to explain how they manage the data flow between frontend and backend components.",
    "Probe their understanding of security concerns that span both frontend and backend.",
    "Consider asking how they approach testing across the full stack.",
    "Ask them to describe a challenging project where they had to implement both frontend and backend solutions."
  ]
};

function getCacheKey(action: string, role: string, level: string, techstack: string[]): string {
  return `${action}:${role}:${level}:${Array.isArray(techstack) ? techstack.join(',') : 'default'}`;
}

function checkRateLimit(cacheKey: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean up old entries
  for (const [key, timestamps] of requestCounts.entries()) {
    requestCounts.set(key, timestamps.filter((time: number) => time > windowStart));
    if (requestCounts.get(key).length === 0) {
      requestCounts.delete(key);
    }
  }
  
  // Check current request count
  const timestamps = requestCounts.get(cacheKey) || [];
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  // Add current request
  requestCounts.set(cacheKey, [...timestamps, now]);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Add default values and ensure techstack is an array
    const data = await req.json();
    const action = data.action;
    
    // Validate action
    if (!action) {
      return NextResponse.json({ 
        error: 'Missing required parameter: action',
        validActions: ['generate-questions', 'evaluate-answer', 'generate-feedback', 'questions', 'evaluate', 'feedback', 'interviewer-suggestions']
      }, { status: 400 });
    }
    
    const role = data.role || 'Software Developer';
    const level = data.level || 'mid';
    const normalizedLevel = level.toLowerCase().includes('junior') ? 'junior' : 
                           level.toLowerCase().includes('senior') ? 'senior' : 'mid';
    const normalizedRole = role.toLowerCase().includes('front') ? 'frontend' : 
                          role.toLowerCase().includes('back') ? 'backend' : 'fullstack';
    
    // Ensure techstack is always an array
    const techstack = Array.isArray(data.techstack) ? data.techstack : 
                     (typeof data.techstack === 'string' ? [data.techstack] : 
                     ['JavaScript', 'HTML', 'CSS']);
    const answer = data.answer;
    const question = data.question;
    
    // Support both old and new action naming
    let normalizedAction = action;
    if (action === 'questions' || action.includes('question')) {
      normalizedAction = 'generate-questions';
    } else if (action === 'evaluate' || action.includes('evaluat')) {
      normalizedAction = 'evaluate-answer';
    } else if (action === 'feedback' || action.includes('feedback')) {
      normalizedAction = 'generate-feedback';
    } else if (action === 'interviewer-suggestions' || action.includes('interviewer')) {
      normalizedAction = 'interviewer-suggestions';
    }
    
    // Create cache key
    const cacheKey = getCacheKey(normalizedAction, normalizedRole, normalizedLevel, techstack);
    
    // Check cache first
    if (cache.has(cacheKey) && normalizedAction === 'generate-questions') {
      const cachedData = cache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log('Using cached questions');
        return NextResponse.json(cachedData.data);
      } else {
        cache.delete(cacheKey);
      }
    }
    
    // Check rate limit (only if not in cache)
    if (!checkRateLimit(cacheKey)) {
      console.log('Rate limit exceeded, using fallback responses');
      
      if (normalizedAction === 'generate-questions') {
        // Use default questions based on role and level
        const questions = 
          defaultQuestions[normalizedRole]?.[normalizedLevel] || 
          defaultQuestions.fullstack.mid;
          
        return NextResponse.json({ questions });
      }
      
      if (normalizedAction === 'evaluate-answer') {
        return NextResponse.json({ 
          score: 7, 
          feedback: 'This appears to be a solid answer that demonstrates good understanding. Consider adding more specific examples in future responses.'
        });
      }
      
      if (normalizedAction === 'generate-feedback') {
        return NextResponse.json({
          feedback: `Overall, the candidate shows good potential for a ${level} ${role} position with some areas to develop further.`,
          strengths: ["Good technical knowledge base", "Communication skills", "Problem-solving approach"],
          improvements: ["Deepen expertise in specific technologies", "Gain more practical project experience"]
        });
      }
    }
    
    // Continue with Groq API calls with lighter model if not rate limited
    if (normalizedAction === 'generate-questions') {
      try {
        const { text: questionsJson } = await generateText({
          model: groq('llama-3.2-11b-vision-preview'),  // Use updated model
          prompt: `
            Generate 5 technical interview questions for a ${level} ${role} position. 
            The candidate should know these technologies: ${techstack.join(', ')}.
            Format your response as a JSON array of strings.
            Return only the JSON array, with no extra text.
            Example format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
          `,
          temperature: 0.7,
        });

        try {
          // Use safer JSON parsing
          const parsedQuestions = safeJsonParse(questionsJson);
          const result = { 
            questions: Array.isArray(parsedQuestions) ? parsedQuestions : 
                       (parsedQuestions.questions ? parsedQuestions.questions : [])
          };
          
          // Add to cache
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          
          return NextResponse.json(result);
        } catch (parseError) {
          console.error('Error parsing JSON questions:', parseError);
          console.log('Raw response:', questionsJson);
          
          // Use default questions based on role and level
          const questions = 
            defaultQuestions[normalizedRole]?.[normalizedLevel] || 
            defaultQuestions.fullstack.mid;
            
          return NextResponse.json({ questions });
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        
        // Use default questions based on role and level
        const questions = 
          defaultQuestions[normalizedRole]?.[normalizedLevel] || 
          defaultQuestions.fullstack.mid;
          
        return NextResponse.json({ questions });
      }
    } 
    
    // For other actions, use similar approach with fallbacks
    else if (normalizedAction === 'evaluate-answer') {
      try {
        // Check if we should generate a sample answer instead of evaluating
        const isGeneratingSampleAnswer = !answer || answer.trim() === '';
        
        let promptText;
        if (isGeneratingSampleAnswer) {
          // Generate sample answer
          promptText = `
            Generate a sample expert answer for the following technical interview question:
            
            Question: ${question || 'Technical interview question'}
            
            This is for a ${level} ${role} position with these technologies: ${techstack.join(', ')}.
            The answer should demonstrate deep knowledge and be comprehensive yet concise.
            Return a JSON object with "sampleAnswer" field containing an ideal response.
            Format: {"sampleAnswer": "Your sample answer here"}
          `;
        } else {
          // Evaluate the provided answer
          promptText = `
            Question: ${question || 'Technical interview question'}
            
            Candidate's Answer: ${answer}
            
            Evaluate this response for a ${level} ${role} position with these technologies: ${techstack.join(', ')}.
            Return a JSON object with "score" (1-10) and "feedback" fields.
            The score should reflect the technical accuracy and communication quality.
            The feedback should be constructive and specific.
            Format: {"score": 7, "feedback": "Your feedback here"}
          `;
        }
        
        const { text: evaluation } = await generateText({
          model: groq('llama-3.2-11b-vision-preview'),  // Updated model
          prompt: promptText,
          temperature: 0.7,
        });

        try {
          // Use safer JSON parsing
          const parsedResponse = safeJsonParse(evaluation);
          return NextResponse.json(parsedResponse);
        } catch (parseError) {
          console.error('Error parsing evaluation JSON:', parseError);
          console.log('Raw response:', evaluation);
          
          if (isGeneratingSampleAnswer) {
            // Return a fallback sample answer
            return NextResponse.json({ 
              sampleAnswer: `For this ${level} ${role} position focusing on ${techstack.join(', ')}, the candidate should demonstrate understanding of core concepts, practical experience, and problem-solving abilities. They should explain their approach clearly, mention relevant technologies, and provide concrete examples from their experience.`
            });
          } else {
            // Return a fallback evaluation
            return NextResponse.json({ 
              score: 7, 
              feedback: 'This appears to be a solid answer that demonstrates good understanding. Consider adding more specific examples in future responses.'
            });
          }
        }
      } catch (aiError) {
        console.error('AI evaluation error:', aiError);
        
        if (!answer || answer.trim() === '') {
          // Return a fallback sample answer on error
          return NextResponse.json({ 
            sampleAnswer: `For this ${level} ${role} position focusing on ${techstack.join(', ')}, the candidate should demonstrate understanding of core concepts, practical experience, and problem-solving abilities. They should explain their approach clearly, mention relevant technologies, and provide concrete examples from their experience.`
          });
        } else {
          // Return a fallback evaluation on error
          return NextResponse.json({ 
            score: 7, 
            feedback: 'This appears to be a solid answer that demonstrates good understanding. Consider adding more specific examples in future responses.'
          });
        }
      }
    }
    
    else if (normalizedAction === 'generate-feedback') {
      try {
        // Get ratings and notes safely with defaults
        const ratings = Array.isArray(data.ratings) ? data.ratings : [];
        const notes = data.notes || '';
        const savedAnswers = Array.isArray(data.savedAnswers) ? data.savedAnswers : [];
        
        // Create prompt with saved answers included
        let promptText = `
          Generate comprehensive feedback for a ${level} ${role} candidate with the following ratings: ${JSON.stringify(ratings)}.
          Additional interviewer notes: ${notes || 'None provided'}.
        `;
        
        // Add saved answers if available
        if (savedAnswers.length > 0) {
          promptText += `
            The candidate provided the following answers during the interview:
            ${savedAnswers.map((item: { question: string; answer: string }) => `
              Question: ${item.question}
              Answer: ${item.answer}
            `).join('\n')}
            
            Please analyze these answers in your feedback.
          `;
        }
        
        // Complete the prompt
        promptText += `
          Focus on strengths, areas for improvement, and specific advice for next steps.
          
          Return a JSON object with "feedback", "strengths", "improvements", and "nextSteps" fields.
          Format: 
          {
            "feedback": "Overall assessment",
            "strengths": ["Strength 1", "Strength 2"],
            "improvements": ["Improvement area 1", "Improvement area 2"],
            "nextSteps": ["Specific action 1", "Specific action 2", "Specific action 3"]
          }
        `;
        
        const { text: feedback } = await generateText({
          model: groq('llama-3.2-11b-vision-preview'),  // Updated model
          prompt: promptText,
          temperature: 0.7,
        });

        try {
          // Use safer JSON parsing
          const parsedFeedback = safeJsonParse(feedback);
          
          // Ensure nextSteps exists, with default if not present
          if (!Array.isArray(parsedFeedback.nextSteps)) {
            parsedFeedback.nextSteps = [
              "Review core concepts in your tech stack",
              "Practice coding problems related to your areas of improvement",
              "Work on communication and explanation skills"
            ];
          }
          
          return NextResponse.json(parsedFeedback);
        } catch (parseError) {
          console.error('Error parsing feedback JSON:', parseError);
          console.log('Raw response:', feedback);
          
          return NextResponse.json({
            feedback: `Overall, the candidate shows good potential for a ${level} ${role} position with some areas to develop further.`,
            strengths: ["Good technical knowledge base", "Communication skills", "Problem-solving approach"],
            improvements: ["Deepen expertise in specific technologies", "Gain more practical project experience"],
            nextSteps: ["Review core concepts in your tech stack", "Practice coding problems", "Work on communication skills"]
          });
        }
      } catch (aiError) {
        console.error('AI feedback generation error:', aiError);
        
        return NextResponse.json({
          feedback: `Overall, the candidate shows good potential for a ${level} ${role} position with some areas to develop further.`,
          strengths: ["Good technical knowledge base", "Communication skills", "Problem-solving approach"],
          improvements: ["Deepen expertise in specific technologies", "Gain more practical project experience"],
          nextSteps: ["Review core concepts in your tech stack", "Practice coding problems", "Work on communication skills"]
        });
      }
    }
    
    else if (normalizedAction === 'interviewer-suggestions') {
      try {
        // Get candidate's details and current question if available
        const candidateDetails = data.candidateDetails || {};
        const currentQuestion = data.currentQuestion || '';
        const candidateAnswer = data.candidateAnswer || '';
        
        let promptText = `
          As an expert interviewer for a ${level} ${role} position, provide guidance for conducting this interview.
          The candidate has experience with: ${techstack.join(', ')}.
          
          ${candidateDetails.experience ? `The candidate has ${candidateDetails.experience} years of experience.` : ''}
          ${candidateDetails.background ? `Background information: ${candidateDetails.background}` : ''}
          
          ${currentQuestion ? `Current question: ${currentQuestion}` : ''}
          ${candidateAnswer ? `Candidate's answer: ${candidateAnswer}` : ''}
          
          Provide:
          1. Three follow-up questions to probe deeper based on ${currentQuestion ? 'their answer' : 'the candidate profile'}
          2. Key points to listen for in their responses
          3. Red and green flags to watch for
          4. A suggested alternative question if the current line of questioning isn't effective
          
          Return a JSON object with these fields:
          Format: {
            "followUpQuestions": ["Question 1", "Question 2", "Question 3"],
            "keyPoints": ["Point 1", "Point 2", "Point 3"],
            "greenFlags": ["Positive sign 1", "Positive sign 2"],
            "redFlags": ["Warning sign 1", "Warning sign 2"],
            "alternativeQuestion": "Alternative question"
          }
        `;
        
        const { text: suggestionsText } = await generateText({
          model: groq('llama-3.2-11b-vision-preview'),
          prompt: promptText,
          temperature: 0.7,
        });

        try {
          // Use safer JSON parsing
          const parsedSuggestions = safeJsonParse(suggestionsText);
          return NextResponse.json(parsedSuggestions);
        } catch (parseError) {
          console.error('Error parsing interviewer suggestions JSON:', parseError);
          console.log('Raw response:', suggestionsText);
          
          // Return fallback suggestions based on role
          const fallbackSuggestions = {
            followUpQuestions: [
              "Could you explain how you've applied these technologies in a recent project?",
              "What challenges did you face when working with these technologies and how did you overcome them?",
              "How do you stay updated with the latest developments in these technologies?"
            ],
            keyPoints: [
              "Look for specific examples from their experience",
              "Check for understanding of underlying principles, not just surface knowledge",
              "Note how they communicate technical concepts"
            ],
            greenFlags: [
              "Provides concrete examples from personal experience",
              "Explains tradeoffs and alternatives in their solutions",
              "Admits knowledge gaps but explains how they would learn"
            ],
            redFlags: [
              "Vague answers without specific examples",
              "Unable to explain the 'why' behind technical decisions",
              "Overconfidence without substantiating knowledge"
            ],
            alternativeQuestion: `Tell me about a challenging problem you solved using ${techstack[0] || 'your technical skills'}`
          };
          
          return NextResponse.json(fallbackSuggestions);
        }
      } catch (aiError) {
        console.error('AI interviewer suggestions error:', aiError);
        
        // Get the default suggestions based on role
        const defaultSuggestions = defaultInterviewerSuggestions[normalizedRole] || 
                                   defaultInterviewerSuggestions.fullstack;
        
        // Return fallback suggestions
        return NextResponse.json({
          followUpQuestions: [
            "Could you explain how you've applied these technologies in a recent project?",
            "What challenges did you face when working with these technologies and how did you overcome them?",
            "How do you stay updated with the latest developments in these technologies?"
          ],
          keyPoints: [
            "Look for specific examples from their experience",
            "Check for understanding of underlying principles, not just surface knowledge",
            "Note how they communicate technical concepts"
          ],
          greenFlags: [
            "Provides concrete examples from personal experience",
            "Explains tradeoffs and alternatives in their solutions",
            "Admits knowledge gaps but explains how they would learn"
          ],
          redFlags: [
            "Vague answers without specific examples",
            "Unable to explain the 'why' behind technical decisions",
            "Overconfidence without substantiating knowledge"
          ],
          alternativeQuestion: `Tell me about a challenging problem you solved using ${techstack[0] || 'your technical skills'}`,
          interviewerTips: defaultSuggestions
        });
      }
    }
    
    return NextResponse.json({ 
      error: `Invalid action: ${normalizedAction}`, 
      validActions: ['generate-questions', 'evaluate-answer', 'generate-feedback', 'interviewer-suggestions'] 
    }, { status: 400 });
  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallback: {
        questions: [
          "Tell me about your experience with web development.",
          "What projects have you worked on in the past?",
          "Describe a technical challenge you faced and how you solved it.",
          "What's your approach to learning new technologies?",
          "How do you ensure your code is maintainable and scalable?"
        ]
      }
    }, { status: 200 }); // Return 200 with fallback questions instead of 500
  }
}

// Helper function to get an overall rating description
function getOverallRating(ratings: Array<{category: string, score: number}>) {
  if (!Array.isArray(ratings) || ratings.length === 0) {
    return "satisfactory";
  }
  
  const averageScore = ratings.reduce((sum, rating) => sum + (rating.score || 0), 0) / ratings.length;
  
  if (averageScore >= 4.5) return "excellent";
  if (averageScore >= 3.5) return "strong";
  if (averageScore >= 2.5) return "satisfactory";
  if (averageScore >= 1.5) return "moderate";
  return "developing";
} 