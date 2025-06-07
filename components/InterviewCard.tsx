import dayjs from 'dayjs';
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
    isCreator = false 
}: InterviewCardProps) => {
    const feedback = userId && id ?
        await getFeedbackByInterviewId({ interviewId: id, userId })
        : null;
    
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');

    // Determine button text based on interview status and creator/taker relationship
    let buttonText = 'Start Interview';
    let buttonHref = `/interview/${id}`;
    
    if (isCreator) {
        // For interviews created by this user
        if (feedback) {
            buttonText = 'Check Feedback';
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
            buttonText = 'Check Feedback';
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
        <div className="card-border w-[360px] max-sm:w-full min-h-96">
            <div className="card-interview relative">
                <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
                    <p className="badge-text">{normalizedType}</p>
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
                        className="rounded-full object-fit size-[90px] mt-4" 
                    />

                    <h3 className="mt-5 capitalize">
                        {role} Interview
                    </h3>

                    <div className="flex flex-row gap-5 mt-3">
                        <div className="flex flex-row gap-2">
                            <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
                            <p>{formattedDate}</p>
                        </div>

                        <div className="flex flex-row gap-2 items-center">
                            <Image src="/star.svg" alt="star" width={22} height={22} />
                            <p>{feedback?.totalScore || '---'}/100</p>
                        </div>
                    </div>

                    <p className="line-clamp-2 mt-5">
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
                    <DisplayTechIcons techStack={techstack} />

                    <Button className="btn-primary">
                        <Link href={buttonHref}>
                            {buttonText}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard; 