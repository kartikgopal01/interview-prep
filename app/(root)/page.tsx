import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import {getCurrentUser, } from "@/lib/actions/auth.action";
import {getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import SearchFilter from "@/components/SearchFilter";
import { Suspense } from 'react';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// Color mapping for interview types
const getInterviewColor = (type: string) => {
  const colorMap: { [key: string]: string } = {
    technical: "#FFC8E4", // coding pink
    behavioral: "#BDE7FF", // language blue  
    system_design: "#E5D0FF", // science purple
    mixed: "#FFDA6E", // maths yellow
    frontend: "#FFC8E4", // coding pink
    backend: "#C8FFDF", // biology green
    fullstack: "#FFECC8", // chemistry orange
  };
  
  return colorMap[type.toLowerCase()] || "#E5D0FF"; // default to science purple
};

const Page = async ({ searchParams }: Props) => {
    const user = await getCurrentUser();

    const [userInterviews, latestInterviews] = await Promise.all([
        await getInterviewsByUserId(user?.id!),
        await getLatestInterviews({ userId: user?.id! })
    ]);

    // Apply search and filtering
    const searchTerm = typeof searchParams.search === 'string' 
        ? searchParams.search.toLowerCase() 
        : '';
    const filterValue = typeof searchParams.filter === 'string' 
        ? searchParams.filter 
        : '';
    
    // Filter user interviews
    const filteredUserInterviews = userInterviews?.filter(interview => {
      // Search term matching
      const matchesSearch = !searchTerm || 
        (interview.role || "").toLowerCase().includes(searchTerm) || 
        (interview.type || "").toLowerCase().includes(searchTerm);
      
      // Filter matching
      const matchesFilter = !filterValue || 
        (filterValue === 'all') || 
        (interview.type === filterValue);
      
      return matchesSearch && matchesFilter;
    });
    
    // Filter latest interviews
    const filteredLatestInterviews = latestInterviews?.filter(interview => {
      // Search term matching
      const matchesSearch = !searchTerm || 
        (interview.role || "").toLowerCase().includes(searchTerm) || 
        (interview.type || "").toLowerCase().includes(searchTerm);
      
      // Filter matching
      const matchesFilter = !filterValue || 
        (filterValue === 'all') || 
        (interview.type === filterValue);
      
      return matchesSearch && matchesFilter;
    });

    const hasPastInterviews = (filteredUserInterviews || []).length > 0;
    const hasUpcomingInterviews = (filteredLatestInterviews || []).length > 0;
    
    const filterOptions = [
      { label: 'Technical', value: 'technical' },
      { label: 'Behavioral', value: 'behavioral' },
      { label: 'System Design', value: 'system_design' },
      { label: 'All Interviews', value: 'all' }
    ];

    return (
        <>
            <div className="cta-container">
                <section className="cta-section mx-auto">
                    <div className="cta-badge">
                        Choose Your Practice Mode
                    </div>
                    <h2 className="text-3xl font-bold">
                        Get Interview-Ready with AI-Powered Practice & Peer Feedback
                    </h2>
                    <p className="text-white/90 text-lg leading-relaxed">
                        Practice with our advanced AI interviewer or get real-time feedback from fellow developers. 
                        Choose your preferred learning style.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <Link href="/interview" className="flex-1">
                            <button className="btn-primary w-full justify-center gap-2">
                                <Image src="/robot2.png" alt="AI" width={20} height={20} className="rounded" />
                                AI Interview
                            </button>
                        </Link>
                        <Link href="/peer-interview" className="flex-1">
                            <button className="btn-primary w-full justify-center gap-2 bg-cta-gold text-black hover:bg-cta-gold/90">
                                <Image src="/peer-avatar.png" alt="Peer" width={20} height={20} className="rounded" />
                                Peer Interview
                            </button>
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mt-6 text-center">
                        <div className="space-y-2">
                            <h3 className="font-semibold">AI-Powered</h3>
                            <p className="text-sm text-white/80">Instant feedback & 24/7 availability</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Peer-to-Peer</h3>
                            <p className="text-sm text-white/80">Real human interaction & experience</p>
                        </div>
                    </div>
                </section>
            </div>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>
                
                <Suspense fallback={<div className="animate-pulse h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>}>
                    <SearchFilter 
                        filterOptions={filterOptions} 
                        baseUrl="/" 
                        placeholder="Search by role or interview type..."
                    />
                </Suspense>

                <div className="interviews-section">
                    {hasPastInterviews ? (
                        filteredUserInterviews?.map((interview) => (
                            <InterviewCard 
                                {...interview} 
                                key={interview.id}
                                userId={user?.id}
                                isCreator={true}
                                color={getInterviewColor(interview.type)}
                            />
                        ))) : (
                        <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            {searchTerm || filterValue ? (
                                <p>No matching interviews found. Try adjusting your search or filters.</p>
                            ) : (
                                <p>You haven&apos;t taken any interviews yet</p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>

                <div className="interviews-section">
                    {hasUpcomingInterviews ? (
                        filteredLatestInterviews?.map((interview) => (
                            <InterviewCard 
                                {...interview} 
                                key={interview.id}
                                userId={user?.id}
                                isCreator={false}
                                color={getInterviewColor(interview.type)}
                            />
                        ))) : (
                        <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            {searchTerm || filterValue ? (
                                <p>No matching interviews found. Try adjusting your search or filters.</p>
                            ) : (
                                <p>There are no new interviews available</p>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default Page