import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params first to fix the NextJS error
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    const { ratings, notes, feedback } = await request.json();
    
    // Calculate total score (average of all ratings converted to 0-100 scale)
    const totalScore = Math.round(
      (ratings.reduce((sum: number, rating: { score: number }) => sum + rating.score, 0) / 
      (ratings.length * 5)) * 100
    );
    
    // Create feedback document in Firestore
    const feedbackData = {
      interviewId: id,
      ratings,
      notes,
      feedback,
      totalScore,
      finalAssessment: feedback.feedback,
      createdAt: new Date().toISOString()
    };
    
    // Update interview status to completed
    await db.collection('interviews').doc(id).update({
      status: 'completed',
      finalized: true
    });
    
    // Save feedback document
    await db.collection('feedbacks').add(feedbackData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Feedback saved successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to save feedback'
    }, { status: 500 });
  }
} 