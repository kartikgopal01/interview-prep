interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[] | string;
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  resumeData?: {
    name: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    summary?: string;
    rawText?: string;
  } | null;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
}

interface InterviewCardProps {
  id?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[] | string;
  createdAt?: string;
  finalized?: boolean;
  isCreator?: boolean;
  color?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  resumeData?: {
    name: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    summary?: string;
    rawText?: string;
  } | null;
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up" | "forgot-password";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}

interface PeerInterview {
  id: string;
  userId: string;
  role: string;
  level: string;
  techstack: string[];
  status: 'pending' | 'active' | 'completed';
  interviewerId: string | null;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

interface PeerFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  intervieweeId: string;
  rating: number;
  feedback: string;
  createdAt: string;
}