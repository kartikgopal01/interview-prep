import React from 'react';
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {getCurrentUser} from "@/lib/actions/auth.action";
import { getPeerInterviews, getUserPeerInterviews } from '@/lib/actions/peer-interview.action';
import PeerInterviewCard from '@/components/PeerInterviewCard';
import SearchFilter from '@/components/SearchFilter';
import { Suspense } from 'react';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const PeerInterviewPage = async ({ searchParams }: Props) => {
    const user = await getCurrentUser();
    
    if (!user) {
        return null; // This will be handled by the layout's authentication check
    }
    
    // Get both user's interviews and available interviews
    const [userPeerInterviews, availablePeerInterviews] = await Promise.all([
        getUserPeerInterviews(user.id),
        getPeerInterviews(user.id) // Pass user ID to exclude their own interviews
    ]);
    
    // Apply search and filtering
    const searchTerm = typeof searchParams.search === 'string' 
        ? searchParams.search.toLowerCase() 
        : '';
    const filterValue = typeof searchParams.filter === 'string' 
        ? searchParams.filter 
        : '';
    
    // Filter user's interviews
    const filteredUserInterviews = userPeerInterviews?.filter(interview => {
        // Search term matching
        const matchesSearch = !searchTerm || 
            interview.role?.toLowerCase().includes(searchTerm) || 
            interview.techstack?.some(tech => tech.toLowerCase().includes(searchTerm));
        
        // Filter matching
        const matchesFilter = !filterValue || 
            interview.status === filterValue || 
            interview.level === filterValue;
        
        return matchesSearch && matchesFilter;
    });
    
    // Filter available interviews
    const filteredAvailableInterviews = availablePeerInterviews?.filter(interview => {
        // Search term matching
        const matchesSearch = !searchTerm || 
            interview.role?.toLowerCase().includes(searchTerm) || 
            interview.techstack?.some(tech => tech.toLowerCase().includes(searchTerm));
        
        // Filter matching
        const matchesFilter = !filterValue || 
            interview.status === filterValue || 
            interview.level === filterValue;
        
        return matchesSearch && matchesFilter;
    });
    
    const hasUserInterviews = filteredUserInterviews && filteredUserInterviews.length > 0;
    const hasAvailableInterviews = filteredAvailableInterviews && filteredAvailableInterviews.length > 0;

    const filterOptions = [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Junior', value: 'junior' },
        { label: 'Mid-level', value: 'mid-level' },
        { label: 'Senior', value: 'senior' }
    ];

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
                
                <Suspense fallback={<div className="animate-pulse h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>}>
                    <SearchFilter 
                        filterOptions={filterOptions} 
                        baseUrl="/peer-interview" 
                        placeholder="Search by role or technology..."
                    />
                </Suspense>

                <div className="interviews-section">
                    {hasUserInterviews ? (
                        filteredUserInterviews?.map((interview) => (
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
                        <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            {searchTerm || filterValue ? (
                                <p>No matching interviews found. Try adjusting your search or filters.</p>
                            ) : (
                                <p>You haven't created any peer interviews yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Available Peer Interviews</h2>

                <div className="interviews-section">
                    {hasAvailableInterviews ? (
                        filteredAvailableInterviews?.map((interview) => (
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
                        <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            {searchTerm || filterValue ? (
                                <p>No matching interviews available. Try adjusting your search or filters.</p>
                            ) : (
                                <p>There are no peer interviews available at the moment. Create one to get started!</p>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default PeerInterviewPage; 