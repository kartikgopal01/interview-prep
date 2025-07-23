import dayjs from 'dayjs';
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
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

// Color mapping for peer interview status
const getPeerInterviewColor = (status: string, level: string) => {
  // Primary color based on status
  const statusColorMap: { [key: string]: string } = {
    pending: "#BDE7FF", // language blue - waiting
    active: "#C8FFDF", // biology green - in progress
    completed: "#E5D0FF", // science purple - done
  };
  
  // Fallback based on level if status color not found
  const levelColorMap: { [key: string]: string } = {
    junior: "#FFECC8", // chemistry orange
    "mid-level": "#FFDA6E", // maths yellow
    senior: "#FFC8E4", // coding pink
  };
  
  return statusColorMap[status.toLowerCase()] || levelColorMap[level.toLowerCase()] || "#BDE7FF";
};

const PeerInterviewCard = ({ id, role, level, techstack, createdAt, status, isCreator = false }: PeerInterviewCardProps) => {
  const formattedDate = dayjs(createdAt || Date.now()).format('MMM D, YYYY');
  const isAvailable = status === "pending";
  const isCompleted = status === "completed";
  const cardColor = getPeerInterviewColor(status, level);

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
    <>
      {/* Light mode card */}
      <article 
        className="companion-card w-[360px] max-sm:w-full min-h-[400px] relative dark:hidden"
        style={{ backgroundColor: cardColor }}
      >
        <div className="flex justify-between items-center">
          <div className="subject-badge bg-black text-white">
            Peer Interview
          </div>
          {isCreator && (
            <DeleteInterviewButton interviewId={id} />
          )}
        </div>

        <h2 className="text-2xl font-bold text-black capitalize">
          {role} Interview
        </h2>
        
        <p className="text-sm text-black/70">
          {level} level • {techstack?.length || 0} technologies
        </p>
        
        <div className="flex items-center justify-between text-sm text-black/70">
          <div className="flex items-center gap-2">
            <Image src="/calendar.svg" alt="calendar" width={16} height={16} />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
            <span>{statusDisplay}</span>
          </div>
        </div>

        {techstack && techstack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techstack.slice(0, 3).map((tech: string, index: number) => (
              <span key={index} className="bg-cta-gold text-black text-xs px-2 py-1 rounded-full font-medium">
                {tech.trim()}
              </span>
            ))}
            {techstack.length > 3 && (
              <span className="bg-black/10 text-black text-xs px-2 py-1 rounded-full font-medium">
                +{techstack.length - 3} more
              </span>
            )}
          </div>
        )}

        <Link href={isAvailable || isCreator ? linkHref : '#'} className="w-full">
          <button 
            className="btn-primary w-full justify-center"
            disabled={!isCreator && !isAvailable}
          >
            {buttonText}
          </button>
        </Link>
      </article>

      {/* Dark mode card */}
      <div className="card-border w-[360px] max-sm:w-full min-h-[400px] hidden dark:block">
        <div className="card-interview relative">
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-secondary">
            <p className="badge-text text-secondary-foreground">Peer Interview</p>
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
              className="rounded-full object-cover size-[90px] mt-4" 
            />

            <h3 className="mt-5 capitalize text-card-foreground">
              {role} Interview - {level}
            </h3>

            <div className="flex flex-row gap-5 mt-3">
              <div className="flex flex-row gap-2">
                <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
                <p className="text-muted-foreground">{formattedDate}</p>
              </div>

              <div className="flex flex-row gap-2 items-center">
                <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                <p className="text-muted-foreground">{statusDisplay}</p>
              </div>
            </div>

            <p className="line-clamp-2 mt-5 text-muted-foreground">
              {isCreator 
                ? isCompleted
                  ? "Your interview is completed. Check the feedback from your interviewer."
                  : "You created this interview. Wait for someone to join as an interviewer or share the link." 
                : "Join as an interviewer to help someone practice their interview skills in this peer-to-peer session."}
            </p>
          </div>

          <div className="flex flex-row justify-between mt-4">
            <DisplayTechIcons techStack={techstack} />

            <Link href={isAvailable || isCreator ? linkHref : '#'}>
              <button 
                className="btn-primary"
                disabled={!isCreator && !isAvailable}
              >
                {buttonText}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PeerInterviewCard; 