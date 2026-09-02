import { QuestionType } from '@prisma/client';

export interface QuestionEvaluationInput {
  questionId: string;
  type: QuestionType;
  correctAnswer: any;
  marks: number;
  negativeMarks: number;
  subjectId: string;
  subjectName: string;
  sectionName?: string;
  userAnswer?: {
    selectedOptions?: any;
    numericalAnswer?: number | null;
    timeSpentSeconds?: number;
  } | null;
}

export interface QuestionResult {
  questionId: string;
  type: QuestionType;
  isAttempted: boolean;
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
  negativeMarks: number;
  subjectId: string;
  subjectName: string;
  sectionName?: string;
  userAnswer: any;
  correctAnswer: any;
  timeSpentSeconds: number;
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

export interface ExamEvaluationResult {
  totalPossibleMarks: number;
  marksObtained: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  accuracy: number;
  questionResults: QuestionResult[];
  sectionSummaries: SectionScoreSummary[];
}

export class ScoringEngine {
  private static readonly NUMERICAL_TOLERANCE = 0.001;

  static evaluateQuestion(input: QuestionEvaluationInput): QuestionResult {
    const {
      questionId,
      type,
      correctAnswer,
      marks,
      negativeMarks,
      subjectId,
      subjectName,
      sectionName,
      userAnswer,
    } = input;

    const timeSpent = userAnswer?.timeSpentSeconds || 0;

    // 1. Check if attempted
    let isAttempted = false;
    let isCorrect = false;
    let marksAwarded = 0;

    if (type === QuestionType.SINGLE_CHOICE) {
      const selected = userAnswer?.selectedOptions;
      if (selected !== undefined && selected !== null && Array.isArray(selected) && selected.length > 0) {
        isAttempted = true;
        const selectedIdx = Number(selected[0]);
        const correctIdx = Number(correctAnswer);
        isCorrect = selectedIdx === correctIdx;
      }
    } else if (type === QuestionType.MULTIPLE_CHOICE) {
      const selected = userAnswer?.selectedOptions;
      if (selected !== undefined && selected !== null && Array.isArray(selected) && selected.length > 0) {
        isAttempted = true;
        const selectedArr = selected.map(Number).sort((a: number, b: number) => a - b);
        const correctArr = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer])
          .map(Number)
          .sort((a: number, b: number) => a - b);

        isCorrect =
          selectedArr.length === correctArr.length &&
          selectedArr.every((val: number, idx: number) => val === correctArr[idx]);
      }
    } else if (type === QuestionType.NUMERICAL) {
      const val = userAnswer?.numericalAnswer;
      if (val !== undefined && val !== null && !isNaN(Number(val))) {
        isAttempted = true;
        const userNum = Number(val);
        const correctNum = Number(correctAnswer);
        isCorrect = Math.abs(userNum - correctNum) <= this.NUMERICAL_TOLERANCE;
      }
    }

    if (isAttempted) {
      marksAwarded = isCorrect ? marks : -negativeMarks;
    } else {
      marksAwarded = 0;
    }

    return {
      questionId,
      type,
      isAttempted,
      isCorrect,
      marksAwarded,
      maxMarks: marks,
      negativeMarks,
      subjectId,
      subjectName,
      sectionName,
      userAnswer: type === QuestionType.NUMERICAL ? userAnswer?.numericalAnswer : userAnswer?.selectedOptions,
      correctAnswer,
      timeSpentSeconds: timeSpent,
    };
  }

  static evaluateExam(questions: QuestionEvaluationInput[]): ExamEvaluationResult {
    const questionResults: QuestionResult[] = questions.map((q) =>
      this.evaluateQuestion(q)
    );

    let totalPossibleMarks = 0;
    let marksObtained = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    // Grouping by section/subject
    const sectionMap = new Map<string, SectionScoreSummary>();

    for (const res of questionResults) {
      totalPossibleMarks += res.maxMarks;
      marksObtained += res.marksAwarded;

      if (res.isAttempted) {
        if (res.isCorrect) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        unansweredCount++;
      }

      const secKey = `${res.subjectId}_${res.sectionName || 'Default'}`;
      if (!sectionMap.has(secKey)) {
        sectionMap.set(secKey, {
          subjectId: res.subjectId,
          subjectName: res.subjectName,
          sectionName: res.sectionName || res.subjectName,
          totalQuestions: 0,
          attemptedCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          unansweredCount: 0,
          marksObtained: 0,
          totalPossibleMarks: 0,
          accuracy: 0,
        });
      }

      const secSummary = sectionMap.get(secKey)!;
      secSummary.totalQuestions++;
      secSummary.totalPossibleMarks += res.maxMarks;
      secSummary.marksObtained += res.marksAwarded;

      if (res.isAttempted) {
        secSummary.attemptedCount++;
        if (res.isCorrect) secSummary.correctCount++;
        else secSummary.incorrectCount++;
      } else {
        secSummary.unansweredCount++;
      }
    }

    // Compute accuracy for sections
    const sectionSummaries: SectionScoreSummary[] = Array.from(sectionMap.values()).map((sec) => {
      const accuracy = sec.attemptedCount > 0
        ? Math.round((sec.correctCount / sec.attemptedCount) * 1000) / 10
        : 0;
      return {
        ...sec,
        marksObtained: Math.round(sec.marksObtained * 100) / 100,
        accuracy,
      };
    });

    const totalAttempted = correctCount + incorrectCount;
    const accuracy = totalAttempted > 0
      ? Math.round((correctCount / totalAttempted) * 1000) / 10
      : 0;

    const percentage = totalPossibleMarks > 0
      ? Math.round((marksObtained / totalPossibleMarks) * 1000) / 10
      : 0;

    return {
      totalPossibleMarks: Math.round(totalPossibleMarks * 100) / 100,
      marksObtained: Math.round(marksObtained * 100) / 100,
      percentage,
      correctCount,
      incorrectCount,
      unansweredCount,
      totalQuestions: questionResults.length,
      accuracy,
      questionResults,
      sectionSummaries,
    };
  }
}
