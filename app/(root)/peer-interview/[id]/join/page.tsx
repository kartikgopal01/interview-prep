import React from 'react';
import { getPeerInterviewById } from '@/lib/actions/peer-interview.action';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PeerAgent from '@/components/PeerAgent';
import InterviewerTips from '@/components/InterviewerTips';

interface JoinPeerInterviewPageProps {
  params: {
    id: string;
  };
}

export default async function JoinPeerInterviewPage({ params }: JoinPeerInterviewPageProps) {
  // Await params to ensure it's fully resolved
  const resolvedParams = await Promise.resolve(params);
  const interviewId = resolvedParams.id;
  
  if (!interviewId) {
    return notFound();
  }
  
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return redirect('/sign-in');
    }
    
    const interview = await getPeerInterviewById(interviewId);
    
    if (!interview) {
      return (
        <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-red-500">Interview Not Found</h2>
          <p className="mb-4 sm:mb-6">The interview you're trying to join doesn't exist or has been removed.</p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href="/peer-interview">Back to Interviews</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/peer-interview/create">Create New Interview</Link>
            </Button>
          </div>
        </div>
      );
    }
    
    // If the user is the interview creator, show message instead of redirecting
    if (interview.userId === user.id) {
      return (
        <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">You Created This Interview</h2>
          <p className="mb-2 sm:mb-4">You cannot join as an interviewer because you created this interview.</p>
          <p className="mb-4 sm:mb-6">Please share the join link with someone else to conduct the interview.</p>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/peer-interview/${interviewId}`}>Go to Interview Page</Link>
          </Button>
        </div>
      );
    }
    
    // If the interview is completed, show a message
    if (interview.status === 'completed') {
      return (
        <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Interview Completed</h2>
          <p className="mb-4 sm:mb-6">This interview has already been completed and is no longer available.</p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href="/peer-interview">Back to Interviews</Link>
            </Button>
          </div>
        </div>
      );
    }
    
    // If the interview already has an interviewer and it's not this user, show a message
    if (interview.interviewerId && interview.interviewerId !== user.id) {
      return (
        <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Interview Unavailable</h2>
          <p className="mb-4 sm:mb-6">This interview already has an interviewer and is in progress.</p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href="/peer-interview">Back to Interviews</Link>
            </Button>
          </div>
        </div>
      );
    }
    
    // Otherwise, show the interviewer view
    return (
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Join as Interviewer</h2>
        
        <div className="p-4 mb-6 border border-gray-300 dark:border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold capitalize mb-2">{interview.role} Interview - {interview.level || 'Junior'}</h3>
          <p className="mb-4">You are joining as the interviewer for this peer interview session.</p>
        </div>
        
        <PeerAgent
          userName={user.name}
          userId={user.id}
          interviewId={interviewId}
          roomId={interview.roomId}
          role={interview.role}
          level={interview.level || 'junior'}
          isInterviewer={true}
          intervieweeId={interview.userId}
          showCards={false}
          canStartCall={true}
        />
        
        <div className="mt-8">
          <InterviewerTips 
            role={interview.role}
            level={interview.level || 'junior'}
            techstack={interview.techstack || []}
            interviewId={interviewId}
            interviewComplete={false}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Error loading join page: ${error}`);
    return (
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-red-500">Error Joining Interview</h2>
        <p>There was a problem joining this interview. Please try again.</p>
        <p className="text-sm text-gray-500 mt-2">Error details: {error instanceof Error ? error.message : String(error)}</p>
        <Button asChild className="mt-4 sm:mt-6 w-full sm:w-auto">
          <Link href="/peer-interview">Back to Interviews</Link>
        </Button>
      </div>
    );
  }
}