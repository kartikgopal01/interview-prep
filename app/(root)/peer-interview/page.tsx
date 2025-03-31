import React from 'react';
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {getCurrentUser} from "@/lib/actions/auth.action";
import { getPeerInterviews, getUserPeerInterviews } from '@/lib/actions/peer-interview.action';
import PeerInterviewCard from '@/components/PeerInterviewCard';

const PeerInterviewPage = async () => {
    const user = await getCurrentUser();
    
    if (!user) {
        return null; // This will be handled by the layout's authentication check
    }
    
    // Get both user's interviews and available interviews
    const [userPeerInterviews, availablePeerInterviews] = await Promise.all([
        getUserPeerInterviews(user.id),
        getPeerInterviews(user.id) // Pass user ID to exclude their own interviews
    ]);
    
    const hasUserInterviews = userPeerInterviews && userPeerInterviews.length > 0;
    const hasAvailableInterviews = availablePeerInterviews && availablePeerInterviews.length > 0;

    return (
        <>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Practice Interviews With Peers</h2>
                    <p className="text-lg">
                        Create a peer interview to practice with another person, or join an existing interview as an interviewer.
                    </p>
                    
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/peer-interview/create">Create Peer Interview</Link>
                    </Button>
                </div>

                <Image src="/robot2.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden" />
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Peer Interviews</h2>

                <div className="interviews-section">
                    {hasUserInterviews ? (
                        userPeerInterviews?.map((interview) => (
                            <PeerInterviewCard 
                                key={interview.id}
                                id={interview.id}
                                role={interview.role}
                                level={interview.level || 'junior'}
                                techstack={interview.techstack}
                                createdAt={interview.createdAt}
                                status={interview.status || 'pending'}
                                isCreator={true}
                            />
                        ))
                    ) : (
                        <p>You haven't created any peer interviews yet.</p>
                    )}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Available Peer Interviews</h2>

                <div className="interviews-section">
                    {hasAvailableInterviews ? (
                        availablePeerInterviews?.map((interview) => (
                            <PeerInterviewCard 
                                key={interview.id}
                                id={interview.id}
                                role={interview.role}
                                level={interview.level || 'junior'}
                                techstack={interview.techstack}
                                createdAt={interview.createdAt}
                                status={interview.status || 'pending'}
                                isCreator={false}
                            />
                        ))
                    ) : (
                        <p>There are no peer interviews available at the moment. Create one to get started!</p>
                    )}
                </div>
            </section>
        </>
    );
};

export default PeerInterviewPage; 