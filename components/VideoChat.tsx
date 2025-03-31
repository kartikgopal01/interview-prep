'use client';

import * as React from 'react';
import { Button } from './ui/button';

// Helper function to generate random ID
const randomID = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create a global registry to track all joined rooms
const joinedRoomRegistry = new Map();

interface VideoChatProps {
  roomId: string;
  userName: string;
  role: "interviewer" | "interviewee";
  onError?: (errorMessage: string) => void;
}

const VideoChat = ({ roomId, userName, role, onError }: VideoChatProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = React.useState(0);
  const [zegoModule, setZegoModule] = React.useState<any>(null);
  
  // Handle errors safely
  const handleError = (message: string) => {
    console.error(`[VideoChat] Error: ${message}`);
    setError(message);
    setLoading(false);
    if (onError) onError(message);
  };

  // Retry connection
  const handleRetry = () => {
    console.log(`[VideoChat] Retry attempt #${connectionAttempts + 1}`);
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    setLoading(true);
    setError(null);
    setConnectionAttempts(prev => prev + 1);
    initializeZego();
  };

  // Load Zego module dynamically
  const loadZegoModule = React.useCallback(async () => {
    try {
      if (!zegoModule) {
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
        setZegoModule(ZegoUIKitPrebuilt);
        return ZegoUIKitPrebuilt;
      }
      return zegoModule;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error loading Zego module';
      throw new Error(`Failed to load Zego module: ${errorMessage}`);
    }
  }, [zegoModule]);

  // Initialize Zego
  const initializeZego = React.useCallback(async () => {
    // Clear any previous content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    // Track this attempt
    const currentAttempt = connectionAttempts + 1;
    console.log(`[VideoChat] Initialization attempt #${currentAttempt}`);
    
    // If too many attempts, suggest page reload
    if (currentAttempt > 3) {
      console.log('[VideoChat] Too many initialization attempts');
      handleError("Multiple connection attempts failed. Please try reloading the page.");
      return null;
    }
    
    try {
      // Load Zego module
      const ZegoUIKitPrebuilt = await loadZegoModule();
      if (!ZegoUIKitPrebuilt) {
        throw new Error('Failed to load Zego module');
      }
      
      // Get environment variables
      const appId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID;
      const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET;
      
      if (!appId || !serverSecret) {
        throw new Error('Missing Zego credentials. Please check environment variables.');
      }
      
      // Generate a unique user ID
      const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Generate token
      const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
        parseInt(appId), 
        serverSecret, 
        roomId, 
        userId, 
        userName
      );
      
      // Create instance
      const zegoInstance = ZegoUIKitPrebuilt.create(token);
      
      if (!containerRef.current) {
        throw new Error('Video container not found');
      }
      
      // Configure the room
      const config = {
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        turnOnCameraWhenJoining: true,
        turnOnMicrophoneWhenJoining: true,
        showScreenSharingButton: true,
        showTextChat: false,
        showUserList: false,
        branding: {
          logoURL: '',
        },
        sharedLinks: [],
        onJoinRoom: () => {
          console.log('[VideoChat] Successfully joined room');
          setLoading(false);
          setError(null);
        },
        onLeaveRoom: () => {
          console.log('[VideoChat] Left room');
        },
        onError: (error: any) => {
          console.error('[VideoChat] Zego error:', error);
          handleError(`Video chat error: ${error?.message || 'Unknown error'}`);
        }
      };
      
      // Join room
      zegoInstance.joinRoom(config);
      
      // Safety timeout in case onJoinRoom doesn't fire
      setTimeout(() => {
        if (loading) {
          console.log('[VideoChat] Safety timeout triggered - setting loading to false');
          setLoading(false);
        }
      }, 8000);
      
      return zegoInstance;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      handleError(`Failed to initialize: ${errorMessage}`);
      return null;
    }
  }, [roomId, userName, role, loading, connectionAttempts, onError, loadZegoModule]);

  React.useEffect(() => {
    // Validate required props
    if (!roomId || !userName) {
      handleError('Missing required parameters: roomId or userName');
      return;
    }

    console.log(`[VideoChat] Initializing for ${role} in room ${roomId}`);
    
    let zegoInstance: any = null;
    let mounted = true;
    
    // Safety timeout to prevent infinite loading
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.log('[VideoChat] Long safety timeout triggered');
        setLoading(false);
        handleError('Connection timed out. Please try again.');
      }
    }, 15000);
    
    // Initialize with a slight delay to ensure DOM is ready
    const initTimer = setTimeout(async () => {
      if (mounted) {
        try {
          zegoInstance = await initializeZego();
        } catch (error) {
          handleError(`Failed to initialize video chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }, 500);
    
    // Cleanup function
    return () => {
      console.log('[VideoChat] Component unmounting, cleaning up');
      mounted = false;
      clearTimeout(safetyTimer);
      clearTimeout(initTimer);
      
      // Clean up Zego instance
      if (zegoInstance) {
        try {
          zegoInstance.destroy();
        } catch (e) {
          console.error('[VideoChat] Error during cleanup:', e);
        }
      }
    };
  }, [roomId, userName, role, initializeZego]);
  
  // Error state UI
  if (error) {
    return (
      <div className="min-h-[400px] h-[600px] flex items-center justify-center bg-gray-900 border border-gray-700 rounded-lg">
        <div className="text-center p-6 max-w-md">
          <h3 className="text-red-500 text-xl mb-3">Video Connection Error</h3>
          <p className="text-white mb-4">{error}</p>
          <div className="space-y-2">
            {connectionAttempts < 3 ? (
              <Button onClick={handleRetry} className="w-full">
                Retry Connection
              </Button>
            ) : null}
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
      <div 
        ref={containerRef} 
        className="h-[600px] border border-gray-300 dark:border-gray-700 rounded-lg"
      >
        {/* Zego will mount here */}
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white mb-2">Connecting to video call...</p>
            <p className="text-gray-300 text-sm mb-6">This may take a few moments</p>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              className="mt-2"
            >
              Manual Connect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChat; 