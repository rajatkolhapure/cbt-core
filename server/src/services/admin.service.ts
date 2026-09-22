import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AUTH_CONFIG } from '../config/auth';
import { AppError } from '../middleware/error.middleware';
import { attemptService } from './attempt.service';
import type { CreateStudentInput, BulkImportStudentsInput } from '../validators/admin.validators';

export class AdminService {
  async getDashboardStats() {
    const [
      totalStudents,
      totalExams,
      publishedExams,
      totalQuestions,
      totalAttempts,
      completedAttempts,
      recentAttempts,
      recentIntegrityEvents,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.exam.count(),
      prisma.exam.count({ where: { isPublished: true } }),
      prisma.question.count({ where: { isActive: true } }),
      prisma.attempt.count(),
      prisma.attempt.count({ where: { state: 'SUBMITTED' } }),
      prisma.attempt.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          exam: { select: { id: true, title: true, totalMarks: true } },
        },
      }),
      prisma.integrityEvent.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          attempt: {
            select: {
              id: true,
              exam: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

    // Calculate score aggregates for completed attempts
    const scoreAggregates = await prisma.attempt.aggregate({
      where: { state: 'SUBMITTED', marksObtained: { not: null } },
      _avg: {
        marksObtained: true,
        percentage: true,
      },
    });

    return {
      stats: {
        totalStudents,
        totalExams,
        publishedExams,
        totalQuestions,
        totalAttempts,
        completedAttempts,
        averageScore: Math.round((scoreAggregates._avg.marksObtained || 0) * 10) / 10,
        averagePercentage: Math.round((scoreAggregates._avg.percentage || 0) * 10) / 10,
      },
      recentAttempts,
      recentIntegrityEvents,
    };
  }

  async listStudents(filters: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'STUDENT',
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              attempts: true,
              examAssignments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createStudent(data: CreateStudentInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      AUTH_CONFIG.bcryptRounds
    );

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async bulkImportStudents(data: BulkImportStudentsInput) {
    const results = {
      total: data.students.length,
      imported: 0,
      errors: [] as { email: string; error: string }[],
    };

    for (const student of data.students) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: student.email },
        });

        if (existing) {
          results.errors.push({ email: student.email, error: 'Email already exists' });
          continue;
        }

        const hashedPassword = await bcrypt.hash(
          student.password || 'student123',
          AUTH_CONFIG.bcryptRounds
        );

        await prisma.user.create({
          data: {
            email: student.email,
            name: student.name,
            password: hashedPassword,
            role: 'STUDENT',
          },
        });

        results.imported++;
      } catch (err: any) {
        results.errors.push({
          email: student.email,
          error: err.message || 'Failed to import student',
        });
      }
    }

    return results;
  }

  async getStudentProfile(studentId: string) {
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        examAssignments: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                duration: true,
                totalMarks: true,
                isPublished: true,
              },
            },
          },
        },
        attempts: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                totalMarks: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    return student;
  }

  async getLiveMonitoringData() {
    const activeAttempts = await prisma.attempt.findMany({
      where: { state: 'IN_PROGRESS' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            hardwareProfiles: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        exam: {
          include: {
            sections: {
              include: {
                questions: { select: { id: true } },
              },
            },
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            selectedOptions: true,
            numericalAnswer: true,
            isMarkedForReview: true,
            isVisited: true,
            updatedAt: true,
          },
        },
        integrityEvents: {
          take: 8,
          orderBy: { timestamp: 'desc' },
          select: {
            id: true,
            eventType: true,
            timestamp: true,
            details: true,
          },
        },
        examSession: {
          select: {
            ipAddress: true,
            userAgent: true,
            examEnvironment: true,
            isActive: true,
            connectedAt: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const now = new Date();

    const activeCandidates = activeAttempts.map((attempt) => {
      const totalQuestions = attempt.exam.sections.reduce(
        (sum, sec) => sum + (sec.questions?.length || 0),
        0
      );

      const answeredCount = attempt.answers.filter(
        (ans) =>
          (Array.isArray(ans.selectedOptions) && ans.selectedOptions.length > 0) ||
          (ans.numericalAnswer !== null && ans.numericalAnswer !== undefined)
      ).length;

      const markedCount = attempt.answers.filter((ans) => ans.isMarkedForReview).length;
      const visitedCount = attempt.answers.filter((ans) => ans.isVisited).length;
      const unansweredCount = Math.max(0, totalQuestions - answeredCount);

      const secondsRemaining = attempt.serverEndTime
        ? Math.max(0, Math.round((new Date(attempt.serverEndTime).getTime() - now.getTime()) / 1000))
        : 0;

      // Count violations
      const violationEvents = attempt.integrityEvents.filter((e) =>
        [
          'FULLSCREEN_EXIT',
          'WINDOW_BLUR',
          'VISIBILITY_HIDDEN',
          'COPY_ATTEMPT',
          'PASTE_ATTEMPT',
          'CUT_ATTEMPT',
          'DEVTOOLS_OPEN',
          'PRINT_ATTEMPT',
        ].includes(e.eventType)
      );

      const violationCount = violationEvents.length;

      let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'IDLE' = 'HEALTHY';
      if (secondsRemaining <= 0) {
        status = 'IDLE';
      } else if (violationCount >= 3) {
        status = 'CRITICAL';
      } else if (violationCount >= 1) {
        status = 'WARNING';
      }

      const lastActivity = attempt.answers.reduce(
        (latest: Date, a) => (a.updatedAt > latest ? a.updatedAt : latest),
        attempt.startedAt || now
      );

      return {
        attemptId: attempt.id,
        student: attempt.user,
        exam: {
          id: attempt.exam.id,
          title: attempt.exam.title,
          duration: attempt.exam.duration,
          totalMarks: attempt.exam.totalMarks,
        },
        startedAt: attempt.startedAt,
        serverEndTime: attempt.serverEndTime,
        secondsRemaining,
        progress: {
          totalQuestions,
          answeredCount,
          markedCount,
          visitedCount,
          unansweredCount,
          percentage: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0,
        },
        violations: {
          totalViolations: violationCount,
          recentEvents: attempt.integrityEvents,
        },
        status,
        session: attempt.examSession,
        hardwareProfile: attempt.user.hardwareProfiles?.[0] || null,
        lastActivity,
      };
    });

    return {
      totalActive: activeCandidates.length,
      activeCandidates,
      timestamp: now.toISOString(),
    };
  }

  async getCandidateDetails(attemptId: string) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            hardwareProfiles: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        exam: {
          include: {
            sections: {
              include: {
                questions: {
                  include: { question: { select: { id: true, text: true, type: true } } },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            selectedOptions: true,
            numericalAnswer: true,
            isMarkedForReview: true,
            isVisited: true,
            updatedAt: true,
          },
        },
        integrityEvents: {
          orderBy: { timestamp: 'desc' },
          select: {
            id: true,
            eventType: true,
            timestamp: true,
            details: true,
            ipAddress: true,
          },
        },
        examSession: {
          select: {
            ipAddress: true,
            userAgent: true,
            examEnvironment: true,
            isActive: true,
            connectedAt: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    const now = new Date();
    const totalQuestions = attempt.exam.sections.reduce(
      (sum, sec) => sum + (sec.questions?.length || 0),
      0
    );
    const answeredCount = attempt.answers.filter(
      (ans) =>
        (Array.isArray(ans.selectedOptions) && ans.selectedOptions.length > 0) ||
        (ans.numericalAnswer !== null && ans.numericalAnswer !== undefined)
    ).length;
    const markedCount = attempt.answers.filter((ans) => ans.isMarkedForReview).length;
    const visitedCount = attempt.answers.filter((ans) => ans.isVisited).length;
    const secondsRemaining = attempt.serverEndTime
      ? Math.max(0, Math.round((new Date(attempt.serverEndTime).getTime() - now.getTime()) / 1000))
      : 0;

    // Build question map with answer status
    const questionMap = attempt.exam.sections.flatMap((sec) =>
      sec.questions.map((eq) => {
        const answer = attempt.answers.find((a) => a.questionId === eq.question.id);
        const hasAnswer = answer && (
          (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0) ||
          (answer.numericalAnswer !== null && answer.numericalAnswer !== undefined)
        );
        return {
          questionId: eq.question.id,
          questionText: eq.question.text.substring(0, 60) + (eq.question.text.length > 60 ? '...' : ''),
          type: eq.question.type,
          section: sec.name,
          status: hasAnswer ? 'ANSWERED' : (answer?.isVisited ? 'VISITED' : 'NOT_VISITED'),
          isMarkedForReview: answer?.isMarkedForReview || false,
          lastUpdated: answer?.updatedAt || null,
        };
      })
    );

    // Count violation types
    const violationTypes = ['FULLSCREEN_EXIT', 'WINDOW_BLUR', 'VISIBILITY_HIDDEN', 'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'CUT_ATTEMPT', 'DEVTOOLS_OPEN', 'PRINT_ATTEMPT', 'CONTEXT_MENU_ATTEMPT'];
    const totalViolations = attempt.integrityEvents.filter((e) => violationTypes.includes(e.eventType)).length;

    return {
      attemptId: attempt.id,
      state: attempt.state,
      student: attempt.user,
      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        duration: attempt.exam.duration,
        totalMarks: attempt.exam.totalMarks,
      },
      startedAt: attempt.startedAt,
      serverEndTime: attempt.serverEndTime,
      secondsRemaining,
      progress: {
        totalQuestions,
        answeredCount,
        markedCount,
        visitedCount,
        unansweredCount: totalQuestions - answeredCount,
        percentage: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0,
      },
      questions: questionMap,
      integrityEvents: attempt.integrityEvents,
      totalViolations,
      session: attempt.examSession,
      hardwareProfile: attempt.user.hardwareProfiles?.[0] || null,
    };
  }

  async addTime(attemptId: string, additionalMinutes: number) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt || attempt.state !== 'IN_PROGRESS') {
      throw new AppError(404, 'Active attempt not found');
    }
    if (!attempt.serverEndTime) {
      throw new AppError(400, 'Attempt has no server end time');
    }

    const newEndTime = new Date(
      new Date(attempt.serverEndTime).getTime() + additionalMinutes * 60 * 1000
    );

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { serverEndTime: newEndTime },
    });

    // Log the time extension
    await prisma.integrityEvent.create({
      data: {
        attemptId,
        userId: attempt.userId,
        eventType: 'TIME_WARNING',
        details: {
          type: 'TIME_EXTENSION',
          additionalMinutes,
          newEndTime: newEndTime.toISOString(),
          issuedBy: 'Rajat Kolhapure',
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { newEndTime, additionalMinutes };
  }

  async terminateCandidateAttempt(attemptId: string, adminName: string = 'Rajat Kolhapure') {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) {
      throw new AppError(404, 'Active attempt not found');
    }

    // Log integrity termination event
    await prisma.integrityEvent.create({
      data: {
        attemptId,
        userId: attempt.userId,
        eventType: 'EXAM_AUTO_SUBMITTED',
        details: {
          reason: `Test session terminated by Chief Proctor (${adminName}) due to integrity violations`,
          terminatedAt: new Date().toISOString(),
        },
      },
    });

    return attemptService.submitAttempt(attemptId, attempt.userId, true);
  }

  async sendProctorWarning(attemptId: string, message?: string) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) {
      throw new AppError(404, 'Active attempt not found');
    }

    return prisma.integrityEvent.create({
      data: {
        attemptId,
        userId: attempt.userId,
        eventType: 'TIME_WARNING',
        details: {
          type: 'PROCTOR_OFFICIAL_WARNING',
          message:
            message ||
            'Official Chief Proctor Warning: Examination security violation detected. Please return to test window immediately.',
          issuedBy: 'Rajat Kolhapure',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }
}

export const adminService = new AdminService();
