'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { StarIcon, AlertCircle, ChevronDown, ChevronUp, Save, Check, RefreshCw, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

interface InterviewerTipsProps {
  role: string;
  level: string;
  techstack: string[];
  interviewId?: string;
  interviewComplete?: boolean;
}

interface Rating {
  category: string;
  score: number;
}

interface SavedAnswer {
  question: string;
  answer: string;
}

// Add debounce function to prevent too many API calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// New component for AI-powered interviewer suggestions
const InterviewerSuggestions = ({ 
  role, 
  level, 
  techstack = [], 
  currentQuestion = '',
  candidateAnswer = ''
}: {
  role: string;
  level: string;
  techstack: string[];
  currentQuestion?: string;
  candidateAnswer?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    followUpQuestions: string[];
    keyPoints: string[];
    greenFlags: string[];
    redFlags: string[];
    alternativeQuestion: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const safeTechstack = Array.isArray(techstack) ? techstack : [];
      
      // Optional candidate details - could be expanded later
      const candidateDetails = {
        // You could add additional fields here later
      };
      
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'interviewer-suggestions',
          role,
          level,
          techstack: safeTechstack,
          currentQuestion,
          candidateAnswer,
          candidateDetails
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching interviewer suggestions:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate interviewer suggestions');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg mb-6">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer bg-blue-50 dark:bg-blue-900/20"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold">AI Interview Coach</h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>
      
      {expanded && (
        <div className="p-4">
          {!suggestions && !loading && !error && (
            <div className="text-center py-6">
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Get AI-powered suggestions to help you conduct a more effective interview
              </p>
              <Button onClick={fetchSuggestions}>
                Generate Interview Suggestions
              </Button>
            </div>
          )}
          
          {loading && (
            <div className="py-4 text-center">
              <div className="inline-flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                <span>Generating interview suggestions...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          
          {suggestions && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <h4 className="font-medium mb-2">Follow-up Questions</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-6"
                    onClick={() => copyToClipboard(suggestions.followUpQuestions.join('\n'))}
                  >
                    Copy All
                  </Button>
                </div>
                <ul className="space-y-2">
                  {suggestions.followUpQuestions.map((question, i) => (
                    <li key={i} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg flex justify-between items-center">
                      <span className="mr-2">{question}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => copyToClipboard(question)}
                      >
                        Copy
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Key Points to Listen For</h4>
                <ul className="space-y-1">
                  {suggestions.keyPoints.map((point, i) => (
                    <li key={i} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">{point}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <h4 className="font-medium mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Green Flags
                  </h4>
                  <ul className="space-y-1">
                    {suggestions.greenFlags.map((flag, i) => (
                      <li key={i} className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-sm">{flag}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                    Red Flags
                  </h4>
                  <ul className="space-y-1">
                    {suggestions.redFlags.map((flag, i) => (
                      <li key={i} className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-sm">{flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Alternative Question</h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg flex justify-between items-center">
                  <span className="mr-2">{suggestions.alternativeQuestion}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => copyToClipboard(suggestions.alternativeQuestion)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={fetchSuggestions} size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh Suggestions
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InterviewerTips = ({ role, level, techstack = [], interviewId, interviewComplete = false }: InterviewerTipsProps) => {
  // Move this derived value into the useEffect to prevent it from causing infinite loops
  // when used in the dependency array
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([
    { category: 'Technical Knowledge', score: 0 },
    { category: 'Problem Solving', score: 0 },
    { category: 'Communication', score: 0 },
    { category: 'Cultural Fit', score: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{
    feedback: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  const [sampleAnswers, setSampleAnswers] = useState<Record<number, string>>({});
  const [loadingAnswers, setLoadingAnswers] = useState<Record<number, boolean>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [copiedState, setCopiedState] = useState<Record<number, boolean>>({});
  const [candidateAnswers, setCandidateAnswers] = useState<Record<number, string>>({});
  const [candidateRatings, setCandidateRatings] = useState<Record<number, number>>({});
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [answerSaved, setAnswerSaved] = useState<Record<number, boolean>>({});

  // Add state variables to track current question and answer for InterviewerSuggestions
  const [currentQuestionForSuggestions, setCurrentQuestionForSuggestions] = useState('');
  const [currentAnswerForSuggestions, setCurrentAnswerForSuggestions] = useState('');

  // Debounce function
  const debounce = <F extends (...args: any[]) => any>(
    fn: F,
    wait: number
  ) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return function(this: any, ...args: Parameters<F>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  // Use callback to create a memoized fetch function for questions
  const fetchQuestionsWithRetry = useCallback(async (techstack: string[], role: string, level: string) => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Create proper array for techstack
      const safeTechstack = Array.isArray(techstack) ? techstack : [];
      console.log('Making API request with:', { safeTechstack, role, level });
      
      // Only make API request if we have necessary data
      if (safeTechstack.length > 0 && role && level) {
        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'questions',
            role,
            level,
            techstack: safeTechstack,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data && Array.isArray(data.questions) && data.questions.length > 0) {
          console.log('Setting questions:', data.questions);
          setQuestions(data.questions);
          
          // Generate tips based on the role and level
          const newTips = [
            `Focus on assessing ${level} ${role} skills, particularly in ${safeTechstack.join(', ')}.`,
            `Ask follow-up questions to understand depth of knowledge in ${safeTechstack[0]}.`,
            `Look for problem-solving abilities relevant to ${role} positions.`,
            `Evaluate communication skills and ability to explain technical concepts.`,
          ];
          
          setTips(newTips);
        } else {
          console.error('Invalid API response format:', data);
          throw new Error("Invalid or empty response from API");
        }
      } else {
        console.log('Using fallback questions - missing required params');
        // Fallback for when we don't have all parameters
        const fallbackTech = safeTechstack.length > 0 ? safeTechstack[0] : 'general technologies';
        setQuestions([
          `What experience do you have with ${fallbackTech}?`,
          `How would you approach troubleshooting a complex issue in a ${role} role?`,
          `Tell me about a challenging ${role} project you've worked on.`,
          `How do you keep your technical skills up-to-date?`,
        ]);
        
        setTips([
          `Focus on assessing general ${role} skills and problem-solving abilities.`,
          `Ask about their experience with relevant technologies.`,
          `Evaluate communication skills and ability to explain technical concepts.`,
          `Look for adaptability and learning capacity.`,
        ]);
      }
    } catch (error) {
      // Reset retry count if this is a new error session
      if (!apiError) {
        setRetryCount(0);
      }
      
      console.error('Error fetching questions:', error);
      
      // Attempt to retry if under max retry limit
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        console.log(`Retrying API request (${retryCount + 1}/${MAX_RETRIES})...`);
        
        // Wait a bit before retrying (exponential backoff)
        setTimeout(() => {
          fetchQuestionsWithRetry(techstack, role, level);
        }, 1000 * Math.pow(2, retryCount));
        
        return;
      }
      
      // Show error after max retries
      setApiError(error instanceof Error ? error.message : "Failed to fetch interview questions");
      
      // Set fallback questions
      const fallbackTech = Array.isArray(techstack) && techstack.length > 0 ? techstack[0] : 'general technologies';
      const fallbackQuestions = [
        `What experience do you have with ${fallbackTech}?`,
        `Describe your experience as a ${role}.`,
        `Tell me about a challenging project you've worked on.`,
        `How do you keep your technical skills up-to-date?`,
      ];
      console.log('Setting fallback questions after error:', fallbackQuestions);
      setQuestions(fallbackQuestions);
      
      // Set fallback tips
      setTips([
        `Focus on assessing general ${role} abilities.`,
        `Ask about their problem-solving approach.`,
        `Evaluate communication skills.`,
        `Look for adaptability and learning capacity.`,
      ]);
    } finally {
      setLoading(false);
    }
  }, [retryCount]);
  
  const fetchQuestions = useCallback(
    debounce((techstack: string[], role: string, level: string) => {
      fetchQuestionsWithRetry(techstack, role, level);
    }, 500),
    [fetchQuestionsWithRetry]
  );

  useEffect(() => {
    if (!interviewComplete) {
      console.log('Fetching questions with params:', { techstack, role, level });
      fetchQuestions(techstack, role, level);
    }
  }, [techstack, role, level, interviewComplete, fetchQuestions]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const copyQuestionToClipboard = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState({ ...copiedState, [index]: true });
    setTimeout(() => {
      setCopiedState({ ...copiedState, [index]: false });
    }, 2000);
  };
  
  const copyAnswerToClipboard = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState({ ...copiedState, [index]: true });
    setTimeout(() => {
      setCopiedState({ ...copiedState, [index]: false });
    }, 2000);
  };

  const handleRatingChange = (index: number, score: number) => {
    const updatedRatings = [...ratings];
    updatedRatings[index].score = score;
    setRatings(updatedRatings);
  };

  const handleCandidateAnswerChange = (index: number, value: string) => {
    setCandidateAnswers(prev => ({ ...prev, [index]: value }));
  };
  
  const handleCandidateRatingChange = (index: number, rating: number) => {
    setCandidateRatings(prev => ({ ...prev, [index]: rating }));
  };

  const saveAnswer = (index: number) => {
    if (!candidateRatings[index]) return;
    
    // Create a standardized text based on the rating
    const ratingText = `Rating: ${candidateRatings[index]}/5 - ${
      candidateRatings[index] === 5 ? 'Excellent answer, demonstrated comprehensive knowledge' :
      candidateRatings[index] === 4 ? 'Good answer, showed solid understanding' :
      candidateRatings[index] === 3 ? 'Satisfactory answer with decent knowledge' :
      candidateRatings[index] === 2 ? 'Basic answer, limited understanding' :
      'Poor answer, significant knowledge gaps'
    }`;
    
    // Add to saved answers
    setSavedAnswers(prev => [
      ...prev, 
      { 
        question: questions[index],
        answer: candidateAnswers[index] || ratingText
      }
    ]);
    
    // Mark this answer as saved
    setAnswerSaved(prev => ({ ...prev, [index]: true }));
    
    // Show success indication briefly
    setTimeout(() => {
      setAnswerSaved(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const handleSubmitFeedback = async () => {
    if (ratings.some(r => r.score === 0)) {
      return;
    }
    
    try {
      setSubmitting(true);
      setApiError(null);
      
      // Use the safe version of techstack here too
      const safeTechstack = Array.isArray(techstack) ? techstack : [];
      
      // Function to make the API call with retry logic
      const makeApiCall = async (retryNum = 0) => {
        try {
          const response = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'feedback',
              role,
              level,
              techstack: safeTechstack,
              ratings,
              notes,
              savedAnswers // Include saved answers in the feedback request
            })
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Check if data contains an error message
          if (data.error) {
            throw new Error(data.error);
          }
          
          return data;
        } catch (error) {
          // Retry logic for API calls
          if (retryNum < MAX_RETRIES) {
            console.log(`Retrying feedback API request (${retryNum + 1}/${MAX_RETRIES})...`);
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryNum)));
            return makeApiCall(retryNum + 1);
          }
          
          // If all retries fail, throw the error
          throw error;
        }
      };
      
      // Call the API with retry logic
      const data = await makeApiCall();
      setFeedback(data);
      
      // Only try to save to database if we have an interviewId
      if (interviewId) {
        try {
          // Save feedback to database
          await fetch(`/api/interviews/${interviewId}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ratings,
              notes,
              feedback: data
            })
          });
          
          // Mark the interview as completed
          await fetch(`/api/interviews/${interviewId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (saveError) {
          console.error('Error saving feedback to database:', saveError);
          setApiError('Feedback generated but could not be saved to database.');
          // Still show feedback even if saving fails
        }
      }
      
      setShowFeedback(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setApiError(error instanceof Error 
        ? error.message 
        : 'Failed to generate feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate a sample answer for a specific question
  const generateSampleAnswer = async (questionIndex: number, question: string) => {
    if (loadingAnswers[questionIndex]) return;
    
    setLoadingAnswers(prev => ({ ...prev, [questionIndex]: true }));
    
    try {
      const safeTechstack = Array.isArray(techstack) ? techstack : [];
      
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          role,
          level,
          techstack: safeTechstack,
          question: question,
          answer: '' // Empty answer to get sample answer instead
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.sampleAnswer) {
        setSampleAnswers(prev => ({ ...prev, [questionIndex]: data.sampleAnswer }));
      } else if (data && data.error) {
        console.error(`API returned error: ${data.error}`);
        throw new Error(data.error);
      } else {
        // Fallback sample answer if response doesn't contain expected data
        console.warn("API didn't return expected sample answer format");
        setSampleAnswers(prev => ({ 
          ...prev, 
          [questionIndex]: `A good ${level} ${role} candidate should demonstrate knowledge of ${safeTechstack.join(', ')}. 
          They should explain concepts clearly and provide relevant examples from their experience.` 
        }));
      }
      
      // Auto-expand the question when answer is loaded
      setExpandedQuestions(prev => ({ ...prev, [questionIndex]: true }));
      
    } catch (error) {
      console.error('Error generating sample answer:', error);
      
      // Fallback sample answer on error
      const safeTechstack = Array.isArray(techstack) ? techstack : [];
      setSampleAnswers(prev => ({ 
        ...prev, 
        [questionIndex]: `For this ${level} ${role} question, look for knowledge of ${safeTechstack[0] || 'relevant technologies'} 
        and clear communication of technical concepts.

        The candidate should demonstrate understanding of core concepts, practical experience, and problem-solving abilities. 
        They should explain their approach clearly, mention relevant technologies, and provide concrete examples.` 
      }));
    } finally {
      setLoadingAnswers(prev => ({ ...prev, [questionIndex]: false }));
    }
  };
  
  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => ({ 
      ...prev, 
      [index]: !prev[index]
    }));
    
    // Generate answer if expanding and no answer exists yet
    if (!expandedQuestions[index] && !sampleAnswers[index]) {
      generateSampleAnswer(index, questions[index]);
    }
  };

  // Update these values when a question is selected
  const selectQuestionForSuggestions = (index: number) => {
    setCurrentQuestionForSuggestions(questions[index]);
    setCurrentAnswerForSuggestions(candidateAnswers[index] || '');
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (interviewComplete && showFeedback && feedback) {
    return (
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 space-y-6">
        <h3 className="text-xl font-bold mb-4">Interview Feedback</h3>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Overall Assessment</h4>
          <p className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">{feedback.feedback}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Strengths</h4>
          <ul className="list-disc pl-5 space-y-1">
            {feedback.strengths.map((strength, i) => (
              <li key={i} className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-2 rounded-lg">{strength}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Areas for Improvement</h4>
          <ul className="list-disc pl-5 space-y-1">
            {feedback.improvements.map((improvement, i) => (
              <li key={i} className="bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 p-2 rounded-lg">{improvement}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (interviewComplete) {
    return (
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 space-y-6">
        <h3 className="text-xl font-bold mb-4">Rate the Interview</h3>
        
        {apiError && (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
          </div>
        )}
        
        {savedAnswers.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Saved Candidate Answers</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {savedAnswers.map((item, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                  <p className="font-medium text-sm mb-1">{item.question}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {ratings.map((rating, index) => (
            <div key={index} className="space-y-2">
              <p className="font-medium">{rating.category}</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(index, star)}
                    className="focus:outline-none"
                  >
                    <StarIcon 
                      className={`w-6 h-6 ${rating.score >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="space-y-2">
            <p className="font-medium">Additional Notes</p>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
              rows={4}
              placeholder="Add any additional feedback or notes about the candidate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSubmitFeedback}
            disabled={ratings.some(r => r.score === 0) || submitting}
          >
            {submitting ? 'Generating Feedback...' : 'Submit Rating & Generate Feedback'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 space-y-6">
      <div className="p-3 mb-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          This interview assistant now uses Llama 3.2 to generate sample answers for questions and analysis of candidate responses.
        </p>
      </div>
    
      {apiError && (
        <div className="p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p>{apiError}</p>
            <p className="mt-1">Using fallback questions instead.</p>
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-xl font-bold mb-4">Interviewer Tips</h3>
        <ul className="space-y-2 list-disc pl-5">
          {tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Add the new InterviewerSuggestions component here */}
      <InterviewerSuggestions 
        role={role}
        level={level}
        techstack={techstack}
        currentQuestion={currentQuestionForSuggestions}
        candidateAnswer={currentAnswerForSuggestions}
      />

      <div>
        <h3 className="text-xl font-bold mb-4">Suggested Questions</h3>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">Click on a question to view sample answers</p>
          <Button 
            size="sm"
            variant="outline"
            onClick={() => {
              questions.forEach((question, index) => {
                if (!sampleAnswers[index]) {
                  generateSampleAnswer(index, question);
                }
              });
            }}
            disabled={questions.length === 0 || questions.every((_, index) => !!sampleAnswers[index])}
          >
            Generate All Answers
          </Button>
        </div>
        {questions.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
            <p>No questions available. This could be due to an API error or missing parameters.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => fetchQuestions(techstack, role, level)}
            >
              Retry Loading Questions
            </Button>
            <div className="mt-3 text-xs text-gray-500">
              Debug info: techstack={JSON.stringify(techstack)}, role={role}, level={level}
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {questions.map((question, index) => (
              <li key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div 
                  className="p-3 flex justify-between items-start cursor-pointer"
                  onClick={() => {
                    toggleQuestion(index);
                    selectQuestionForSuggestions(index);
                  }}
                >
                  <span className="flex-1">{question}</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyQuestionToClipboard(index, question);
                      }}
                      className="text-xs"
                    >
                      {copiedState[index] ? 'Copied!' : 'Copy'}
                    </Button>
                    {expandedQuestions[index] ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedQuestions[index] && (
                  <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 mt-1 pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Sample Answer:</div>
                      {sampleAnswers[index] && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyAnswerToClipboard(index, sampleAnswers[index])}
                          className="text-xs h-6 px-2"
                        >
                          {copiedState[index] ? 'Copied!' : 'Copy Answer'}
                        </Button>
                      )}
                    </div>
                    
                    {loadingAnswers[index] ? (
                      <div className="animate-pulse h-20 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                    ) : (
                      <div className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                        {sampleAnswers[index] || 'Click to generate a sample answer...'}
                      </div>
                    )}
                    
                    {!loadingAnswers[index] && !sampleAnswers[index] && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateSampleAnswer(index, question);
                        }}
                      >
                        Generate Sample Answer
                      </Button>
                    )}
                    
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Rate Candidate's Answer:
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => saveAnswer(index)}
                          disabled={!candidateRatings[index]}
                        >
                          {answerSaved[index] ? (
                            <><Check className="w-3 h-3 mr-1" /> Saved</>
                          ) : (
                            <><Save className="w-3 h-3 mr-1" /> Save Rating</>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex space-x-1 mr-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleCandidateRatingChange(index, star)}
                              className="focus:outline-none"
                            >
                              <StarIcon 
                                className={`w-6 h-6 ${
                                  (candidateRatings[index] || 0) >= star 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {candidateRatings[index] 
                            ? `${candidateRatings[index]}/5 - ${
                                candidateRatings[index] === 5 ? 'Excellent' :
                                candidateRatings[index] === 4 ? 'Good' :
                                candidateRatings[index] === 3 ? 'Satisfactory' :
                                candidateRatings[index] === 2 ? 'Basic' :
                                'Poor'
                              }` 
                            : 'Not rated'}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Optional notes:</label>
                        <textarea
                          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 min-h-[60px]"
                          placeholder="Add any notes about the candidate's answer (optional)..."
                          value={candidateAnswers[index] || ''}
                          onChange={(e) => handleCandidateAnswerChange(index, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InterviewerTips; 