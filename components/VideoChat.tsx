'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';

// Simple in-memory "signaling" for demo purposes
// In a real app, you'd use a real signaling server
const localSignaling = {
  offers: new Map<string, { offer: RTCSessionDescriptionInit, candidates: RTCIceCandidate[] }>(),
  answers: new Map<string, { answer: RTCSessionDescriptionInit, candidates: RTCIceCandidate[] }>(),
  
  // Store offer for a specific room
  setOffer: (roomId: string, offer: RTCSessionDescriptionInit, candidates: RTCIceCandidate[]) => {
    localSignaling.offers.set(roomId, { offer, candidates });
  },
  
  // Get offer for a specific room
  getOffer: (roomId: string) => {
    return localSignaling.offers.get(roomId);
  },
  
  // Store answer for a specific room
  setAnswer: (roomId: string, answer: RTCSessionDescriptionInit, candidates: RTCIceCandidate[]) => {
    localSignaling.answers.set(roomId, { answer, candidates });
  },
  
  // Get answer for a specific room
  getAnswer: (roomId: string) => {
    return localSignaling.answers.get(roomId);
  },
  
  // Check periodically for new data
  watchForChanges: (roomId: string, onOffer: Function, onAnswer: Function) => {
    const interval = setInterval(() => {
      if (localSignaling.offers.has(roomId)) {
        onOffer(localSignaling.offers.get(roomId));
      }
      if (localSignaling.answers.has(roomId)) {
        onAnswer(localSignaling.answers.get(roomId));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }
};

interface VideoChatProps {
  roomId: string;
  userName: string;
  role: "interviewer" | "interviewee";
  onError?: (errorMessage: string) => void;
}

// Simple direct WebRTC implementation
const VideoChat = ({ roomId, userName, role, onError }: VideoChatProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const iceCandidatesRef = useRef<RTCIceCandidate[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [connectionState, setConnectionState] = useState<string>('new');
  
  // Handle errors safely
  const handleError = (message: string) => {
    console.error(`[VideoChat] Error: ${message}`);
    setError(message);
    setLoading(false);
    if (onError) onError(message);
  };

  // Cleanup function
  const cleanupConnection = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    iceCandidatesRef.current = [];
  }, []);

  // Initialize local video
  const initializeLocalVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      handleError(`Could not access camera or microphone: ${err}`);
      return null;
    }
  }, []);

  // Set up peer connection
  const setupPeerConnection = useCallback((stream: MediaStream) => {
    // ICE servers configuration
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { 
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    };
    
    // Create peer connection
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;
    
    // Set up data channel (only for interviewer)
    if (role === 'interviewer') {
      const dataChannel = peerConnection.createDataChannel('chat');
      dataChannelRef.current = dataChannel;
      
      dataChannel.onopen = () => {
        console.log('[DataChannel] Connection opened');
      };
      
      dataChannel.onmessage = (event) => {
        console.log('[DataChannel] Message received:', event.data);
      };
    } else {
      // Set up data channel handler (for interviewee)
      peerConnection.ondatachannel = (event) => {
        dataChannelRef.current = event.channel;
        
        event.channel.onopen = () => {
          console.log('[DataChannel] Connection opened');
        };
        
        event.channel.onmessage = (e) => {
          console.log('[DataChannel] Message received:', e.data);
        };
      };
    }
    
    // Add local stream to peer connection
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
    
    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      console.log('[PeerConnection] Track received');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnected(true);
        setLoading(false);
      }
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[PeerConnection] New ICE candidate:', event.candidate);
        iceCandidatesRef.current.push(event.candidate);
        
        // If we're the interviewer, update the offer with new candidates
        if (role === 'interviewer' && peerConnection.localDescription) {
          localSignaling.setOffer(roomId, peerConnection.localDescription, iceCandidatesRef.current);
        }
        
        // If we're the interviewee, update the answer with new candidates
        if (role === 'interviewee' && peerConnection.localDescription) {
          localSignaling.setAnswer(roomId, peerConnection.localDescription, iceCandidatesRef.current);
        }
      }
    };
    
    // Handle connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('[PeerConnection] ICE State:', peerConnection.iceConnectionState);
      setConnectionState(peerConnection.iceConnectionState);
      
      if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
        setConnected(true);
        setLoading(false);
      } else if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'closed') {
        setConnected(false);
      }
    };
    
    return peerConnection;
  }, [role, roomId]);

  // Create offer (for interviewer)
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) return;
    
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('[PeerConnection] Offer created:', offer);
      
      // Store offer in local signaling
      localSignaling.setOffer(roomId, offer, iceCandidatesRef.current);
    } catch (err) {
      console.error('[PeerConnection] Error creating offer:', err);
    }
  }, [roomId]);

  // Create answer (for interviewee)
  const createAnswer = useCallback(async (offerData: { offer: RTCSessionDescriptionInit, candidates: RTCIceCandidate[] }) => {
    if (!peerConnectionRef.current) return;
    
    try {
      await peerConnectionRef.current.setRemoteDescription(offerData.offer);
      
      // Add any stored ICE candidates
      for (const candidate of offerData.candidates) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (e) {
          console.error('[PeerConnection] Error adding ICE candidate:', e);
        }
      }
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('[PeerConnection] Answer created:', answer);
      
      // Store answer in local signaling
      localSignaling.setAnswer(roomId, answer, iceCandidatesRef.current);
    } catch (err) {
      console.error('[PeerConnection] Error creating answer:', err);
    }
  }, [roomId]);

  // Complete connection (for interviewer)
  const completeConnection = useCallback(async (answerData: { answer: RTCSessionDescriptionInit, candidates: RTCIceCandidate[] }) => {
    if (!peerConnectionRef.current) return;
    
    try {
      await peerConnectionRef.current.setRemoteDescription(answerData.answer);
      
      // Add any stored ICE candidates
      for (const candidate of answerData.candidates) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (e) {
          console.error('[PeerConnection] Error adding ICE candidate:', e);
        }
      }
      
      console.log('[PeerConnection] Connection established');
    } catch (err) {
      console.error('[PeerConnection] Error completing connection:', err);
    }
  }, []);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    setLoading(true);
    cleanupConnection();
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.RTCPeerConnection) {
      handleError('Your browser does not support WebRTC');
      return;
    }
    
    // Get local media stream
    const stream = await initializeLocalVideo();
    if (!stream) return;
    
    // Set up peer connection
    setupPeerConnection(stream);
    
    // Set up signaling
    const cleanup = localSignaling.watchForChanges(
      roomId,
      // On offer received (for interviewee)
      (offerData: any) => {
        if (role === 'interviewee' && peerConnectionRef.current) {
          createAnswer(offerData);
        }
      },
      // On answer received (for interviewer)
      (answerData: any) => {
        if (role === 'interviewer' && peerConnectionRef.current) {
          completeConnection(answerData);
        }
      }
    );
    
    // Create offer if interviewer
    if (role === 'interviewer') {
      setTimeout(() => {
        createOffer();
      }, 1000);
    }
    
    return cleanup;
  }, [cleanupConnection, initializeLocalVideo, setupPeerConnection, role, roomId, createOffer, createAnswer, completeConnection]);

  // Toggle camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };
  
  // Toggle microphone
  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };
  
  // Share screen
  const shareScreen = async () => {
    if (!peerConnectionRef.current || isScreenSharing) return;
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true
      });
      
      const videoTrack = screenStream.getVideoTracks()[0];
      
      if (localStreamRef.current) {
        // Store the original video track to restore later
        const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
        
        // Replace the video track in the RTCPeerConnection
        const senders = peerConnectionRef.current.getSenders();
        const sender = senders.find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        // Update local video
        if (localVideoRef.current) {
          const newStream = new MediaStream();
          localStreamRef.current.getAudioTracks().forEach(track => newStream.addTrack(track));
          newStream.addTrack(videoTrack);
          localVideoRef.current.srcObject = newStream;
        }
        
        setIsScreenSharing(true);
        
        // Handle the end of screen sharing
        videoTrack.onended = () => {
          stopScreenSharing(originalVideoTrack);
        };
      }
    } catch (e) {
      console.error("Error sharing screen:", e);
    }
  };
  
  // Stop screen sharing
  const stopScreenSharing = (originalVideoTrack?: MediaStreamTrack) => {
    if (!peerConnectionRef.current || !isScreenSharing) return;
    
    try {
      if (originalVideoTrack) {
        // Replace the screen track with the original video track
        const senders = peerConnectionRef.current.getSenders();
        const sender = senders.find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(originalVideoTrack);
        }
        
        // Update local video
        if (localVideoRef.current && localStreamRef.current) {
          const newStream = new MediaStream();
          localStreamRef.current.getAudioTracks().forEach(track => newStream.addTrack(track));
          newStream.addTrack(originalVideoTrack);
          localVideoRef.current.srcObject = newStream;
        }
      }
      
      setIsScreenSharing(false);
    } catch (e) {
      console.error("Error stopping screen share:", e);
    }
  };
  
  // Retry connection
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    initializeWebRTC();
  };
  
  // Initialize on component mount
  useEffect(() => {
    if (!roomId || !userName) {
      handleError('Missing required parameters: roomId or userName');
      return;
    }

    console.log(`[VideoChat] Initializing for ${role} in room ${roomId}`);
    
    let cleanup: (() => void) | undefined;
    
    // Initialize with a slight delay to ensure DOM is ready
    const initTimer = setTimeout(async () => {
      const cleanupFn = await initializeWebRTC();
      if (typeof cleanupFn === 'function') {
        cleanup = cleanupFn;
      }
    }, 1000);
    
    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      if (cleanup) cleanup();
      cleanupConnection();
    };
  }, [roomId, userName, role, initializeWebRTC, cleanupConnection]);
  
  // Error state UI
  if (error) {
    return (
      <div className="min-h-[400px] h-full flex items-center justify-center bg-gray-900 border border-gray-700 rounded-lg">
        <div className="text-center p-6 max-w-md">
          <h3 className="text-red-500 text-xl mb-3">Video Connection Error</h3>
          <p className="text-white mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full">
              Retry Connection
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main component UI
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Local video */}
        <div className="relative w-full h-auto aspect-video bg-gray-800 rounded-lg overflow-hidden">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            You ({userName}) - {role}
          </div>
        </div>
        
        {/* Remote video */}
        <div className="relative w-full h-auto aspect-video bg-gray-800 rounded-lg overflow-hidden">
          {connected ? (
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">Waiting for {role === "interviewer" ? "interviewee" : "interviewer"} to join room: {roomId}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 p-2 bg-gray-800 rounded-lg">
        <Button
          onClick={toggleMicrophone}
          variant={isMicOn ? "default" : "destructive"}
          className="flex items-center gap-2"
        >
          {isMicOn ? "Mute" : "Unmute"}
        </Button>
        
        <Button
          onClick={toggleCamera}
          variant={isCameraOn ? "default" : "destructive"}
          className="flex items-center gap-2"
        >
          {isCameraOn ? "Hide Camera" : "Show Camera"}
        </Button>
        
        <Button
          onClick={isScreenSharing ? () => stopScreenSharing() : shareScreen}
          variant={isScreenSharing ? "destructive" : "outline"}
          className="flex items-center gap-2"
        >
          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
        </Button>
        
        <Button
          onClick={handleRetry}
          variant="secondary"
          className="flex items-center gap-2"
        >
          Reconnect
        </Button>
      </div>
      
      {/* Status info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>
          Room: {roomId} • Role: {role} • Connection: 
          <span className={
            connectionState === 'connected' || connectionState === 'completed' ? ' text-green-500' : 
            connectionState === 'checking' ? ' text-yellow-500' : 
            connectionState === 'failed' ? ' text-red-500' : ' text-blue-500'
          }> {connectionState}</span>
        </p>
      </div>
      
      {/* Loading overlay */}
      {loading && !connected && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white mb-2">Connecting to video call...</p>
            <p className="text-gray-300 text-sm mb-6">Waiting for {role === "interviewer" ? "interviewee" : "interviewer"} to join room: {roomId}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChat; 