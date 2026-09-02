import { AttemptState } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { ExamStateMachine } from '../engines/exam-state-machine';
import { TimerEngine } from '../engines/timer-engine';
import { ScoringEngine, type QuestionEvaluationInput } from '../engines/scoring-engine';
import type {
  StartAttemptInput,
  SaveAnswerInput,
  BulkSaveAnswersInput,
} from '../validators/attempt.validators';

export class AttemptService {
  async startAttempt(
    data: StartAttemptInput,
    userId: string,
    ipAddress?: string
  ) {
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      include: {
        sections: {
          include: {
            questions: {
              include: { question: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      throw new AppError(404, 'Exam not found');
    }

    if (!exam.isPublished) {
      throw new AppError(403, 'Exam is not published');
    }

    // Check if student is assigned
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'STUDENT') {
      const assignment = await prisma.examAssignment.findUnique({
        where: {
          examId_userId: {
            examId: data.examId,
            userId,
          },
        },
      });

      if (!assignment) {
        throw new AppError(403, 'You are not assigned to take this examination');
      }
    }

    // Check for existing attempt
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        examId: data.examId,
        userId,
      },
      include: {
        answers: true,
        examSession: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingAttempt) {
      if (
        existingAttempt.state === AttemptState.SUBMITTED ||
        existingAttempt.state === AttemptState.EVALUATED
      ) {
        throw new AppError(400, 'You have already submitted this examination');
      }

      // If existing attempt is IN_PROGRESS or READY, check if time has expired
      if (existingAttempt.serverEndTime && TimerEngine.isExpired(existingAttempt.serverEndTime)) {
        await this.submitAttempt(existingAttempt.id, userId, true);
        throw new AppError(400, 'Examination time has already expired');
      }

      // Resume attempt
      return this.getAttemptState(existingAttempt.id, userId, user?.role || 'STUDENT');
    }

    // Initialize new attempt
    const now = new Date();
    const serverEndTime = TimerEngine.calculateEndTime(now, exam.duration);

    return prisma.$transaction(async (tx) => {
      const attempt = await tx.attempt.create({
        data: {
          examId: data.examId,
          userId,
          state: AttemptState.IN_PROGRESS,
          startedAt: now,
          serverEndTime,
        },
      });

      // Create ExamSession record
      await tx.examSession.create({
        data: {
          attemptId: attempt.id,
          userId,
          ipAddress: ipAddress || null,
          userAgent: data.userAgent || null,
          examEnvironment: (data.examEnvironment as any) || 'STANDARD_BROWSER',
          isActive: true,
          connectedAt: now,
        },
      });

      // Record EXAM_STARTED event
      await tx.integrityEvent.create({
        data: {
          attemptId: attempt.id,
          userId,
          eventType: 'EXAM_STARTED',
          ipAddress: ipAddress || null,
          details: {
            examEnvironment: data.examEnvironment,
            userAgent: data.userAgent,
          },
        },
      });

      return this.getAttemptState(attempt.id, userId, user?.role || 'STUDENT', tx);
    });
  }

  async getAttemptState(
    attemptId: string,
    userId: string,
    role: string,
    db: any = prisma
  ): Promise<any> {
    const attempt = await db.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            sections: {
              include: {
                subject: { select: { id: true, name: true, code: true } },
                questions: {
                  include: {
                    question: {
                      select: {
                        id: true,
                        type: true,
                        text: true,
                        options: true,
                        marks: true,
                        negativeMarks: true,
                        difficulty: true,
                        imageUrl: true,
                        tags: true,
                        subjectId: true,
                        chapterId: true,
                      },
                    },
                  },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        answers: true,
        examSession: true,
      },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (role !== 'ADMIN' && attempt.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to this examination session');
    }

    // Check auto-expiry if in progress
    if (
      attempt.state === AttemptState.IN_PROGRESS &&
      attempt.serverEndTime &&
      TimerEngine.isExpired(attempt.serverEndTime)
    ) {
      await this.submitAttempt(attemptId, userId, true);
      return this.getAttemptState(attemptId, userId, role, db);
    }

    const timerSnapshot = attempt.startedAt && attempt.serverEndTime
      ? TimerEngine.getSnapshot(attempt.startedAt, attempt.serverEndTime, attempt.exam.duration)
      : null;

    return {
      attempt: {
        id: attempt.id,
        state: attempt.state,
        startedAt: attempt.startedAt,
        serverEndTime: attempt.serverEndTime,
        submittedAt: attempt.submittedAt,
        totalMarks: attempt.totalMarks,
        marksObtained: attempt.marksObtained,
        percentage: attempt.percentage,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
      },
      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        description: attempt.exam.description,
        duration: attempt.exam.duration,
        totalMarks: attempt.exam.totalMarks,
        allowReview: attempt.exam.allowReview,
        showResultImmediately: attempt.exam.showResultImmediately,
        examEnvironment: attempt.exam.examEnvironment,
        integrityPolicy: attempt.exam.integrityPolicy,
        sections: attempt.exam.sections,
      },
      answers: attempt.answers,
      timer: timerSnapshot,
      serverTime: TimerEngine.getServerTime(),
    };
  }

  async saveAnswer(attemptId: string, userId: string, data: SaveAnswerInput) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to attempt');
    }

    if (attempt.state !== AttemptState.IN_PROGRESS) {
      throw new AppError(400, `Cannot save answer. Attempt state is ${attempt.state}`);
    }

    // Verify timer
    if (attempt.serverEndTime && TimerEngine.isExpired(attempt.serverEndTime)) {
      await this.submitAttempt(attemptId, userId, true);
      throw new AppError(400, 'Examination time has expired. Exam submitted automatically.');
    }

    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: data.questionId,
        },
      },
      update: {
        selectedOptions: data.selectedOptions !== undefined ? (data.selectedOptions as any) : undefined,
        numericalAnswer: data.numericalAnswer !== undefined ? data.numericalAnswer : undefined,
        isMarkedForReview: data.isMarkedForReview !== undefined ? data.isMarkedForReview : undefined,
        isVisited: data.isVisited !== undefined ? data.isVisited : true,
        timeSpentSeconds: { increment: data.timeSpentSeconds || 0 },
        updatedAt: new Date(),
      },
      create: {
        attemptId,
        questionId: data.questionId,
        examQuestionId: data.examQuestionId,
        selectedOptions: data.selectedOptions ? (data.selectedOptions as any) : undefined,
        numericalAnswer: data.numericalAnswer,
        isMarkedForReview: data.isMarkedForReview || false,
        isVisited: data.isVisited ?? true,
        timeSpentSeconds: data.timeSpentSeconds || 0,
      },
    });

    return answer;
  }

  async bulkSaveAnswers(
    attemptId: string,
    userId: string,
    data: BulkSaveAnswersInput
  ) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to attempt');
    }

    if (attempt.state !== AttemptState.IN_PROGRESS) {
      throw new AppError(400, `Cannot save answers. Attempt state is ${attempt.state}`);
    }

    const results = await Promise.all(
      data.answers.map((ans) =>
        prisma.answer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: ans.questionId,
            },
          },
          update: {
            selectedOptions: ans.selectedOptions !== undefined ? (ans.selectedOptions as any) : undefined,
            numericalAnswer: ans.numericalAnswer !== undefined ? ans.numericalAnswer : undefined,
            isMarkedForReview: ans.isMarkedForReview !== undefined ? ans.isMarkedForReview : undefined,
            isVisited: ans.isVisited !== undefined ? ans.isVisited : true,
            timeSpentSeconds: { increment: ans.timeSpentSeconds || 0 },
            updatedAt: new Date(),
          },
          create: {
            attemptId,
            questionId: ans.questionId,
            examQuestionId: ans.examQuestionId,
            selectedOptions: ans.selectedOptions ? (ans.selectedOptions as any) : undefined,
            numericalAnswer: ans.numericalAnswer,
            isMarkedForReview: ans.isMarkedForReview || false,
            isVisited: ans.isVisited ?? true,
            timeSpentSeconds: ans.timeSpentSeconds || 0,
          },
        })
      )
    );

    return {
      savedCount: results.length,
    };
  }

  async submitAttempt(
    attemptId: string,
    userId: string,
    isAutoSubmit: boolean = false
  ) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            sections: {
              include: {
                subject: true,
                questions: {
                  include: { question: true },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to attempt');
    }

    if (
      attempt.state === AttemptState.SUBMITTED ||
      attempt.state === AttemptState.EVALUATED
    ) {
      return this.getResult(attemptId, userId, 'STUDENT');
    }

    ExamStateMachine.validateTransition(attempt.state, AttemptState.SUBMITTED);

    // Prepare evaluation input
    const evaluationQuestions: QuestionEvaluationInput[] = [];

    for (const section of attempt.exam.sections) {
      for (const eq of section.questions) {
        const q = eq.question;
        const userAnswer = attempt.answers.find((a) => a.questionId === q.id);

        evaluationQuestions.push({
          questionId: q.id,
          type: q.type,
          correctAnswer: q.correctAnswer,
          marks: section.marksPerQuestion || q.marks,
          negativeMarks: section.negativeMarksPerQuestion || q.negativeMarks,
          subjectId: section.subjectId,
          subjectName: section.subject.name,
          sectionName: section.name,
          userAnswer: userAnswer
            ? {
                selectedOptions: userAnswer.selectedOptions,
                numericalAnswer: userAnswer.numericalAnswer,
                timeSpentSeconds: userAnswer.timeSpentSeconds,
              }
            : null,
        });
      }
    }

    const evaluation = ScoringEngine.evaluateExam(evaluationQuestions);

    const now = new Date();
    const updatedAttempt = await prisma.$transaction(async (tx) => {
      const att = await tx.attempt.update({
        where: { id: attemptId },
        data: {
          state: AttemptState.SUBMITTED,
          submittedAt: now,
          totalMarks: evaluation.totalPossibleMarks,
          marksObtained: evaluation.marksObtained,
          percentage: evaluation.percentage,
          correctCount: evaluation.correctCount,
          incorrectCount: evaluation.incorrectCount,
          unansweredCount: evaluation.unansweredCount,
        },
      });

      // Record submit event
      await tx.integrityEvent.create({
        data: {
          attemptId,
          userId,
          eventType: isAutoSubmit ? 'EXAM_AUTO_SUBMITTED' : 'EXAM_SUBMITTED',
          details: {
            isAutoSubmit,
            marksObtained: evaluation.marksObtained,
            totalMarks: evaluation.totalPossibleMarks,
          },
        },
      });

      return att;
    });

    return {
      attemptId: updatedAttempt.id,
      state: updatedAttempt.state,
      submittedAt: updatedAttempt.submittedAt,
      evaluation: {
        totalPossibleMarks: evaluation.totalPossibleMarks,
        marksObtained: evaluation.marksObtained,
        percentage: evaluation.percentage,
        correctCount: evaluation.correctCount,
        incorrectCount: evaluation.incorrectCount,
        unansweredCount: evaluation.unansweredCount,
        accuracy: evaluation.accuracy,
        sectionSummaries: evaluation.sectionSummaries,
      },
    };
  }

  async getResult(attemptId: string, userId: string, role: string) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            sections: {
              include: {
                subject: true,
                questions: {
                  include: { question: true },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (role !== 'ADMIN' && attempt.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to results');
    }

    if (
      attempt.state !== AttemptState.SUBMITTED &&
      attempt.state !== AttemptState.EVALUATED
    ) {
      throw new AppError(400, 'Results not available for unsubmitted attempt');
    }

    if (
      role !== 'ADMIN' &&
      !attempt.exam.showResultImmediately
    ) {
      return {
        message: 'Exam submitted successfully. Results will be published later.',
        submittedAt: attempt.submittedAt,
      };
    }

    // Compute full breakdown
    const evaluationQuestions: QuestionEvaluationInput[] = [];

    for (const section of attempt.exam.sections) {
      for (const eq of section.questions) {
        const q = eq.question;
        const userAnswer = attempt.answers.find((a) => a.questionId === q.id);

        evaluationQuestions.push({
          questionId: q.id,
          type: q.type,
          correctAnswer: q.correctAnswer,
          marks: section.marksPerQuestion || q.marks,
          negativeMarks: section.negativeMarksPerQuestion || q.negativeMarks,
          subjectId: section.subjectId,
          subjectName: section.subject.name,
          sectionName: section.name,
          userAnswer: userAnswer
            ? {
                selectedOptions: userAnswer.selectedOptions,
                numericalAnswer: userAnswer.numericalAnswer,
                timeSpentSeconds: userAnswer.timeSpentSeconds,
              }
            : null,
        });
      }
    }

    const evaluation = ScoringEngine.evaluateExam(evaluationQuestions);

    return {
      attempt: {
        id: attempt.id,
        state: attempt.state,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        totalMarks: attempt.totalMarks,
        marksObtained: attempt.marksObtained,
        percentage: attempt.percentage,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
      },
      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        duration: attempt.exam.duration,
        totalMarks: attempt.exam.totalMarks,
        allowReview: attempt.exam.allowReview,
      },
      evaluation: {
        totalPossibleMarks: evaluation.totalPossibleMarks,
        marksObtained: evaluation.marksObtained,
        percentage: evaluation.percentage,
        correctCount: evaluation.correctCount,
        incorrectCount: evaluation.incorrectCount,
        unansweredCount: evaluation.unansweredCount,
        accuracy: evaluation.accuracy,
        sectionSummaries: evaluation.sectionSummaries,
      },
    };
  }

  async getReview(attemptId: string, userId: string, role: string) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            sections: {
              include: {
                subject: true,
                questions: {
                  include: { question: true },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (role !== 'ADMIN' && attempt.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to review');
    }

    if (
      attempt.state !== AttemptState.SUBMITTED &&
      attempt.state !== AttemptState.EVALUATED
    ) {
      throw new AppError(400, 'Review not available for unsubmitted attempt');
    }

    if (role !== 'ADMIN' && !attempt.exam.allowReview) {
      throw new AppError(403, 'Detailed review is not enabled for this examination');
    }

    const evaluationQuestions: QuestionEvaluationInput[] = [];

    for (const section of attempt.exam.sections) {
      for (const eq of section.questions) {
        const q = eq.question;
        const userAnswer = attempt.answers.find((a) => a.questionId === q.id);

        evaluationQuestions.push({
          questionId: q.id,
          type: q.type,
          correctAnswer: q.correctAnswer,
          marks: section.marksPerQuestion || q.marks,
          negativeMarks: section.negativeMarksPerQuestion || q.negativeMarks,
          subjectId: section.subjectId,
          subjectName: section.subject.name,
          sectionName: section.name,
          userAnswer: userAnswer
            ? {
                selectedOptions: userAnswer.selectedOptions,
                numericalAnswer: userAnswer.numericalAnswer,
                timeSpentSeconds: userAnswer.timeSpentSeconds,
              }
            : null,
        });
      }
    }

    const evaluation = ScoringEngine.evaluateExam(evaluationQuestions);

    // Map questions with review details (text, options, explanation)
    const reviewItems = attempt.exam.sections.map((section) => ({
      sectionId: section.id,
      sectionName: section.name,
      subjectName: section.subject.name,
      questions: section.questions.map((eq) => {
        const q = eq.question;
        const evalRes = evaluation.questionResults.find((qr) => qr.questionId === q.id);
        const ans = attempt.answers.find((a) => a.questionId === q.id);

        return {
          questionId: q.id,
          type: q.type,
          text: q.text,
          options: q.options,
          imageUrl: q.imageUrl,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          marks: section.marksPerQuestion || q.marks,
          negativeMarks: section.negativeMarksPerQuestion || q.negativeMarks,
          difficulty: q.difficulty,
          userAnswer: ans ? {
            selectedOptions: ans.selectedOptions,
            numericalAnswer: ans.numericalAnswer,
            isMarkedForReview: ans.isMarkedForReview,
            isVisited: ans.isVisited,
            timeSpentSeconds: ans.timeSpentSeconds,
          } : null,
          isAttempted: evalRes?.isAttempted || false,
          isCorrect: evalRes?.isCorrect || false,
          marksAwarded: evalRes?.marksAwarded || 0,
        };
      }),
    }));

    return {
      attemptId: attempt.id,
      examTitle: attempt.exam.title,
      summary: {
        totalPossibleMarks: evaluation.totalPossibleMarks,
        marksObtained: evaluation.marksObtained,
        percentage: evaluation.percentage,
        accuracy: evaluation.accuracy,
        correctCount: evaluation.correctCount,
        incorrectCount: evaluation.incorrectCount,
        unansweredCount: evaluation.unansweredCount,
        sectionSummaries: evaluation.sectionSummaries,
      },
      sections: reviewItems,
    };
  }
}

export const attemptService = new AttemptService();
