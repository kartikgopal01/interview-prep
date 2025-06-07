import { NextRequest, NextResponse } from 'next/server';
import { deleteInterview } from '@/lib/actions/general.action';
import { getCurrentUser } from '@/lib/actions/auth.action';

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { interviewId } = await req.json();
    
    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
    }
    
    const result = await deleteInterview(interviewId, user.id);
    
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 