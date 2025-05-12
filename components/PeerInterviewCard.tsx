import dayjs from 'dayjs';
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import DeleteInterviewButton from '@/components/DeleteInterviewButton';

interface PeerInterviewCardProps {
  id: string;
  role: string;
  level: string;
  techstack: string[];
  createdAt: string;
  status: "pending" | "active" | "completed";
  isCreator?: boolean;
}

const PeerInterviewCard = ({ id, role, level, techstack, createdAt, status, isCreator = false }: PeerInterviewCardProps) => {
  const formattedDate = dayjs(createdAt || Date.now()).format('MMM D, YYYY');
  const isAvailable = status === "pending";
  const isCompleted = status === "completed";

  // Determine link and button text based on whether user is creator and status
  const linkHref = isCreator 
    ? `/peer-interview/${id}` 
    : `/peer-interview/${id}/join`;
  
  // Button text
  let buttonText = '';
  if (isCreator) {
    if (isCompleted) {
      buttonText = 'View Feedback';
    } else if (isAvailable) {
      buttonText = 'View Interview';
    } else {
      buttonText = 'Continue Interview';
    }
  } else {
    buttonText = isAvailable ? 'Join as Interviewer' : 'Unavailable';
  }

  // Status display
  let statusDisplay = '';
  let statusColor = '';
  if (isCompleted) {
    statusDisplay = 'Completed';
    statusColor = 'bg-blue-500';
  } else if (isAvailable) {
    statusDisplay = 'Available';
    statusColor = 'bg-green-500';
  } else {
    statusDisplay = 'In Progress';
    statusColor = 'bg-yellow-500';
  }

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview relative">
        <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
          <p className="badge-text">Peer Interview</p>
        </div>
        
        {isCreator && (
          <div className="absolute top-2 left-2">
            <DeleteInterviewButton interviewId={id} />
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
            {role} Interview - {level}
          </h3>

          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
              <p>{statusDisplay}</p>
            </div>
          </div>

          <p className="line-clamp-2 mt-5">
            {isCreator 
              ? isCompleted
                ? "Your interview is completed. Check the feedback from your interviewer."
                : "You created this interview. Wait for someone to join as an interviewer or share the link." 
              : "Join as an interviewer to help someone practice their interview skills in this peer-to-peer session."}
          </p>
        </div>

        <div className="flex flex-row justify-between mt-4">
          <DisplayTechIcons techStack={techstack} />

          <Button className="btn-primary" disabled={!isCreator && !isAvailable}>
            <Link href={isAvailable || isCreator ? linkHref : '#'}>
              {buttonText}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeerInterviewCard; 