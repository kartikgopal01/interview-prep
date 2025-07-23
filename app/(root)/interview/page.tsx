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
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-foreground">AI Interview Practice</h1>
                <p className="text-muted-foreground text-lg">Master your interview skills with personalized AI feedback</p>
            </div>

            <div className="cta-container">
                <div className="cta-section mx-auto">
                    <div className="space-y-4">
                        <div className="cta-badge">
                            🤖 AI-Powered
                        </div>
                        <h2 className="text-3xl font-bold">Practice with an AI Interviewer</h2>
                        <p className="text-white/90 text-lg leading-relaxed">
                            Our advanced AI will simulate a real interview experience based on your preferences.
                            Get instant feedback and improve your skills with every practice session.
                        </p>
                        <div className="pt-4">
                            <Link href="#generate-section" className="btn-primary justify-center">
                                Start New Practice Interview
                            </Link>
                    </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Your Interview History</h3>
                    <p className="text-muted-foreground">Track your progress and review past sessions</p>
                </div>
                
                <Suspense fallback={
                    <div className="animate-pulse h-12 w-full bg-muted rounded-lg"></div>
                }>
                    <SearchFilter 
                        filterOptions={filterOptions} 
                        baseUrl="/interview" 
                        placeholder="Search by role or interview type..."
                    />
                </Suspense>
                
                <div className="companions-grid">
                    {filteredInterviews && filteredInterviews.length > 0 ? (
                        filteredInterviews.map((interview) => (
                            <div key={interview.id} className="companion-card bg-white">
                                <div className="flex justify-between items-center">
                                    <div className="subject-badge bg-primary text-white">
                                        {interview.type}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(interview.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-foreground">{interview.role}</h2>
                                
                                <div className="space-y-2">
                                    {interview.techstack && interview.techstack.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {interview.techstack.slice(0, 3).map((tech: string, index: number) => (
                                                <span key={index} className="bg-cta-gold text-black text-xs px-2 py-1 rounded-full">
                                                    {tech.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {interview.finalized ? 'Completed' : 'In Progress'}
                                    </div>
                                </div>

                                <Link href={`/interview/${interview.id}`} className="w-full">
                                    <button className="btn-primary w-full justify-center">
                                        {interview.finalized ? 'View Results' : 'Continue Interview'}
                                    </button>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="companion-list text-center py-16 col-span-full">
                            {searchTerm || filterValue ? (
                                <div className="space-y-4">
                                    <div className="text-6xl">🔍</div>
                                    <h3 className="text-xl font-semibold text-foreground">No matching interviews found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-6xl">🚀</div>
                                    <h3 className="text-xl font-semibold text-foreground">Ready to start your interview journey?</h3>
                                    <p className="text-muted-foreground">Create your first AI-powered interview practice session below!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div id="generate-section" className="space-y-6 border-t border-border pt-8">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Generate New Interview</h3>
                    <p className="text-muted-foreground">Customize your practice session</p>
                </div>
                <div className="companion-list">
                <Agent userName={user?.name || ""} userId={user?.id} type="generate" />
                </div>
            </div>
        </div>
    );
};

export default InterviewPage;