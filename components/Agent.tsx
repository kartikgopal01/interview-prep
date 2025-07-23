'use client';

import Image from "next/image";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import { vapi } from '@/lib/vapi.sdk';
import {interviewer} from "@/constants";
import {createFeedback} from "@/lib/actions/general.action";

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
            setError(null); // Clear any previous errors
        };
        
        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
            setError(null); // Clear any previous errors
        };

        const onMessage = (message: Message) => {
            if(message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript }
                setMessages((prev) => [...prev, newMessage]);
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => {
            console.error('[Agent] VAPI error:', error);
            setError(error.message || 'Connection error occurred');
            setCallStatus(CallStatus.INACTIVE);
        };

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }
    }, []);

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log('Generate feedback here.');

        const { success, feedbackId: id } = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messages,
        })

        if(success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log('Error saving feedback');
            router.push('/');
        }
    }

    useEffect(() => {
        if(callStatus === CallStatus.FINISHED) {
            if(type === 'generate') {
                router.push('/')
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, type, userId]);

    const handleCall = async () => {
        try {
            setError(null); // Clear any previous errors
            setCallStatus(CallStatus.CONNECTING);

            if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
                throw new Error('VAPI configuration is missing. Please check your environment setup.');
            }

            if(type === 'generate') {
                if (!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID) {
                    throw new Error('VAPI workflow ID is missing. Please check your environment setup.');
                }
                
                console.log('[DEBUG] userName:', userName);
                console.log('[DEBUG] userId:', userId);
                console.log('[DEBUG] Sending to VAPI:', { username: userName, userid: userId });
                
                await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
                    variableValues: {
                        username: userName,
                        userid: userId,
                        name: userName,
                        userName: userName,
                        user_name: userName,
                        userID: userId,
                        user_id: userId,
                    }
                });
            } else {
                let formattedQuestions = '';

                if(questions) {
                    formattedQuestions = questions
                        .map((question) => `- ${question}`)
                        .join('\n');
                }

                await vapi.start(interviewer, {
                    variableValues: {
                        questions: formattedQuestions
                    }
                });
            }
        } catch (error) {
            console.error('[Agent] Failed to start call:', error);
            setError(error instanceof Error ? error.message : 'Failed to start the interview. Please try again.');
            setCallStatus(CallStatus.INACTIVE);
        }
    }

    const handleDisconnect = async () => {
        try {
            setCallStatus(CallStatus.FINISHED);
            await vapi.stop();
        } catch (error) {
            console.error('[Agent] Error stopping call:', error);
            // Force the call to end even if there's an error
            setCallStatus(CallStatus.FINISHED);
        }
    }

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <div className="space-y-6">
            {/* Interview Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Interviewer Card */}
                <div className="companion-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <div className="text-center space-y-4">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                                <Image 
                                    src="/robot2.png" 
                                    alt="AI Interviewer" 
                                    width={48} 
                                    height={48} 
                                    className="object-cover rounded-full" 
                                />
                            </div>
                            {isSpeaking && (
                                <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-75"></div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">AI Interviewer</h3>
                            <p className="text-sm text-muted-foreground">Ready to conduct your interview</p>
                        </div>
                        <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
                            callStatus === CallStatus.ACTIVE ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                callStatus === CallStatus.ACTIVE ? "bg-green-500" : "bg-gray-400"
                            )}></div>
                            {callStatus === CallStatus.ACTIVE ? "Speaking" : "Ready"}
                        </div>
                    </div>
                </div>

                {/* User Card */}
                <div className="companion-card bg-gradient-to-br from-cta-gold/10 to-cta-gold/5 border-cta-gold/20">
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cta-gold to-cta-gold/80 flex items-center justify-center shadow-lg">
                                <Image 
                                    src="/avatar.png" 
                                    alt="User Avatar" 
                                    width={48} 
                                    height={48} 
                                    className="object-cover rounded-full" 
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">{userName}</h3>
                            <p className="text-sm text-muted-foreground">Interview Candidate</p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Ready to interview
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="companion-list bg-red-50 border-red-200">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-red-800">Connection Error</h4>
                            <p className="text-red-700 mt-1">{error}</p>
                            <p className="text-sm text-red-600 mt-2">Please try refreshing the page or check your connection.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Transcript */}
            {messages.length > 0 && (
                <div className="companion-list bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <h4 className="font-semibold text-blue-900">Live Transcript</h4>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className={cn(
                                'text-gray-800 leading-relaxed transition-opacity duration-500 opacity-0', 
                                'animate-fadeIn opacity-100'
                            )}>
                                {latestMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button 
                        className={cn(
                            "btn-primary px-8 py-3 text-lg font-semibold transition-all duration-200",
                            callStatus === CallStatus.CONNECTING && "opacity-75 cursor-not-allowed"
                        )}
                        onClick={handleCall}
                        disabled={callStatus === CallStatus.CONNECTING}
                    >
                        {callStatus === CallStatus.CONNECTING ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Connecting...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                                {isCallInactiveOrFinished ? 'Start Interview' : 'Starting...'}
                            </div>
                        )}
                    </button>
                ) : (
                    <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2"
                        onClick={handleDisconnect}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        End Interview
                    </button>
                )}
            </div>
        </div>
    );
};

export default Agent