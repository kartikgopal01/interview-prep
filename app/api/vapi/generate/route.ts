import { createGroq } from '@ai-sdk/groq';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import {getRandomInterviewCover} from "@/lib/utils";
import {db} from "@/firebase/admin";

export async function GET() {
    return Response.json({ success: true, data: 'THANK YOU!'}, { status: 200 });
}

export async function POST(request: Request) {
    const { type, role, level, techstack, amount, userid, resumeData } = await request.json();

    try {
        let prompt = `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.`;
        
        // Add tech stack only if provided
        if (techstack && techstack.trim() !== '') {
            prompt += `\n        The tech stack used in the job is: ${techstack}.`;
        }
        
        prompt += `\n        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.`;

        // Add resume context if available
        if (resumeData) {
            prompt += `\n\nThe candidate's resume information:
        Name: ${resumeData.name || 'Candidate'}
        Skills: ${resumeData.skills?.join(', ') || 'Not specified'}
        Experience: ${resumeData.experience || 'Not specified'}
        Education: ${resumeData.education || 'Not specified'}
        Summary: ${resumeData.summary || 'Not specified'}
        
        Please tailor the questions based on the candidate's resume. Ask questions that relate to their specific experience, skills, and background. Make the questions personalized and relevant to their resume.`;
        }

        prompt += `\n\nPlease return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3`;

        const { text: questions } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            prompt,
        });

        const interview = {
            role, type, level,
            techstack: techstack && techstack.trim() !== '' ? techstack.split(',') : [],
            questions: JSON.parse(questions),
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
            resumeData: resumeData || null
        }

        await db.collection("interviews").add(interview);

        return Response.json({ success: true}, {status: 200})
    } catch (error) {
        console.error(error);

        return Response.json({ success: false, error }, { status: 500 });
    }
}