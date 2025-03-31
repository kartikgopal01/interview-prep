'use client';

import React from 'react';
import ZegoTest from '@/components/ZegoTest';
import { Button } from '@/components/ui/button';
import { randomID } from '@/utils';

const TestZegoPage = () => {
  const [roomId, setRoomId] = React.useState(`room-${randomID(8)}`);
  const [userName, setUserName] = React.useState(`user-${randomID(4)}`);
  const [envVars, setEnvVars] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  
  const checkEnvVars = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-env');
      const data = await response.json();
      setEnvVars(data);
      console.log('Environment check:', data);
    } catch (error) {
      console.error('Error checking environment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateNewRoomId = () => {
    setRoomId(`room-${randomID(8)}`);
  };
  
  const generateNewUserName = () => {
    setUserName(`user-${randomID(4)}`);
  };
  
  React.useEffect(() => {
    checkEnvVars();
  }, []);
  
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">ZegoCloud Test Page</h1>
      
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
        {loading ? (
          <div>Loading environment variables...</div>
        ) : envVars ? (
          <div>
            <div className="mb-2">
              <div><strong>NEXT_PUBLIC_ZEGOCLOUD_APP_ID:</strong> {envVars.environment.NEXT_PUBLIC_ZEGOCLOUD_APP_ID || 'Not found'}</div>
              <div><strong>NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET:</strong> {envVars.environment.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET || 'Not found'}</div>
              <div><strong>NEXT_PUBLIC_APP_URL:</strong> {envVars.environment.NEXT_PUBLIC_APP_URL || 'Not found'}</div>
            </div>
            <div>
              <strong>Valid Configuration:</strong> {envVars.validZegoConfig ? '✅ Yes' : '❌ No'}
            </div>
          </div>
        ) : (
          <div>Failed to load environment variables</div>
        )}
      </div>
      
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Room ID</label>
            <div className="flex">
              <input 
                type="text" 
                value={roomId} 
                onChange={(e) => setRoomId(e.target.value)} 
                className="flex-1 p-2 border rounded"
              />
              <Button onClick={generateNewRoomId} className="ml-2">Generate</Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1">User Name</label>
            <div className="flex">
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                className="flex-1 p-2 border rounded"
              />
              <Button onClick={generateNewUserName} className="ml-2">Generate</Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test as Interviewee</h2>
          <ZegoTest 
            roomId={roomId}
            userName={`${userName}-interviewee`}
            role="interviewee"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Test as Interviewer</h2>
          <ZegoTest 
            roomId={roomId}
            userName={`${userName}-interviewer`}
            role="interviewer"
          />
        </div>
      </div>
    </div>
  );
};

export default TestZegoPage; 