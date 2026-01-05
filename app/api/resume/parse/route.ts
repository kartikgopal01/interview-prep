import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// Lazy load pdf-parse to avoid issues in Vercel serverless
// Use a simpler approach that works in both local and Vercel
async function parsePDF(buffer: Buffer): Promise<string> {
    try {
        // Method 1: Try direct require (works in Vercel)
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        const pdfParse = require('pdf-parse');
        
        // Check if it's the v2 API with PDFParse class
        if (pdfParse.PDFParse) {
            const parser = new pdfParse.PDFParse({ data: buffer });
            const result = await parser.getText();
            await parser.destroy();
            return result.text;
        }
        
        // Otherwise use the default function
        console.log('[PDF Parse] Calling pdfParse function...');
        const result = await pdfParse(buffer);
        console.log('[PDF Parse] Result type:', typeof result, 'has text:', !!result?.text);
        
        // pdf-parse returns an object with text property, not a string
        if (result && typeof result === 'object' && result.text) {
            return result.text;
        }
        if (typeof result === 'string') {
            return result;
        }
        throw new Error('Unexpected result format from pdf-parse');
    } catch (error) {
        console.error('PDF parse attempt 1 failed:', error);
        
        // Method 2: Try ESM import
        try {
            const pdfParseModule = await import('pdf-parse');
            const pdfParse = (pdfParseModule as any).default || pdfParseModule;
            
            if (pdfParseModule.PDFParse) {
                const parser = new pdfParseModule.PDFParse({ data: buffer });
                const result = await parser.getText();
                await parser.destroy();
                return result.text;
            }
            
            console.log('[PDF Parse] Calling pdfParse function (ESM)...');
            let result;
            if (typeof pdfParse === 'function') {
                result = await pdfParse(buffer);
            } else {
                const pdfFunc = (pdfParse as any).default || pdfParse;
                result = await pdfFunc(buffer);
            }
            console.log('[PDF Parse] ESM Result type:', typeof result, 'has text:', !!result?.text);
            
            // pdf-parse returns an object with text property
            if (result && typeof result === 'object' && result.text) {
                return result.text;
            }
            if (typeof result === 'string') {
                return result;
            }
            throw new Error('Unexpected result format from pdf-parse (ESM)');
        } catch (importError) {
            console.error('PDF parse attempt 2 failed:', importError);
            throw new Error(`Failed to parse PDF: ${importError instanceof Error ? importError.message : 'Unknown error'}`);
        }
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log('[Resume Parse] Request received at', new Date().toISOString());
    
    try {
        console.log('[Resume Parse] Parsing form data...');
        const formData = await request.formData();
        const file = formData.get('resume') as File;

        if (!file) {
            console.log('[Resume Parse] No file provided');
            return NextResponse.json(
                { success: false, error: 'No resume file provided' },
                { status: 400 }
            );
        }
        
        console.log('[Resume Parse] File received:', {
            name: file.name,
            type: file.type,
            size: file.size,
        });

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
        console.log('[Resume Parse] Starting PDF parsing, buffer size:', buffer.length);
        let resumeText: string;
        try {
            resumeText = await parsePDF(buffer);
            console.log('[Resume Parse] PDF parsed successfully, text length:', resumeText?.length || 0);
            if (!resumeText || resumeText.trim().length === 0) {
                console.warn('[Resume Parse] Warning: Extracted text is empty');
            }
        } catch (parseError) {
            console.error('[Resume Parse] PDF parsing failed:', {
                error: parseError,
                message: parseError instanceof Error ? parseError.message : 'Unknown',
                stack: parseError instanceof Error ? parseError.stack : undefined,
                errorName: parseError instanceof Error ? parseError.name : 'Unknown',
            });
            throw parseError;
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
        const duration = Date.now() - startTime;
        console.error('[Resume Parse] Error parsing resume:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        // Log more details for debugging (always log in Vercel)
        console.error('[Resume Parse] Error details:', {
            message: errorMessage,
            stack: errorStack,
            name: error instanceof Error ? error.name : 'Unknown',
            nodeVersion: process.version,
            platform: process.platform,
            env: process.env.NODE_ENV,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });
        
        // Return error details in production for Vercel debugging
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to parse resume',
                details: errorMessage, // Always return details for Vercel debugging
                errorType: error instanceof Error ? error.name : 'Unknown',
                duration: `${duration}ms`,
            },
            { status: 500 }
        );
    }
}

