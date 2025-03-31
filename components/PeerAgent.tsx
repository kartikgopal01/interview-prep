'use client'

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from './ui/button';
import { updatePeerInterview, createPeerFeedback } from '@/lib/actions/peer-interview.action';
import VideoChat from './VideoChat';

interface PeerAgentProps {
  userName: string;
  userId: string;
  interviewId: string;
  roomId: string;
  role: string;
  level: string;
  isInterviewer: boolean;
  intervieweeId?: string;
  showCards?: boolean;
  canStartCall?: boolean;
}

enum InterviewStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

const PeerAgent = ({ 
  userName, 
  userId, 
  interviewId, 
  roomId, 
  role,
  level,
  isInterviewer,
  intervieweeId,
  showCards = true,
  canStartCall = false
}: PeerAgentProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.PENDING);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [rating, setRating] = useState<number>(3);
  const [videoChatKey, setVideoChatKey] = useState<number>(0);
  const [showVideoChat, setShowVideoChat] = useState(false);
  
  useEffect(() => {
    const activateInterview = async () => {
      if (isInterviewer && status === InterviewStatus.PENDING) {
        try {
          const result = await updatePeerInterview({
            interviewId,
            status: 'active',
            interviewerId: userId
          });
          
          if (result.success) {
            setStatus(InterviewStatus.ACTIVE);
          } else {
            setError('Failed to activate interview. Please try again.');
          }
        } catch (error) {
          setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };
    
    activateInterview();
  }, [isInterviewer, status, interviewId, userId]);
  
  const handleStart = async () => {
    // Set active status first
    setStatus(InterviewStatus.ACTIVE);
    
    // If not using explicit start call, show video with a slight delay
    if (!canStartCall) {
      setTimeout(() => {
        if (!showVideoChat) {
          setShowVideoChat(true);
        }
      }, 500);
    }
  };
  
  const handleComplete = async () => {
    setStatus(InterviewStatus.COMPLETED);
    setShowVideoChat(false);
    
    if (isInterviewer) {
      // We'll show feedback form now
    } else {
      // Redirect to feedback page or home
      router.push(`/peer-interview`);
    }
  };
  
  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      setError('Please provide feedback before submitting.');
      return;
    }
    
    try {
      const result = await createPeerFeedback({
        interviewId,
        interviewerId: userId,
        intervieweeId: intervieweeId || '',
        rating,
        feedback
      });
      
      if (result.success) {
        router.push('/peer-interview');
      } else {
        setError('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const refreshVideoChat = () => {
    console.log('[PeerAgent] Refreshing video chat');
    // First hide the video chat to unmount
    setShowVideoChat(false);
    setError(null);
    
    console.log(`[PeerAgent] Refresh requested by ${isInterviewer ? 'interviewer' : 'interviewee'}`);
    
    // Generate a fresh key with timestamp for uniqueness
    setVideoChatKey(Date.now());
    
    // Wait for component to unmount properly before showing again
    setTimeout(() => {
      console.log('[PeerAgent] Remounting video chat after refresh');
      setShowVideoChat(true);
    }, 1500);
  };

  const handleVideoChatError = (errorMessage: string) => {
    console.error(`[PeerAgent] Video chat error: ${errorMessage}`);
    setError(errorMessage);
  };

  const startVideoChat = () => {
    console.log('[PeerAgent] Starting video chat');
    // Clear any previous errors
    setError(null);
    
    // Generate a fresh key for clean initialization
    setVideoChatKey(Date.now());
    
    // Show the video component with a slight delay to ensure clean mount
    setTimeout(() => {
      console.log('[PeerAgent] Showing video chat after start');
      setShowVideoChat(true);
    }, 500);
  };
  
  // Ready for your interview button for interviewee
  const handleIntervieweeSetup = () => {
    console.log('[PeerAgent] Interviewee setup initiated');
    // Set active status
    setStatus(InterviewStatus.ACTIVE);
    
    // Generate a fresh key
    setVideoChatKey(Date.now());
    
    // Give time for status change to propagate
    setTimeout(() => {
      console.log('[PeerAgent] Showing video chat for interviewee');
      setShowVideoChat(true);
    }, 1000);
  };
  
  // Render based on status and role
  return (
    <div className="flex flex-col items-center w-full">
      {error && (
        <div className="error-message mb-4 p-3 bg-red-100 text-red-700 rounded-md w-full">
          {error}
        </div>
      )}
      
      {showCards && (
        <div className="call-view mb-6">
          <div className="card-interviewer">
            <div className="avatar">
              <Image 
                src={isInterviewer ? "/user-avatar.png" : "/peer-avatar.png"} 
                alt={isInterviewer ? "interviewer" : "interviewee"} 
                width={65} 
                height={54} 
                className="object-cover" 
              />
            </div>
            <h3>{isInterviewer ? "Interviewer" : "Interviewee"}</h3>
          </div>

          <div className="card-border">
            <div className="card-content">
              <Image 
                src={!isInterviewer ? "/user-avatar.png" : "/peer-avatar.png"} 
                alt={!isInterviewer ? "interviewee" : "interviewer"} 
                width={540} 
                height={540} 
                className="rounded-full object-cover size-[120px]" 
              />
              <h3>{userName}</h3>
            </div>
          </div>
        </div>
      )}
      
      {status === InterviewStatus.PENDING && (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-center">
            {isInterviewer 
              ? "You are about to conduct a peer interview." 
              : "Waiting for an interviewer to join..."}
          </p>
          {isInterviewer ? (
            <Button 
              className="btn-call"
              onClick={handleStart}
            >
              Start Interview
            </Button>
          ) : (
            <div className="w-full p-6 border border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4">Ready for your interview?</h3>
              <p className="text-center mb-6">
                While waiting for an interviewer, you can prepare by setting up your video.
              </p>
              <Button
                className="btn-call"
                onClick={handleIntervieweeSetup}
              >
                Set Up Video
              </Button>
            </div>
          )}
        </div>
      )}
      
      {status === InterviewStatus.ACTIVE && (
        <div className="w-full">
          {(!showVideoChat && canStartCall) ? (
            <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center h-[400px]">
              <h3 className="text-xl font-bold mb-6">Ready to Start Video Call</h3>
              <p className="text-center mb-8">
                Click the button below to join the video call for this {isInterviewer ? "interview" : "interview session"}.
              </p>
              <Button
                className="btn-call"
                onClick={startVideoChat}
              >
                Start Video Call
              </Button>
            </div>
          ) : !showVideoChat ? (
            <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center h-[400px]">
              <h3 className="text-xl font-bold mb-6">Interview in Progress</h3>
              <p className="text-center mb-8">
                You are in an active interview session.
              </p>
            </div>
          ) : (
            <div className="video-container">
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
                  <p className="font-medium">{error}</p>
                  <p className="text-sm mt-1">You can try refreshing the video using the button below.</p>
                </div>
              )}
              
              {/* Video Chat */}
              <VideoChat 
                key={videoChatKey}
                roomId={roomId}
                userName={userName}
                role={isInterviewer ? "interviewer" : "interviewee"}
                onError={handleVideoChatError}
              />
              
              <div className="w-full flex justify-center mt-6 gap-4">
                <Button 
                  variant="outline"
                  onClick={refreshVideoChat}
                >
                  Refresh Video
                </Button>
                
                <Button 
                  className="btn-disconnect"
                  onClick={handleComplete}
                >
                  {isInterviewer ? "Complete Interview" : "Leave Interview"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {status === InterviewStatus.COMPLETED && isInterviewer && (
        <div className="w-full max-w-2xl">
          <h3 className="text-xl font-bold mb-4">Provide Feedback</h3>
          
          <div className="mb-4">
            <label className="block mb-2">Rating (1-5)</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={`size-10 rounded-full ${rating === value ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setRating(value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Feedback</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md h-40 bg-transparent"
              placeholder="Provide constructive feedback about the interview..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          
          <Button 
            className="btn-primary w-full"
            onClick={handleSubmitFeedback}
          >
            Submit Feedback
          </Button>
        </div>
      )}
    </div>
  );
};

export default PeerAgent; 