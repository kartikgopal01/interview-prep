import dayjs from 'dayjs';
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import Link from "next/link";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import DeleteRegularInterviewButton from '@/components/DeleteRegularInterviewButton';

const InterviewCard = async ({ 
    id, 
    userId, 
    role, 
    type, 
    techstack, 
    createdAt, 
    finalized, 
    isCreator = false,
    color 
}: InterviewCardProps) => {
    const feedback = userId && id ?
        await getFeedbackByInterviewId({ interviewId: id, userId })
        : null;
    
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');

    // Ensure techstack is always an array
    let safeTechstack: string[] = [];
    if (Array.isArray(techstack)) {
        safeTechstack = techstack;
    } else if (typeof techstack === 'string') {
        safeTechstack = techstack.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech.length > 0);
    }

    // Determine button text based on interview status and creator/taker relationship
    let buttonText = 'Start Interview';
    let buttonHref = `/interview/${id}`;
    
    if (isCreator) {
        // For interviews created by this user
        if (feedback) {
            buttonText = 'View Feedback';
            buttonHref = `/interview/${id}/feedback`;
        } else if (finalized === false) {
            // User started their own interview but didn't complete it
            buttonText = 'Continue Interview';
        } else {
            // User created interview but hasn't started it yet
            buttonText = 'Start Interview';
        }
    } else {
        // For interviews created by other users that this user can take
        if (feedback) {
            buttonText = 'View Feedback';
            buttonHref = `/interview/${id}/feedback`;
        } else if (finalized === false) {
            // This would only happen if somehow the user started someone else's interview
            buttonText = 'Continue Interview';
        } else {
            // User hasn't taken this interview yet
            buttonText = 'Start Interview';
        }
    }

    return (
        <>
            {/* Light mode card */}
            <article 
                className="companion-card w-[360px] max-sm:w-full min-h-[400px] relative dark:hidden"
                style={{ backgroundColor: color || '#ffffff' }}
            >
                <div className="flex justify-between items-center">
                    <div className="subject-badge bg-black text-white">
                        {normalizedType}
                    </div>
                    {isCreator && id && (
                        <DeleteRegularInterviewButton interviewId={id} />
                    )}
                </div>

                <h2 className="text-2xl font-bold text-black capitalize">
                    {role} Interview
                </h2>
                
                <p className="text-sm text-black/70">
                    {type.replace('_', ' ')} • {safeTechstack.length} technologies
                </p>
                
                <div className="flex items-center justify-between text-sm text-black/70">
                    <div className="flex items-center gap-2">
                        <Image src="/calendar.svg" alt="calendar" width={16} height={16} />
                        <span>{formattedDate}</span>
                    </div>
                    {feedback && (
                        <div className="flex items-center gap-2">
                            <Image src="/star.svg" alt="star" width={16} height={16} />
                            <span className="font-semibold">{feedback.totalScore}/100</span>
                        </div>
                    )}
                </div>

                {safeTechstack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {safeTechstack.slice(0, 3).map((tech: string, index: number) => (
                            <span key={index} className="bg-cta-gold text-black text-xs px-2 py-1 rounded-full font-medium">
                                {tech.trim()}
                            </span>
                        ))}
                        {safeTechstack.length > 3 && (
                            <span className="bg-black/10 text-black text-xs px-2 py-1 rounded-full font-medium">
                                +{safeTechstack.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                <Link href={buttonHref} className="w-full">
                    <button className="btn-primary w-full justify-center">
                        {buttonText}
                    </button>
                </Link>
            </article>

            {/* Dark mode card */}
            <div className="card-border w-[360px] max-sm:w-full min-h-[400px] hidden dark:block">
                <div className="card-interview relative">
                    <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-secondary">
                        <p className="badge-text text-secondary-foreground">{normalizedType}</p>
                    </div>
                    
                    {isCreator && id && (
                        <div className="absolute top-2 left-2">
                            <DeleteRegularInterviewButton interviewId={id} />
                        </div>
                    )}

                    <div>
                        <Image 
                            src={getRandomInterviewCover()} 
                            alt="cover image" 
                            width={90} 
                            height={90} 
                            className="rounded-full object-cover size-[90px] mt-4" 
                        />

                        <h3 className="mt-5 capitalize text-card-foreground">
                            {role} Interview
                        </h3>

                        <div className="flex flex-row gap-5 mt-3">
                            <div className="flex flex-row gap-2">
                                <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
                                <p className="text-muted-foreground">{formattedDate}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                <Image src="/star.svg" alt="star" width={22} height={22} />
                                <p className="text-muted-foreground">{feedback?.totalScore || '---'}/100</p>
                            </div>
                        </div>

                        <p className="line-clamp-2 mt-5 text-muted-foreground">
                            {feedback?.finalAssessment || 
                             (finalized === false 
                                ? (isCreator 
                                    ? "You've started this interview but haven't completed it yet." 
                                    : "You've started this interview but haven't completed it yet.")
                                : (isCreator 
                                    ? "You created this interview. Start it to practice your skills." 
                                    : "You haven't taken this interview yet. Take it now to improve your skills.")
                                )
                             
                            }
                        </p>
                    </div>

                    <div className="flex flex-row justify-between">
                        <DisplayTechIcons techStack={safeTechstack} />

                        <Link href={buttonHref}>
                            <button className="btn-primary">
                                {buttonText}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InterviewCard; 