import api from './client';

export interface PracticeOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface PracticeQuestion {
  id?: string;
  subject: string;
  chapter: string;
  subtopic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL';
  text: string;
  options: PracticeOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  solutionText: string;
}

export interface PracticeSession {
  id: string;
  userId: string;
  mode: 'ARCADE' | 'TEST';
  durationType: 'ENDLESS' | 'QUESTION_COUNT' | 'TIMED';
  targetDuration?: number | null;
  targetCount?: number | null;
  selectedTopics: {
    subject: string;
    chapter: string;
    subtopic?: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  };
  score: number;
  xpEarned: number;
  streak: number;
  highestStreak: number;
  totalAttempted: number;
  correctCount: number;
  incorrectCount: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionParams {
  mode: 'ARCADE' | 'TEST';
  durationType: 'ENDLESS' | 'QUESTION_COUNT' | 'TIMED';
  targetDuration?: number;
  targetCount?: number;
  selectedTopics: {
    subject: string;
    chapter: string;
    subtopic?: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  };
}

export interface AnswerSubmissionResult {
  isCorrect: boolean;
  correctOption: 'A' | 'B' | 'C' | 'D';
  solutionText: string;
  addedXp: number;
  streak: number;
  score: number;
  isCompleted: boolean;
  updatedSession: PracticeSession;
}

export interface ScorecardResult {
  session: PracticeSession;
  summary: {
    score: number;
    totalAttempted: number;
    correctCount: number;
    incorrectCount: number;
    accuracy: number;
    xpEarned: number;
    highestStreak: number;
  };
  answers: Array<{
    questionText: string;
    selectedOption: 'A' | 'B' | 'C' | 'D';
    correctOption: 'A' | 'B' | 'C' | 'D';
    solutionText: string;
    isCorrect: boolean;
    scoreDelta: number;
    xpEarned: number;
    answeredAt: string;
  }>;
}

export const aiPracticeApi = {
  getTaxonomy: async () => {
    const res = await api.get('/ai-practice/taxonomy');
    return res.data.taxonomy as Record<string, { chapters: Record<string, string[]> }>;
  },

  createSession: async (data: CreateSessionParams) => {
    const res = await api.post('/ai-practice/sessions', data);
    return res.data as { session: PracticeSession; initialQuestions: PracticeQuestion[] };
  },

  getSession: async (sessionId: string) => {
    const res = await api.get(`/ai-practice/sessions/${sessionId}`);
    return res.data.session as PracticeSession;
  },

  prefetchNextBatch: async (sessionId: string, count: number = 5) => {
    const res = await api.get(`/ai-practice/sessions/${sessionId}/next-batch?count=${count}`);
    return res.data.questions as PracticeQuestion[];
  },

  submitAnswer: async (
    sessionId: string,
    data: {
      questionId?: string;
      questionText: string;
      selectedOption: 'A' | 'B' | 'C' | 'D';
      correctOption: 'A' | 'B' | 'C' | 'D';
      solutionText: string;
      timeSpentSeconds?: number;
    }
  ) => {
    const res = await api.post(`/ai-practice/sessions/${sessionId}/answer`, data);
    return res.data as AnswerSubmissionResult;
  },

  finishSession: async (sessionId: string) => {
    const res = await api.post(`/ai-practice/sessions/${sessionId}/finish`);
    return res.data as ScorecardResult;
  },
};

export default aiPracticeApi;
