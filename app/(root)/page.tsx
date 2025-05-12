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
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
                    <p className="text-lg">
                        Practice on real interview questions & get instant feedback
                    </p>
                    
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>

                <Image src="/robot2.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden" />
            </section>

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