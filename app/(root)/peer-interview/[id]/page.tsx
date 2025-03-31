import React from 'react';
import { getPeerInterviewById, getPeerFeedbackByInterviewId } from '@/lib/actions/peer-interview.action';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { redirect, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dayjs from 'dayjs';
import Image from 'next/image';
import PeerAgent from '@/components/PeerAgent';
import FeedbackInsights from '@/components/FeedbackInsights';

interface SavedAnswer {
  question: string;
  answer: string;
}

interface QuestionRating {
  question: string;
  rating: number;
  notes?: string;
}

interface PeerFeedback {
  id: string;
  interviewId: string;
  feedback: string;
  rating: number;
  createdAt: string;
  savedAnswers?: SavedAnswer[];  // Make savedAnswers optional
  [key: string]: any;  // Allow additional properties
}

interface PeerInterviewPageProps {
  params: {
    id: string;
  };
}

const PeerInterviewPage = async ({ params }: PeerInterviewPageProps) => {
  // Await params to ensure it's fully resolved
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  if (!id) {
    return notFound();
  }
  
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return redirect('/sign-in');
    }
    
    const interview = await getPeerInterviewById(id);
    
    if (!interview) {
      return notFound();
    }
    
    // Check if there's feedback for this interview
    const feedback = await getPeerFeedbackByInterviewId(id);
    
    // Make sure roomId exists
    if (!interview.roomId) {
      return (
        <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-red-500">Error: Invalid Interview</h2>
          <p>This interview is missing a room ID. Please create a new interview.</p>
          <Button asChild className="mt-4 sm:mt-6 w-full sm:w-auto">
            <Link href="/peer-interview/create">Create New Interview</Link>
          </Button>
        </div>
      );
    }
    
    // Only allow the interview creator to access this page
    if (interview.userId !== user.id) {
      return redirect(`/peer-interview/${id}/join`);
    }
    
    const isActive = interview.status === 'active';
    const isCompleted = interview.status === 'completed';
    const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/peer-interview/${id}/join`;
    
    // If the interview is completed and feedback exists, show the feedback
    if (isCompleted && feedback) {
      // Extract question ratings from feedback data if available
      const savedAnswers = ((feedback as PeerFeedback).savedAnswers || []) as SavedAnswer[];
      const questionRatings: QuestionRating[] = savedAnswers.map((item: SavedAnswer) => {
        // Check if the answer contains a rating (e.g., "Rating: 4/5")
        const ratingMatch = typeof item.answer === 'string' && 
          item.answer.match(/Rating:\s*(\d)\/5/);
          
        const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
        
        // Remove the rating prefix from notes if it exists
        const notes = typeof item.answer === 'string' 
          ? item.answer.replace(/Rating:\s*\d\/5\s*-\s*[^,]*/, '').trim() 
          : '';
          
        return {
          question: item.question,
          rating: rating || 0,
          notes: notes || undefined
        };
      });
      
      return (
        <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Interview Feedback</h2>
          
          <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium">Interview Completed</span>
              <span className="text-gray-500 text-sm ml-auto">
                {dayjs(interview.updatedAt).format('MMM D, YYYY')}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Rating</h3>
            <div className="flex mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`size-8 rounded-full flex items-center justify-center mr-1 ${
                    i < feedback.rating ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Feedback</h3>
            <p className="whitespace-pre-line">{feedback.feedback}</p>
            
            <div className="mt-6">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/peer-interview">Back to Interviews</Link>
              </Button>
            </div>
          </div>
          
          {/* Add AI-powered insights with question ratings */}
          <div className="mb-6">
            <FeedbackInsights 
              feedback={feedback.feedback}
              role={interview.role}
              level={interview.level || 'junior'}
              rating={feedback.rating}
              questionRatings={questionRatings.filter((qr: QuestionRating) => qr.rating > 0)}
            />
          </div>
          
          <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Image src="/robot2.png" alt="AI" width={24} height={24} className="mr-2" />
              What's Next?
            </h3>
            <p className="mb-3">
              Based on your feedback, continue improving your interview skills by:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Reviewing the AI insights to understand your strengths and areas for improvement</li>
              <li>Practicing with more peer interviews to build confidence</li>
              <li>Working on specific technical skills related to your role</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/peer-interview/create">Create New Practice Interview</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/interview">Try AI Interview Practice</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    // If the interview is pending or active, show the interview page
    return (
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Your Peer Interview</h2>
        
        <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Share Your Interview Link</h3>
          <p className="mb-4">Share this link with someone who can interview you:</p>
          
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-auto">
            <code className="text-sm break-all">{joinUrl}</code>
          </div>
          
          <Button asChild className="w-full sm:w-auto">
            <Link href={joinUrl} target="_blank">Open Join Link</Link>
          </Button>
        </div>
        
        <PeerAgent
          userName={user.name}
          userId={user.id}
          interviewId={id}
          roomId={interview.roomId}
          role={interview.role}
          level={interview.level}
          isInterviewer={false}
          showCards={false}
          canStartCall={true}
        />
      </div>
    );
  } catch (error) {
    console.error(`Error loading interview page: ${error}`);
    return (
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-red-500">Error Loading Interview</h2>
        <p>There was a problem loading this interview. Please try again.</p>
        <p className="text-sm text-gray-500 mt-2">Error details: {error instanceof Error ? error.message : String(error)}</p>
        <Button asChild className="mt-4 sm:mt-6 w-full sm:w-auto">
          <Link href="/peer-interview">Back to Interviews</Link>
        </Button>
      </div>
    );
  }
};

export default PeerInterviewPage; 