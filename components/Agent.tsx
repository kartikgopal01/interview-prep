'use client';

import Image from "next/image";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import { vapi } from '@/lib/vapi.sdk';
import {interviewer} from "@/constants";
import {createFeedback} from "@/lib/actions/general.action";
import { Button } from './ui/button';
import { Label } from './ui/label';
import { toast } from 'sonner';

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
    const hasSubmittedRef = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: '',
        level: 'mid',
        type: 'technical',
        techstack: [] as string[],
        techInput: '',
        amount: 5
    });

    // VAPI event handlers for voice interviews
    useEffect(() => {
        if (type === 'interview') {
            const onCallStart = () => {
                setCallStatus(CallStatus.ACTIVE);
                setError(null);
            };
            
            const onCallEnd = () => {
                setCallStatus(CallStatus.FINISHED);
                setError(null);
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
        }
    }, [type]);

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log('Generate feedback here.');

        if (!messages || messages.length === 0) {
            console.warn('No transcript messages captured; skipping feedback submission.');
            toast.error('No transcript captured. Please try again.');
            return;
        }

        try {
            const { success, feedbackId: id, error: saveError } = await createFeedback({
                interviewId: interviewId!,
                userId: userId!,
                transcript: messages,
            });

            if (success && id) {
                toast.success('Feedback generated');
                router.push(`/interview/${interviewId}/feedback`);
            } else {
                console.error('Error saving feedback', saveError);
                toast.error(saveError || 'Could not save feedback. Please try again.');
                // allow retry
                hasSubmittedRef.current = false;
            }
        } catch (err) {
            console.error('Unexpected error saving feedback', err);
            toast.error('Unexpected error while saving feedback. Please try again.');
            hasSubmittedRef.current = false;
        }
    }

    useEffect(() => {
        if (
            type === 'interview' &&
            callStatus === CallStatus.FINISHED &&
            messages.length > 0 &&
            !hasSubmittedRef.current
        ) {
            // allow a brief delay for any final transcripts to flush in
            hasSubmittedRef.current = true;
            const timeout = setTimeout(() => {
                handleGenerateFeedback(messages);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [messages, callStatus, type, userId]);

    // Form handlers for creating new interviews
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTech = () => {
        if (formData.techInput.trim() !== '') {
            setFormData((prev) => ({
                ...prev,
                techstack: [...prev.techstack, prev.techInput.trim()],
                techInput: '',
            }));
        }
    };

    const handleRemoveTech = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            techstack: prev.techstack.filter((_, i) => i !== index),
        }));
    };

    const handleCreateInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.role) {
            toast.error('Please enter a job role');
            return;
        }
        if (formData.techstack.length === 0) {
            toast.error('Please add at least one technology');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/vapi/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: formData.type,
                    role: formData.role,
                    level: formData.level,
                    techstack: formData.techstack.join(','),
                    amount: formData.amount,
                    userid: userId
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Interview created successfully!');
                router.push('/interview');
            } else {
                toast.error('Failed to create interview');
            }
        } catch (error) {
            console.error('Error creating interview:', error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // VAPI handlers for voice interviews
    const handleCall = async () => {
        try {
            setError(null);
            setCallStatus(CallStatus.CONNECTING);

            if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
                throw new Error('VAPI configuration is missing. Please check your environment setup.');
            }

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
            setCallStatus(CallStatus.FINISHED);
        }
    }

    // If this is for creating a new interview (generate type), show the form
    if (type === 'generate') {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Create AI Interview</h3>
                    <p className="text-muted-foreground">Customize your practice session with AI-generated questions</p>
                </div>

                {/* Interview Creation Form */}
                <div className="companion-card">
                    <form onSubmit={handleCreateInterview} className="space-y-6">
                        {/* Job Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Job Role</Label>
                            <input
                                id="role"
                                name="role"
                                type="text"
                                placeholder="e.g. Frontend Developer, Backend Engineer, Full Stack Developer"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:border-primary transition-colors"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Experience Level */}
                        <div className="space-y-2">
                            <Label htmlFor="level">Experience Level</Label>
                            <select
                                id="level"
                                name="level"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:border-primary transition-colors"
                                value={formData.level}
                                onChange={handleInputChange}
                            >
                                <option value="junior">Junior (0-2 years)</option>
                                <option value="mid">Mid-level (2-5 years)</option>
                                <option value="senior">Senior (5+ years)</option>
                            </select>
                        </div>

                        {/* Question Type */}
                        <div className="space-y-2">
                            <Label htmlFor="type">Question Focus</Label>
                            <select
                                id="type"
                                name="type"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:border-primary transition-colors"
                                value={formData.type}
                                onChange={handleInputChange}
                            >
                                <option value="technical">Technical Questions</option>
                                <option value="behavioral">Behavioral Questions</option>
                                <option value="mixed">Mixed (Technical + Behavioral)</option>
                            </select>
                        </div>

                        {/* Technologies */}
                        <div className="space-y-2">
                            <Label htmlFor="techInput">Technologies</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="techInput"
                                    name="techInput"
                                    type="text"
                                    placeholder="e.g. React, Node.js, TypeScript"
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:border-primary transition-colors"
                                    value={formData.techInput}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTech();
                                        }
                                    }}
                                />
                                <Button 
                                    type="button" 
                                    onClick={handleAddTech}
                                    variant="outline"
                                    className="px-4 py-3"
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.techstack.map((tech, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full"
                                    >
                                        <span className="text-sm">{tech}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTech(index)}
                                            className="text-red-500 text-sm font-bold hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Number of Questions */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Number of Questions</Label>
                            <select
                                id="amount"
                                name="amount"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:border-primary transition-colors"
                                value={formData.amount}
                                onChange={handleInputChange}
                            >
                                <option value={3}>3 Questions</option>
                                <option value={5}>5 Questions</option>
                                <option value={7}>7 Questions</option>
                                <option value={10}>10 Questions</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            className="w-full btn-primary py-3 text-lg font-semibold" 
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating Interview...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Generate AI Interview
                                </div>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // For existing interviews (type="interview"), show the VAPI voice interface
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