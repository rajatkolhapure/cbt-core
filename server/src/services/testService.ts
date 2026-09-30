import prisma from '../config/database';
import { AttemptState, AssignmentStatus } from '@prisma/client';

export interface AssignableTestItem {
  id: string;
  title: string;
  name: string;
  description?: string | null;
  duration: string;
  durationMinutes: number;
  questionsCount: number;
  totalMarks: number;
  format: string;
  track: string;
  formula: string;
  status: 'PENDING' | 'pending';
  completedAt: null;
}

/**
 * Filter utility: strictly excludes any tests where completedAt is set or status is COMPLETED / completed.
 * Guarantees returned items have status === 'PENDING' or completedAt == null.
 */
export function filterAssignableTests<T extends Record<string, any>>(tests: T[]): T[] {
  if (!Array.isArray(tests)) return [];

  return tests.filter((test) => {
    // 1. Exclude if completedAt is non-null
    if (test.completedAt !== null && test.completedAt !== undefined) {
      return false;
    }

    // 2. Exclude if status indicates completion
    const statusUpper = typeof test.status === 'string' ? test.status.toUpperCase() : '';
    if (statusUpper === 'COMPLETED') {
      return false;
    }

    // 3. Keep only tests with status pending or unset with null completedAt
    return statusUpper === 'PENDING' || statusUpper === '' || test.status === undefined;
  }).map((test) => ({
    ...test,
    status: (typeof test.status === 'string' && test.status.toUpperCase() === 'PENDING' ? 'PENDING' : 'PENDING') as any,
    completedAt: null as any,
  }));
}

/**
 * Service to fetch assignable tests from the database.
 * Only returns tests where status === 'PENDING' and completedAt is null.
 * Completely excludes completed tests or tests with completedAt set.
 */
export async function getAssignableTests(userId?: string): Promise<AssignableTestItem[]> {
  // Query all published exams where completedAt is null
  const exams = await prisma.exam.findMany({
    where: {
      isPublished: true,
      completedAt: null,
      // If a userId is given, exclude exams that the user has already submitted or marked completed
      ...(userId
        ? {
            assignments: {
              none: {
                userId,
                OR: [
                  { status: AssignmentStatus.completed },
                  { completedAt: { not: null } },
                ],
              },
            },
            attempts: {
              none: {
                userId,
                state: { in: [AttemptState.SUBMITTED, AttemptState.EVALUATED] },
              },
            },
          }
        : {}),
    },
    include: {
      sections: {
        select: {
          id: true,
          name: true,
          questionCount: true,
        },
      },
      assignments: userId
        ? {
            where: { userId },
            select: { status: true, completedAt: true },
          }
        : false,
    },
    orderBy: { createdAt: 'desc' },
  });

  const rawMapped = exams.map((exam) => {
    const qCount = exam.sections.reduce((acc, s) => acc + (s.questionCount || 0), 0);
    const userAssignment = userId && Array.isArray((exam as any).assignments)
      ? (exam as any).assignments[0]
      : null;

    const assignmentStatus = userAssignment?.status;
    const assignmentCompletedAt = userAssignment?.completedAt || exam.completedAt;

    return {
      id: exam.id,
      title: exam.title,
      name: exam.title,
      description: exam.description,
      duration: `${exam.duration}M`,
      durationMinutes: exam.duration,
      questionsCount: qCount || 25,
      totalMarks: exam.totalMarks || 100,
      format: exam.examEnvironment === 'FULLSCREEN_BROWSER' ? 'CBT-STRICT' : 'STANDARD',
      track: exam.sections[0]?.name ? `${exam.sections[0].name} Track` : 'Standard Academic Track',
      formula: 'Calculus & Kinetics Verification: $\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}$',
      status: assignmentStatus === AssignmentStatus.completed ? 'COMPLETED' : 'PENDING',
      completedAt: assignmentCompletedAt || null,
    };
  });

  // Apply strict filter to eliminate any completed tests
  return filterAssignableTests(rawMapped) as AssignableTestItem[];
}

/**
 * Service to complete a test assignment.
 */
export async function completeTest(examId: string, userId: string) {
  const now = new Date();

  // Find assignment
  const assignment = await prisma.examAssignment.findUnique({
    where: { examId_userId: { examId, userId } },
  });

  if (!assignment) {
    throw new Error('Assignment not found for this candidate');
  }

  if (assignment.status === AssignmentStatus.completed || assignment.completedAt !== null) {
    const err = new Error('Test already completed');
    (err as any).statusCode = 400;
    throw err;
  }

  await prisma.examAssignment.update({
    where: { examId_userId: { examId, userId } },
    data: {
      status: AssignmentStatus.completed,
      completedAt: now,
    },
  });

  return getAssignableTests(userId);
}

export default {
  getAssignableTests,
  filterAssignableTests,
  completeTest,
};
