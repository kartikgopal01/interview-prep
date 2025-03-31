'use client';

import React from 'react';
import VideoChat from './VideoChat';
import { Button } from './ui/button';
import Link from 'next/link';

interface InterviewViewProps {
  roomId: string;
  userName: string;
  interviewId: string;
  role: string;
  level: string;
  joinUrl: string;
  isActive: boolean;
}

const InterviewView = ({ roomId, userName, interviewId, role, level, joinUrl, isActive }: InterviewViewProps) => {
  const [error, setError] = React.useState<string | null>(null);
  const [showDebug, setShowDebug] = React.useState(false);
  const [key, setKey] = React.useState(0); // Used to force remounting the VideoChat component
  const [forceShow, setForceShow] = React.useState(false); // Allow user to manually show video
  
  // Log the current state for debugging
  React.useEffect(() => {
    console.log(`InterviewView: Room ID: ${roomId}, Active: ${isActive}, User: ${userName}, ForceShow: ${forceShow}`);
  }, [roomId, isActive, userName, forceShow]);
  
  const handleRetry = () => {
    console.log('Manually retrying video connection');
    setKey(prev => prev + 1); // Change the key to force remounting
  };
  
  // If we should display the video chat component (active or forced)
  const shouldShowVideo = isActive || forceShow;
  
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold capitalize">{role} Interview</h3>
          <p className="text-gray-500 dark:text-gray-400">Level: {level || 'Junior'}</p>
          <p className="mt-2 text-sm">Room ID: {roomId}</p>
          <p className="mt-2 text-sm">Interview ID: {interviewId}</p>
          <p className="mt-2 text-sm">Status: {isActive ? 'active' : 'pending'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${!isActive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span>{isActive ? 'In Progress' : '...'}</span>
        </div>
      </div>
      
      {!shouldShowVideo ? (
        <div className="p-4 sm:p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
          <h3 className="text-lg sm:text-xl mb-2 sm:mb-4">Waiting for an interviewer to join...</h3>
          <p>Share this link with someone who can interview you:</p>
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto">
            <code className="text-xs sm:text-sm break-all">{joinUrl}</code>
          </div>
          <div className="mt-4 space-y-3 sm:space-y-4">
            <Button asChild className="w-full sm:w-auto">
              <Link href={joinUrl} target="_blank" rel="noopener noreferrer">
                Open Join Link
              </Link>
            </Button>
            
            <div>
              <Button 
                onClick={() => setForceShow(true)} 
                variant="outline"
                className="mt-2 sm:mt-4 w-full sm:w-auto"
              >
                Start Video Chat Anyway
              </Button>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Click this if you shared the link but the status isn't updating
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex justify-end mb-2 space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
            >
              Retry Video Connection
            </Button>
          </div>
          
          {/* {showDebug && (
            <div className="mb-4 p-4 border rounded-md text-xs bg-black bg-opacity-10 text-gray-300 overflow-auto">
              <div>Room ID: {roomId}</div>
              <div>User Name: {userName}</div>
              <div>Role: interviewee</div>
              <div>Interview ID: {interviewId}</div>
              <div>Active: {String(isActive)}</div>
              <div>Force Show: {String(forceShow)}</div>
              <div>Environment Check: <a href="/api/debug-env" target="_blank" className="text-blue-400 underline">Check Environment Variables</a></div>
            </div>
          )} */}
          
          <VideoChat 
            key={key}
            roomId={roomId}
            userName={userName}
            role="interviewee"
          />
          
          <div className="p-4 sm:p-6 border border-gray-300 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Tips for the Interview</h3>
            <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>Speak clearly and take your time to think before answering.</li>
              <li>If you don't understand a question, ask for clarification.</li>
              <li>Explain your thought process as you work through problems.</li>
              <li>Be honest about what you know and don't know.</li>
              <li>Ask thoughtful questions at the end of the interview.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewView;