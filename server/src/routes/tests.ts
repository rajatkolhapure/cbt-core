import { Router, type Response, type NextFunction } from 'express';
import prisma from '../config/database';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware';
import { AttemptState, AssignmentStatus } from '@prisma/client';
import testService from '../services/testService';

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

    // 2. Query Neon Database for exact assigned tests (only published exams)
    const assignments = await prisma.examAssignment.findMany({
      where: {
        userId,
        exam: { isPublished: true },
      },
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

/**
 * Helper: build the standard assigned-tests list response shape.
 * Filters out completed assignments so completed tests vanish from the UI.
 */
const buildAssignedTestsList = async (userId: string) => {
  const assignments = await prisma.examAssignment.findMany({
    where: {
      userId,
      status: { not: AssignmentStatus.completed },
      exam: { isPublished: true },
    },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          duration: true,
          examEnvironment: true,
          sections: {
            select: { id: true, name: true, questionCount: true },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return assignments.map(({ exam, status }) => {
    const qCount = exam.sections.reduce((acc, s) => acc + s.questionCount, 0);
    return {
      id: exam.id,
      name: exam.title,
      track: exam.sections[0]?.name ? `${exam.sections[0].name} Track` : 'Standard Academic Track',
      duration: `${exam.duration}M`,
      questionsCount: qCount || 25,
      format: exam.examEnvironment === 'FULLSCREEN_BROWSER' ? 'CBT-STRICT' : 'STANDARD',
      formula: 'Calculus & Kinetics Verification: $\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}$',
      status,
    };
  });
};

/**
 * GET /api/tests/assigned
 *
 * Returns only non-completed assigned tests for the authenticated student.
 * Used by the Resume Test CTA section on the Student Dashboard.
 */
router.get('/assigned', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized candidate session' });

    const assignedTests = await buildAssignedTestsList(userId);
    return res.json({ success: true, assignedTests });
  } catch (error) {
    console.error('[API GET /api/tests/assigned] Error:', error);
    next(error);
  }
});

/**
 * POST /api/tests/complete
 * Body: { examId: string }
 *
 * Marks an ExamAssignment as completed. If it is already completed, returns 400.
 * On success, also returns the updated list of remaining non-completed tests.
 */
router.post('/complete', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized candidate session' });

    const { examId } = req.body as { examId?: string };
    if (!examId) return res.status(400).json({ error: 'examId is required' });

    // Find the assignment
    const assignment = await prisma.examAssignment.findUnique({
      where: { examId_userId: { examId, userId } },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found for this candidate' });
    }

    // Guard: already completed → 400
    if (assignment.status === AssignmentStatus.completed || assignment.completedAt !== null) {
      return res.status(400).json({ error: 'Test already completed' });
    }

    // Mark as completed with timestamp
    await prisma.examAssignment.update({
      where: { examId_userId: { examId, userId } },
      data: {
        status: AssignmentStatus.completed,
        completedAt: new Date(),
      },
    });

    // Return the updated (now-filtered) list so the UI can refresh without an extra request
    const assignedTests = await buildAssignedTestsList(userId);
    return res.json({ success: true, assignedTests });
  } catch (error) {
    console.error('[API POST /api/tests/complete] Error:', error);
    next(error);
  }
});

/**
 * GET /api/tests/resume-check/:examId
 *
 * Validates that an exam is still resumable for the authenticated student.
 * Returns 400 with "Test already completed" if the assignment is completed.
 * Used client-side before navigating to the exam page when the user clicks "Resume Test".
 */
router.get('/resume-check/:examId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized candidate session' });

    const examId = req.params.examId as string;

    const assignment = await prisma.examAssignment.findUnique({
      where: { examId_userId: { examId, userId } },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found for this candidate' });
    }

    if (assignment.status === AssignmentStatus.completed || assignment.completedAt !== null) {
      return res.status(400).json({ error: 'Test already completed' });
    }

    return res.json({ success: true, status: assignment.status, canResume: true });
  } catch (error) {
    console.error('[API GET /api/tests/resume-check] Error:', error);
    next(error);
  }
});

/**
 * GET /api/tests/assignable
 *
 * Returns only pending tests where completedAt is null and status !== 'COMPLETED'.
 * Filters out any completed tests or tests with completedAt set.
 */
router.get('/assignable', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const tests = await testService.getAssignableTests(userId);
    return res.json({
      success: true,
      tests,
      assignableTests: tests,
    });
  } catch (error) {
    console.error('[API GET /api/tests/assignable] Error:', error);
    next(error);
  }
});

export default router;
