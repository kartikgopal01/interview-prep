import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";
import SearchFilter from "@/components/SearchFilter";
import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from 'react';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const InterviewPage = async ({ searchParams }: Props) => {
    const user = await getCurrentUser();
    
    // Get user's interviews with a fallback for undefined user ID
    const userId = user?.id || "";
    const interviews = await getInterviewsByUserId(userId);
    
    // Apply search and filtering
    const searchTerm = typeof searchParams.search === 'string' 
        ? searchParams.search.toLowerCase() 
        : '';
    const filterValue = typeof searchParams.filter === 'string' 
        ? searchParams.filter 
        : '';
    
    // Filter interviews
    const filteredInterviews = interviews?.filter(interview => {
      // Search term matching (using the correct fields from the Interview interface)
      const matchesSearch = !searchTerm || 
        (interview.role || "").toLowerCase().includes(searchTerm) || 
        (interview.type || "").toLowerCase().includes(searchTerm);
      
      // Filter matching
      const matchesFilter = !filterValue || 
        (filterValue === 'all') || 
        (interview.type === filterValue);
      
      return matchesSearch && matchesFilter;
    });
    
    const filterOptions = [
      { label: 'Technical', value: 'technical' },
      { label: 'Behavioral', value: 'behavioral' },
      { label: 'System Design', value: 'system_design' },
      { label: 'All Interviews', value: 'all' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h3 className="text-xl font-semibold">AI Interview Practice</h3>

            <div className="blue-gradient-dark rounded-3xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-4 max-w-lg">
                    <h2 className="text-2xl font-bold">Practice with an AI Interviewer</h2>
                    <p className="text-light-100">
                        Our AI will simulate a real interview experience based on your preferences.
                        Get instant feedback and improve your skills.
                    </p>
                    <Button asChild className="btn-primary mt-2">
                        <Link href="#generate-section">Start New Practice Interview</Link>
                    </Button>
                </div>
                <div className="w-64 h-64 relative hidden sm:block">
                    <img 
                        src="/robot2.png" 
                        alt="AI Interviewer" 
                        className="object-contain"
                        width={240}
                        height={240}
                    />
                </div>
            </div>
            
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Your Interview History</h3>
                
                <Suspense fallback={<div className="animate-pulse h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>}>
                    <SearchFilter 
                        filterOptions={filterOptions} 
                        baseUrl="/interview" 
                        placeholder="Search by role or interview type..."
                    />
                </Suspense>
                
                <div className="interviews-section">
                    {filteredInterviews && filteredInterviews.length > 0 ? (
                        filteredInterviews.map((interview) => (
                            <InterviewCard 
                                key={interview.id}
                                id={interview.id}
                                role={interview.role}
                                type={interview.type}
                                techstack={interview.techstack}
                                createdAt={interview.createdAt}
                                userId={userId}
                                finalized={interview.finalized}
                            />
                        ))
                    ) : (
                        <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            {searchTerm || filterValue ? (
                                <p>No matching interviews found. Try adjusting your search or filters.</p>
                            ) : (
                                <p>You haven't taken any interviews yet. Start your first one below!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div id="generate-section" className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-6">Generate New Interview</h3>
                <Agent userName={user?.name || ""} userId={user?.id} type="generate" />
            </div>
        </div>
    );
};

export default InterviewPage;