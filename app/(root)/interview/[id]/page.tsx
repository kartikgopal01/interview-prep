import {getInterviewById} from "@/lib/actions/general.action";
import {redirect} from "next/navigation";
import Image from "next/image";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import Agent from "@/components/Agent";
import {getCurrentUser} from "@/lib/actions/auth.action";

const Page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();
    const interview = await getInterviewById(id);

    if(!interview) redirect('/')

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Interview Header */}
            <div className="companion-list">
                <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                            <Image 
                                src="/robot2.png" 
                                alt="AI Interviewer" 
                                width={40} 
                                height={40} 
                                className="rounded-full object-cover" 
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground capitalize">
                                {interview.role} Interview
                            </h1>
                            <p className="text-muted-foreground">
                                AI-powered interview practice session
                            </p>
                        </div>
                    </div>
                    
                    <div className="subject-badge bg-primary text-white">
                        {interview.type.replace('_', ' ')}
                    </div>
                </div>

                {/* Tech Stack Display */}
                {interview.techstack && interview.techstack.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="text-sm font-semibold text-foreground mb-3">
                            Technologies & Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {interview.techstack.map((tech: string, index: number) => (
                                <span 
                                    key={index} 
                                    className="bg-cta-gold text-black text-sm px-3 py-1.5 rounded-full font-medium"
                                >
                                    {tech.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Interview Agent */}
            <div className="companion-list">
                <div className="space-y-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">
                            Ready for Your Interview?
                        </h2>
                        <p className="text-muted-foreground">
                            Take your time to prepare. The AI interviewer will ask you questions based on the {interview.type.replace('_', ' ')} interview type.
                        </p>
                    </div>
                    
                    <Agent
                        userName={user?.name || ''}
                        userId={user?.id}
                        interviewId={id}
                        type="interview"
                        questions={interview.questions}
                    />
                </div>
            </div>
        </div>
    )
}

export default Page