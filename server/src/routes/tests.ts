import { Router, type Response, type NextFunction } from 'express';
import prisma from '../config/database';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware';
import { AttemptState } from '@prisma/client';

const router = Router();

// Require authentication for student tests telemetry
router.use(requireAuth);

/**
 * GET /api/tests
 * GET /api/tests/student-stats
 * 
 * Returns live database stats for the authenticated student:
 * - assignedTestsCount: Exact count of exams assigned via ExamAssignment
 * - attemptedTestsCount: Exact count of submitted/evaluated attempts
 * - accuracy: Real average question accuracy across attempted tests (correctAnswers / totalQuestions * 100)
 * - questionsPracticedCount: Total questions answered
 * - scoreHistory: Array of real test scores for graphing (empty array if 0 attempted)
 * - assignedTests: Detailed list of assigned exams
 */
const getStudentStatsHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized candidate session' });
    }

    // 1. Fetch Student Record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        assignedTestsCount: true,
        attemptedTestsCount: true,
        accuracy: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    // 2. Query Neon Database for exact assigned tests
    const assignments = await prisma.examAssignment.findMany({
      where: { userId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            totalMarks: true,
            isPublished: true,
            examEnvironment: true,
            sections: {
              select: {
                id: true,
                name: true,
                questionCount: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    // Count assigned exams
    const realAssignedCount = assignments.length;

    // 3. Query Neon Database for exact submitted/evaluated attempts
    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
        state: { in: [AttemptState.SUBMITTED, AttemptState.EVALUATED] },
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    const realAttemptedCount = attempts.length;

    // 4. Calculate Question Accuracy across all tests
    // Question accuracy per test = (correctAnswers / totalQuestions) * 100
    let totalQuestionsAllTests = 0;
    let totalCorrectAllTests = 0;
    const testAccuracies: number[] = [];

    const scoreHistory = attempts.map((att) => {
      const totalQ = (att.correctCount || 0) + (att.incorrectCount || 0) + (att.unansweredCount || 0);
      const correctQ = att.correctCount || 0;
      
      const testAccuracy = totalQ > 0 
        ? Math.round((correctQ / totalQ) * 1000) / 10 
        : (att.accuracy !== null && att.accuracy !== undefined ? att.accuracy : 0);

      totalQuestionsAllTests += totalQ;
      totalCorrectAllTests += correctQ;
      testAccuracies.push(testAccuracy);

      const submittedDate = att.submittedAt ? new Date(att.submittedAt) : new Date(att.createdAt);
      const dayFormatted = submittedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });

      return {
        id: att.id,
        examId: att.examId,
        testName: att.exam?.title || 'Examination Docket',
        day: dayFormatted,
        date: submittedDate.toISOString(),
        score: att.percentage ? Math.round(att.percentage * 10) / 10 : (att.marksObtained || 0),
        marksObtained: att.marksObtained || 0,
        totalMarks: att.totalMarks || att.exam?.totalMarks || 100,
        percentage: att.percentage || 0,
        accuracy: testAccuracy,
        correctCount: att.correctCount || 0,
        incorrectCount: att.incorrectCount || 0,
      };
    });

    // Real overall average accuracy
    const overallAccuracy = testAccuracies.length > 0
      ? Math.round((testAccuracies.reduce((a, b) => a + b, 0) / testAccuracies.length) * 100) / 100
      : (user.accuracy || 0);

    // Total questions practiced across all evaluated exams
    const totalAnsweredCount = attempts.reduce(
      (sum, att) => sum + ((att.correctCount || 0) + (att.incorrectCount || 0)),
      0
    );

    // Detailed assigned tests format for the UI docket
    const assignedTestsList = assignments.map(({ exam }) => {
      const qCount = exam.sections.reduce((acc, s) => acc + s.questionCount, 0);
      return {
        id: exam.id,
        name: exam.title,
        track: exam.sections[0]?.name ? `${exam.sections[0].name} Track` : 'Standard Academic Track',
        duration: `${exam.duration}M`,
        questionsCount: qCount || 25,
        format: exam.examEnvironment === 'FULLSCREEN_BROWSER' ? 'CBT-STRICT' : 'STANDARD',
        formula: 'Calculus & Kinetics Verification: $\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}$',
      };
    });

    return res.json({
      success: true,
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      stats: {
        assignedTestsCount: realAssignedCount,
        attemptedTestsCount: realAttemptedCount,
        accuracy: overallAccuracy,
        questionsPracticedCount: totalAnsweredCount,
      },
      scoreHistory, // Empty array if 0 attempted tests -> triggers empty state
      assignedTests: assignedTestsList,
    });
  } catch (error) {
    console.error('[API /api/tests] Failed to load student tests telemetry:', error);
    next(error);
  }
};

router.get('/', getStudentStatsHandler);
router.get('/student-stats', getStudentStatsHandler);

export default router;
