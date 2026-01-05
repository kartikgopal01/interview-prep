import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// Import pdf-parse at top level for better compatibility
// Use dynamic import to handle both ESM and CommonJS
let pdfParseModule: any = null;
const loadPdfParse = async () => {
    if (!pdfParseModule) {
        try {
            pdfParseModule = await import('pdf-parse');
        } catch (error) {
            // Fallback for CommonJS environments
            const { createRequire } = await import('module');
            const require = createRequire(import.meta.url);
            pdfParseModule = require('pdf-parse');
        }
    }
    return pdfParseModule;
};

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

        // Parse PDF using pdf-parse
        let resumeText: string;
        const pdfParse = await loadPdfParse();
        
        try {
            // Try v2 API first (PDFParse class)
            if (pdfParse.PDFParse) {
                const parser = new pdfParse.PDFParse({ data: buffer });
                const result = await parser.getText();
                resumeText = result.text;
                await parser.destroy();
            } else if (pdfParse.default) {
                // ESM default export
                resumeText = await pdfParse.default(buffer);
            } else {
                // CommonJS or direct function
                resumeText = await pdfParse(buffer);
            }
        } catch (parseError) {
            console.error('PDF parsing error:', parseError);
            throw new Error(`Failed to parse PDF: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        if (!resumeText || resumeText.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Could not extract text from resume' },
                { status: 400 }
            );
        }

        // Use AI to extract structured information from resume
        // Check for GROQ API key
        if (!process.env.GROQ_API_KEY) {
            console.error('GROQ_API_KEY is not set');
            // Fallback: extract basic info without AI
            const nameMatch = resumeText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
            const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
            
            return NextResponse.json({
                success: true,
                data: {
                    name: nameMatch ? nameMatch[1] : 'Candidate',
                    email: emailMatch ? emailMatch[1] : '',
                    phone: phoneMatch ? phoneMatch[0] : '',
                    skills: [],
                    experience: resumeText.substring(0, 500),
                    education: '',
                    summary: resumeText.substring(0, 200),
                    rawText: resumeText,
                },
            });
        }

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        // Log more details in production for debugging
        console.error('Resume parsing error details:', {
            message: errorMessage,
            stack: errorStack,
            name: error instanceof Error ? error.name : 'Unknown',
        });
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to parse resume',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}

