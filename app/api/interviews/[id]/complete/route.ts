import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { completePeerInterview } from '@/lib/actions/general.action';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params first to fix the NextJS error
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    // Mark the interview as completed
    const result = await completePeerInterview(id);
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false,
        message: 'Failed to complete interview'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Interview marked as completed'
    }, { status: 200 });
  } catch (error) {
    console.error('Error completing interview:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to complete interview'
    }, { status: 500 });
  }
} 