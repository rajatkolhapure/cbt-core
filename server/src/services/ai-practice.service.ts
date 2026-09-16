import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Difficulty, PracticeMode, SessionDurationType } from '@prisma/client';
import aiGeneratorService from './ai-generator.service';

export interface CreateSessionInput {
  mode: PracticeMode;
  durationType: SessionDurationType;
  targetDuration?: number; // In minutes
  targetCount?: number;    // Number of questions
  selectedTopics: {
    subject: string;
    chapter: string;
    subtopic?: string;
    difficulty: Difficulty;
  };
}

export interface SubmitAnswerInput {
  questionId?: string;
  questionText: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  correctOption: 'A' | 'B' | 'C' | 'D';
  solutionText: string;
  timeSpentSeconds?: number;
}

export class AiPracticeService {
  /**
   * Initializes a new practice session and returns initial question batch
   */
  async createSession(userId: string, data: CreateSessionInput) {
    const { mode, durationType, targetDuration, targetCount, selectedTopics } = data;

    const session = await prisma.aiPracticeSession.create({
      data: {
        userId,
        mode,
        durationType,
        targetDuration: durationType === SessionDurationType.TIMED ? targetDuration || 15 : null,
        targetCount: durationType === SessionDurationType.QUESTION_COUNT ? targetCount || 20 : null,
        selectedTopics: selectedTopics as any,
      },
    });

    // Generate/fetch initial batch of 5 questions
    const initialQuestions = await aiGeneratorService.getOrGenerateQuestions(
      selectedTopics.subject,
      selectedTopics.chapter,
      selectedTopics.subtopic || '',
      selectedTopics.difficulty || Difficulty.MEDIUM,
      5
    );

    return {
      session,
      initialQuestions,
    };
  }

  /**
   * Retrieves active session details
   */
  async getSession(sessionId: string, userId: string) {
    const session = await prisma.aiPracticeSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(404, 'Practice session not found');
    }

    return session;
  }

  /**
   * Pre-fetches the next batch of 5 questions for zero-latency buffer
   */
  async getNextBatch(sessionId: string, userId: string, count: number = 5) {
    const session = await prisma.aiPracticeSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(404, 'Practice session not found');
    }

    if (session.isCompleted) {
      return [];
    }

    const topics = session.selectedTopics as {
      subject: string;
      chapter: string;
      subtopic?: string;
      difficulty: Difficulty;
    };

    const nextBatch = await aiGeneratorService.getOrGenerateQuestions(
      topics.subject,
      topics.chapter,
      topics.subtopic || '',
      topics.difficulty || Difficulty.MEDIUM,
      count
    );

    return nextBatch;
  }

  /**
   * Submits an answer for a question in the session
   */
  async submitAnswer(sessionId: string, userId: string, answerData: SubmitAnswerInput) {
    const session = await prisma.aiPracticeSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(404, 'Practice session not found');
    }

    if (session.isCompleted) {
      throw new AppError(400, 'Session has already been concluded');
    }

    const isCorrect = answerData.selectedOption === answerData.correctOption;
    let newStreak = session.streak;
    let newHighestStreak = session.highestStreak;
    let addedXp = 0;
    let scoreDelta = 0;

    if (session.mode === PracticeMode.ARCADE) {
      if (isCorrect) {
        newStreak += 1;
        if (newStreak > newHighestStreak) newHighestStreak = newStreak;
        // Multiplier: 1.0x at 0 streak, up to 3.0x at 10 streak
        const multiplier = Math.min(3.0, 1.0 + newStreak * 0.2);
        addedXp = Math.round(100 * multiplier);
        scoreDelta = 4;
      } else {
        newStreak = 0;
        addedXp = 10; // Consolation XP for trying
        scoreDelta = 0;
      }
    } else {
      // TEST Mode: standard +4 / -1 CET rules
      if (isCorrect) {
        scoreDelta = 4;
        addedXp = 100;
        newStreak += 1;
        if (newStreak > newHighestStreak) newHighestStreak = newStreak;
      } else {
        scoreDelta = -1;
        newStreak = 0;
      }
    }

    const newTotalAttempted = session.totalAttempted + 1;
    const newCorrectCount = session.correctCount + (isCorrect ? 1 : 0);
    const newIncorrectCount = session.incorrectCount + (isCorrect ? 0 : 1);
    const newScore = Math.max(0, session.score + scoreDelta);
    const newXp = session.xpEarned + addedXp;

    // Check if question count target reached
    const shouldComplete =
      session.durationType === SessionDurationType.QUESTION_COUNT &&
      session.targetCount !== null &&
      newTotalAttempted >= session.targetCount;

    // Existing answers log
    const answersList = (session.answers as any[]) || [];
    answersList.push({
      ...answerData,
      isCorrect,
      scoreDelta,
      xpEarned: addedXp,
      answeredAt: new Date().toISOString(),
    });

    const updated = await prisma.aiPracticeSession.update({
      where: { id: sessionId },
      data: {
        totalAttempted: newTotalAttempted,
        correctCount: newCorrectCount,
        incorrectCount: newIncorrectCount,
        score: newScore,
        xpEarned: newXp,
        streak: newStreak,
        highestStreak: newHighestStreak,
        isCompleted: shouldComplete,
        answers: answersList,
      },
    });

    return {
      isCorrect,
      correctOption: answerData.correctOption,
      solutionText: answerData.solutionText,
      addedXp,
      streak: newStreak,
      score: newScore,
      isCompleted: shouldComplete,
      updatedSession: updated,
    };
  }

  /**
   * Concludes session and returns comprehensive scorecard analysis
   */
  async finishSession(sessionId: string, userId: string) {
    const session = await prisma.aiPracticeSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(404, 'Practice session not found');
    }

    const completed = await prisma.aiPracticeSession.update({
      where: { id: sessionId },
      data: { isCompleted: true },
    });

    const answers = (completed.answers as any[]) || [];
    const accuracy =
      completed.totalAttempted > 0
        ? Math.round((completed.correctCount / completed.totalAttempted) * 100)
        : 0;

    return {
      session: completed,
      summary: {
        score: completed.score,
        totalAttempted: completed.totalAttempted,
        correctCount: completed.correctCount,
        incorrectCount: completed.incorrectCount,
        accuracy,
        xpEarned: completed.xpEarned,
        highestStreak: completed.highestStreak,
      },
      answers,
    };
  }
}

export const aiPracticeService = new AiPracticeService();
export default aiPracticeService;
