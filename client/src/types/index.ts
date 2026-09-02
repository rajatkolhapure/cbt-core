export type Role = 'ADMIN' | 'STUDENT';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type AttemptState = 'NOT_STARTED' | 'READY' | 'IN_PROGRESS' | 'PAUSED' | 'SUBMITTED' | 'EVALUATED';
export type ExamEnvironment = 'STANDARD_BROWSER' | 'FULLSCREEN_BROWSER' | 'KIOSK_CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  candidateId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  order: number;
  chapters?: Chapter[];
  _count?: { questions: number };
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[] | null;
  correctAnswer: any;
  marks: number;
  negativeMarks: number;
  difficulty: Difficulty;
  explanation?: string | null;
  imageUrl?: string | null;
  tags: string[];
  subjectId: string;
  chapterId?: string | null;
  subject?: Subject;
  chapter?: Chapter | null;
  isActive: boolean;
  createdAt: string;
}

export interface ExamSection {
  id: string;
  examId: string;
  subjectId: string;
  name: string;
  order: number;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarksPerQuestion: number;
  allowSectionJump: boolean;
  subject?: Subject;
  questions?: Array<{
    id: string;
    order: number;
    question: Question;
  }>;
}

export interface Exam {
  id: string;
  title: string;
  description?: string | null;
  duration: number;
  totalMarks: number;
  isPublished: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowReview: boolean;
  showResultImmediately: boolean;
  integrityPolicy?: any;
  examEnvironment: ExamEnvironment;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  createdAt: string;
  sections?: ExamSection[];
  assignments?: Array<{ user: User }>;
  attempts?: Array<{ id: string; state: AttemptState; marksObtained?: number | null; totalMarks?: number | null; percentage?: number | null }>;
  _count?: {
    assignments: number;
    attempts: number;
    examQuestions: number;
  };
}

export interface Attempt {
  id: string;
  examId: string;
  userId: string;
  state: AttemptState;
  startedAt?: string | null;
  submittedAt?: string | null;
  serverEndTime?: string | null;
  totalMarks?: number | null;
  marksObtained?: number | null;
  percentage?: number | null;
  correctCount?: number | null;
  incorrectCount?: number | null;
  unansweredCount?: number | null;
  exam?: Exam;
  user?: User;
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  examQuestionId: string;
  selectedOptions?: number[] | null;
  numericalAnswer?: number | null;
  isMarkedForReview: boolean;
  isVisited: boolean;
  timeSpentSeconds: number;
}

export interface SaveAnswerInput {
  questionId: string;
  examQuestionId: string;
  selectedOptions?: number[] | null;
  numericalAnswer?: number | null;
  isMarkedForReview?: boolean;
  isVisited?: boolean;
  timeSpentSeconds?: number;
}

export interface SectionScoreSummary {
  subjectId: string;
  subjectName: string;
  sectionName: string;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  marksObtained: number;
  totalPossibleMarks: number;
  accuracy: number;
}

export interface ExamEvaluation {
  totalPossibleMarks: number;
  marksObtained: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  sectionSummaries: SectionScoreSummary[];
}

export interface IntegrityEvent {
  id: string;
  attemptId: string;
  userId: string;
  eventType: string;
  details?: any;
  ipAddress?: string | null;
  timestamp: string;
  user?: { name: string; email: string; candidateId?: string | null };
  attempt?: { exam: { title: string } };
}
