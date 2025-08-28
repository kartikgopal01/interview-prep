import dayjs from 'dayjs';
import Image from "next/image";
import Link from "next/link";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import DeleteInterviewButton from '@/components/DeleteInterviewButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <Card className="w-full dark:bg-card dark:border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">Peer Interview</span>
          {isCreator && <DeleteInterviewButton interviewId={id} />}
        </div>
        <CardTitle className="text-xl capitalize">{role} Interview - {level}</CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Image src="/calendar.svg" alt="calendar" width={16} height={16} />
            {formattedDate}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
            {statusDisplay}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {techstack && techstack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techstack.slice(0, 3).map((tech: string, index: number) => (
              <span key={index} className="bg-cta-gold text-black text-xs px-2 py-1 rounded-full font-medium">
                {tech.trim()}
              </span>
            ))}
            {techstack.length > 3 && (
              <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                +{techstack.length - 3} more
              </span>
            )}
          </div>
        )}
        <p className="line-clamp-2 text-muted-foreground">
          {isCreator 
            ? isCompleted
              ? 'Your interview is completed. Check the feedback from your interviewer.'
              : 'You created this interview. Wait for someone to join as an interviewer or share the link.'
            : 'Join as an interviewer to help someone practice their interview skills in this peer‑to‑peer session.'}
        </p>
        <div className="flex items-center justify-between">
          <DisplayTechIcons techStack={techstack} />
          <Button asChild disabled={!isCreator && !isAvailable}>
            <Link href={isAvailable || isCreator ? linkHref : '#'}>{buttonText}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeerInterviewCard; 