import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const results: any = {
            nodeVersion: process.version,
            platform: process.platform,
            env: process.env.NODE_ENV,
            hasGroqKey: !!process.env.GROQ_API_KEY,
            timestamp: new Date().toISOString(),
        };

        // Test pdf-parse loading
        try {
            const { createRequire } = await import('module');
            const require = createRequire(import.meta.url);
            const pdfParse = require('pdf-parse');
            
            results.pdfParseLoad = 'success';
            results.pdfParseType = typeof pdfParse;
            results.hasPDFParse = !!pdfParse.PDFParse;
            results.hasDefault = !!pdfParse.default;
            results.pdfParseKeys = Object.keys(pdfParse).slice(0, 10);
        } catch (requireError) {
            results.pdfParseLoad = 'failed';
            results.requireError = requireError instanceof Error ? requireError.message : String(requireError);
            
            // Try ESM import
            try {
                const pdfParseModule = await import('pdf-parse');
                results.esmLoad = 'success';
                results.esmType = typeof pdfParseModule;
                results.esmHasPDFParse = !!pdfParseModule.PDFParse;
                results.esmHasDefault = !!pdfParseModule.default;
            } catch (importError) {
                results.esmLoad = 'failed';
                results.importError = importError instanceof Error ? importError.message : String(importError);
            }
        }

        return NextResponse.json({
            success: true,
            debug: results,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}

