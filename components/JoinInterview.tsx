'use client';

import React from 'react';
import VideoChat from './VideoChat';
import { Button } from './ui/button';
import Link from 'next/link';
import InterviewerTips from './InterviewerTips';

interface JoinInterviewProps {
  roomId: string;
  userName: string;
  interviewId: string;
  role: string;
  level: string;
  techstack: string[];
}

const JoinInterview = ({ roomId, userName, interviewId, role, level, techstack }: JoinInterviewProps) => {
  const [error, setError] = React.useState<string | null>(null);
  const [showDebug, setShowDebug] = React.useState(false);
  const [key, setKey] = React.useState(0); // Used to force remounting the VideoChat component
  const [activated, setActivated] = React.useState(false); // Track whether we manually set "active" state
  const [interviewComplete, setInterviewComplete] = React.useState(false);
  
  // Log the current state for debugging
  React.useEffect(() => {
    console.log(`JoinInterview: Room ID: ${roomId}, User: ${userName}, Role: ${role}, Activated: ${activated}`);
  }, [roomId, userName, role, activated]);
  
  // Check if we need to manually mark the interview as active by calling API
  React.useEffect(() => {
    const activateInterview = async () => {
      if (activated) return; // Skip if already activated
      
      try {
        console.log(`Attempting to activate interview ${interviewId}`);
        // We don't actually have the API endpoint, but would call it here
        // await fetch(`/api/interviews/${interviewId}/activate`, { method: 'POST' });
        setActivated(true);
      } catch (error) {
        console.error('Failed to activate interview:', error);
      }
    };
    
    activateInterview();
  }, [interviewId, activated]);
  
  const handleRetry = () => {
    console.log('Manually retrying video connection');
    setKey(prev => prev + 1); // Change the key to force remounting
  };

  const handleCompleteInterview = async () => {
    try {
      // API call to mark interview as completed
      // await fetch(`/api/interviews/${interviewId}/complete`, { method: 'POST' });
      setInterviewComplete(true);
    } catch (error) {
      console.error('Failed to complete interview:', error);
    }
  };
  
  // Ensure room ID is valid
  const safeRoomId = roomId || `manual-${interviewId}`;
  
  return (
    <div className="mb-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded-lg space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold capitalize">{role} Interview</h3>
          <p className="text-gray-500 dark:text-gray-400">Level: {level || 'Junior'}</p>
          <p className="mt-1 sm:mt-2 text-sm">Room ID: {safeRoomId}</p>
          <p className="mt-1 sm:mt-2 text-sm">Interview ID: {interviewId}</p>
        </div>
        <div className="flex items-center space-x-2">
          {interviewComplete ? (
            <>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Interview Completed</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Ready to Join</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap justify-end gap-2">
        {!interviewComplete && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              Retry Video Connection
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              <Link href="/test-zego" target="_blank">Test in New Tab</Link>
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleCompleteInterview}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              Complete Interview
            </Button>
          </>
        )}
      </div>
      
      {showDebug && !interviewComplete && (
        <div className="p-3 sm:p-4 border rounded-md text-xs bg-black bg-opacity-10 text-gray-300 overflow-auto">
          <div>Room ID: {safeRoomId}</div>
          <div>Original Room ID: {roomId || 'not provided'}</div>
          <div>User Name: {userName}</div>
          <div>Role: interviewer</div>
          <div>Interview ID: {interviewId}</div>
          <div>Activated: {String(activated)}</div>
          <div>Environment Check: <a href="/api/debug-env" target="_blank" className="text-blue-400 underline">Check Environment Variables</a></div>
        </div>
      )}
      
      {error ? (
        <div className="p-4 sm:p-6 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-red-500">Error Joining Call</h3>
          <p className="text-sm sm:text-base">{error}</p>
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto"
            >
              Reload Page
            </Button>
            <Button 
              variant="outline"
              onClick={handleRetry}
              className="w-full sm:w-auto"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          {!interviewComplete && (
            <div>
              <VideoChat 
                key={key}
                roomId={safeRoomId}
                userName={userName}
                role="interviewer"
              />
            </div>
          )}
        </>
      )}
      
      <InterviewerTips 
        role={role}
        level={level}
        techstack={techstack}
        interviewId={interviewId}
        interviewComplete={interviewComplete}
      />
    </div>
  );
};

export default JoinInterview;