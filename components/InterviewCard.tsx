import dayjs from 'dayjs';
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import Link from "next/link";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import DeleteRegularInterviewButton from '@/components/DeleteRegularInterviewButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        <Card className="w-[360px] max-sm:w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground capitalize">{normalizedType}</span>
              {isCreator && id ? <DeleteRegularInterviewButton interviewId={id} /> : null}
            </div>
            <CardTitle className="text-xl capitalize">{role} Interview</CardTitle>
            <CardDescription className="text-sm">{type.replace('_', ' ')} • {safeTechstack.length} technologies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Image src="/calendar.svg" alt="calendar" width={16} height={16} />
                <span>{formattedDate}</span>
              </div>
              {feedback && (
                <div className="flex items-center gap-2">
                  <Image src="/star.svg" alt="star" width={16} height={16} />
                  <span className="font-medium">{feedback.totalScore}/100</span>
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
                  <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                    +{safeTechstack.length - 3} more
                  </span>
                )}
              </div>
            )}

            <p className="line-clamp-2 text-muted-foreground">
              {feedback?.finalAssessment || 
                (finalized === false
                  ? (isCreator
                      ? "You've started this interview but haven't completed it yet."
                      : "You've started this interview but haven't completed it yet.")
                  : (isCreator
                      ? "You created this interview. Start it to practice your skills."
                      : "You haven't taken this interview yet. Take it now to improve your skills."))}
            </p>

            <div className="flex items-center justify-between">
              <DisplayTechIcons techStack={safeTechstack} />
              <Button asChild>
                <Link href={buttonHref}>{buttonText}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
    );
};

export default InterviewCard; 