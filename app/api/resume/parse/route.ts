import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('resume') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No resume file provided' },
                { status: 400 }
            );
        }

        // Check file type
        const fileType = file.type;
        if (fileType !== 'application/pdf') {
            return NextResponse.json(
                { success: false, error: 'Only PDF files are supported' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Import pdf-parse v2 API - uses PDFParse class
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        const { PDFParse } = require('pdf-parse');
        
        // Create parser instance with buffer data
        const parser = new PDFParse({ data: buffer });
        
        // Extract text from PDF using the new v2 API
        const result = await parser.getText();
        const resumeText = result.text;
        
        // Clean up parser resources
        await parser.destroy();

        if (!resumeText || resumeText.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Could not extract text from resume' },
                { status: 400 }
            );
        }

        // Use AI to extract structured information from resume
        const { text: extractedData } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            prompt: `Extract key information from the following resume text. Return a JSON object with the following structure:
{
  "name": "Full name of the candidate",
  "email": "Email address if found",
  "phone": "Phone number if found",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": "Summary of work experience",
  "education": "Summary of education",
  "summary": "Brief professional summary"
}

Resume text:
${resumeText}

Return only the JSON object, no additional text.`,
        });

        // Parse the extracted data
        let resumeData;
        try {
            // Clean the response to extract JSON
            const jsonMatch = extractedData.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                resumeData = JSON.parse(jsonMatch[0]);
            } else {
                resumeData = JSON.parse(extractedData);
            }
        } catch (parseError) {
            console.error('Error parsing extracted data:', parseError);
            // Fallback: extract name manually from resume text
            const nameMatch = resumeText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
            resumeData = {
                name: nameMatch ? nameMatch[1] : 'Candidate',
                email: '',
                phone: '',
                skills: [],
                experience: resumeText.substring(0, 500),
                education: '',
                summary: resumeText.substring(0, 200),
            };
        }

        return NextResponse.json({
            success: true,
            data: {
                ...resumeData,
                rawText: resumeText,
            },
        });
    } catch (error) {
        console.error('Error parsing resume:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to parse resume' },
            { status: 500 }
        );
    }
}

