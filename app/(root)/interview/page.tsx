import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import SearchFilter from "@/components/SearchFilter";
import { Suspense } from 'react';
import Agent from '@/components/Agent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


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

const InterviewPage = async ({ searchParams }: Props) => {
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
            <section className="relative rounded-2xl border bg-card text-card-foreground dark:bg-card dark:border-border">
                <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                    <div className="space-y-5">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Get interview‑ready with a modern AI platform
                        </h1>
                        <p className="text-muted-foreground">Practice technical, behavioral, and system design interviews with instant insights. Collaborate with peers when you want human feedback.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button asChild size="lg">
                                <Link href="#generate-section">Start AI Interview</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/peer-interview">Join Peer Interview</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <Card className="shadow-sm dark:bg-input/20 dark:border-input">
                            <CardHeader>
                                <CardTitle className="text-xl">Why practice here?</CardTitle>
                                <CardDescription>Master your interview skills with our comprehensive platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid gap-3 text-sm text-muted-foreground dark:text-card-foreground/80">
                                    <li>• AI-powered personalized feedback</li>
                                    <li>• Real-time peer collaboration</li>
                                    <li>• Comprehensive question database</li>
                                    <li>• Progress tracking and analytics</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>

                <Suspense fallback={<div className="animate-pulse h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>}>
                    <SearchFilter
                        filterOptions={filterOptions}
                        baseUrl="/interview"
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

            <div id="generate-section" className="space-y-6 border-t border-border pt-8 mt-8">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Generate New Interview</h3>
                    <p className="text-muted-foreground">Customize your practice session</p>
                </div>
                <Card className="max-w-3xl mx-auto dark:bg-input/20 dark:border-input">
                    <CardContent className="p-0">
                        <Agent userName={user?.name || ""} userId={user?.id} type="generate" />
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default InterviewPage;