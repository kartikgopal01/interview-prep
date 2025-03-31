'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { randomID } from '@/utils';

interface ZegoTestProps {
  roomId: string;
  userName: string;
  role: string;
}

const ZegoTest = ({ roomId, userName, role }: ZegoTestProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const addLog = (message: string) => {
    console.log(`ZegoTest: ${message}`);
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const connect = async () => {
    if (!containerRef.current) {
      addLog('Container not found');
      return;
    }

    if (isConnecting) {
      addLog('Already connecting');
      return;
    }

    setIsConnecting(true);
    addLog('Starting connection attempt...');

    try {
      setStatus('Loading SDK...');
      const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
      addLog('SDK loaded successfully');

      setStatus('Checking credentials...');
      const appID = Number(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET || '';
      
      addLog(`Credentials check - AppID: ${appID ? 'Yes' : 'No ('+appID+')'}, Secret: ${serverSecret ? 'Yes' : 'No'}`);
      
      if (!appID || !serverSecret) {
        setStatus('Missing credentials');
        addLog('Missing Zego credentials');
        setIsConnecting(false);
        return;
      }

      setStatus('Generating token...');
      const userID = `${role}_${randomID(8)}`;
      addLog(`Generated user ID: ${userID}`);
      
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userID,
        userName || userID
      );
      addLog('Token generated successfully');

      setStatus('Creating instance...');
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      addLog('Zego instance created');

      setStatus('Joining room...');
      if (containerRef.current) {
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: true,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showTextChat: true,
        });
        addLog('Join room called successfully');
        setStatus('Connected');
      } else {
        setStatus('Container lost during connection');
        addLog('Container ref lost during initialization');
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
      addLog(`Error: ${error}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ZegoCloud Test</h3>
        <div className="text-sm text-gray-500">Status: {status}</div>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Test Connection'}
        </Button>
      </div>

      <div className="text-xs p-2 bg-gray-800 rounded text-gray-300">
        <div>Room ID: {roomId}</div>
        <div>User: {userName}</div>
        <div>Role: {role}</div>
      </div>
      
      <div className="h-[400px] bg-black rounded-lg relative overflow-hidden">
        <div
          ref={containerRef}
          className="w-full h-full"
        />
        {status !== 'Connected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
            {status}
          </div>
        )}
      </div>
      
      <details className="text-xs">
        <summary className="cursor-pointer">Logs</summary>
        <pre className="mt-2 p-2 bg-gray-800 rounded text-gray-300 max-h-[200px] overflow-auto">
          {logs.join('\n')}
        </pre>
      </details>
    </div>
  );
};

export default ZegoTest; 