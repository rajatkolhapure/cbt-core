import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import type { CreateExamInput, UpdateExamInput } from '../validators/exam.validators';

export class ExamService {
  async listExams(user: { userId: string; role: string }) {
    if (user.role === 'ADMIN') {
      return prisma.exam.findMany({
        include: {
          sections: {
            include: {
              subject: { select: { id: true, name: true, code: true } },
              _count: { select: { questions: true } },
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              assignments: true,
              attempts: true,
              examQuestions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Student view: list published exams assigned to the student
    const assignments = await prisma.examAssignment.findMany({
      where: { userId: user.userId },
      include: {
        exam: {
          include: {
            sections: {
              include: {
                subject: { select: { id: true, name: true, code: true } },
              },
              orderBy: { order: 'asc' },
            },
            attempts: {
              where: { userId: user.userId },
              select: {
                id: true,
                state: true,
                startedAt: true,
                submittedAt: true,
                totalMarks: true,
                marksObtained: true,
                percentage: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            _count: {
              select: { examQuestions: true },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments
      .map((a) => a.exam)
      .filter((exam) => exam.isPublished);
  }

  async getExamById(id: string, user: { userId: string; role: string }) {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            subject: true,
            questions: {
              include: {
                question: user.role === 'ADMIN' ? true : {
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
        assignments: user.role === 'ADMIN' ? {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        } : false,
        _count: {
          select: {
            assignments: true,
            attempts: true,
            examQuestions: true,
          },
        },
      },
    });

    if (!exam) {
      throw new AppError(404, 'Exam not found');
    }

    if (user.role !== 'ADMIN' && !exam.isPublished) {
      throw new AppError(403, 'This exam is not available');
    }

    return exam;
  }

  async createExam(data: CreateExamInput) {
    const { sections, ...examData } = data;

    // Use transaction to ensure exam, sections, and exam-question linkages are atomic
    return prisma.$transaction(async (tx) => {
      const exam = await tx.exam.create({
        data: {
          title: examData.title,
          description: examData.description,
          duration: examData.duration,
          totalMarks: examData.totalMarks,
          isPublished: examData.isPublished ?? false,
          shuffleQuestions: examData.shuffleQuestions ?? false,
          shuffleOptions: examData.shuffleOptions ?? false,
          allowReview: examData.allowReview ?? true,
          showResultImmediately: examData.showResultImmediately ?? true,
          integrityPolicy: examData.integrityPolicy ?? null,
          examEnvironment: examData.examEnvironment ?? 'STANDARD_BROWSER',
          scheduledStart: examData.scheduledStart ? new Date(examData.scheduledStart) : null,
          scheduledEnd: examData.scheduledEnd ? new Date(examData.scheduledEnd) : null,
        },
      });

      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          const section = await tx.examSection.create({
            data: {
              examId: exam.id,
              subjectId: sec.subjectId,
              name: sec.name,
              order: sec.order ?? i,
              questionCount: sec.questionCount,
              marksPerQuestion: sec.marksPerQuestion ?? 4,
              negativeMarksPerQuestion: sec.negativeMarksPerQuestion ?? 1,
              allowSectionJump: sec.allowSectionJump ?? true,
            },
          });

          if (sec.questionIds && sec.questionIds.length > 0) {
            for (let qIdx = 0; qIdx < sec.questionIds.length; qIdx++) {
              await tx.examQuestion.create({
                data: {
                  examId: exam.id,
                  sectionId: section.id,
                  questionId: sec.questionIds[qIdx],
                  order: qIdx,
                },
              });
            }
          }
        }
      }

      return tx.exam.findUnique({
        where: { id: exam.id },
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
      });
    });
  }

  async updateExam(id: string, data: UpdateExamInput) {
    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Exam not found');
    }

    const { sections, ...examData } = data;

    return prisma.$transaction(async (tx) => {
      const updatedExam = await tx.exam.update({
        where: { id },
        data: {
          ...examData,
          scheduledStart: examData.scheduledStart !== undefined
            ? (examData.scheduledStart ? new Date(examData.scheduledStart) : null)
            : existing.scheduledStart,
          scheduledEnd: examData.scheduledEnd !== undefined
            ? (examData.scheduledEnd ? new Date(examData.scheduledEnd) : null)
            : existing.scheduledEnd,
        },
      });

      // If sections provided, re-create them
      if (sections) {
        // Delete existing exam questions and sections
        await tx.examQuestion.deleteMany({ where: { examId: id } });
        await tx.examSection.deleteMany({ where: { examId: id } });

        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          const section = await tx.examSection.create({
            data: {
              examId: id,
              subjectId: sec.subjectId,
              name: sec.name,
              order: sec.order ?? i,
              questionCount: sec.questionCount,
              marksPerQuestion: sec.marksPerQuestion ?? 4,
              negativeMarksPerQuestion: sec.negativeMarksPerQuestion ?? 1,
              allowSectionJump: sec.allowSectionJump ?? true,
            },
          });

          if (sec.questionIds && sec.questionIds.length > 0) {
            for (let qIdx = 0; qIdx < sec.questionIds.length; qIdx++) {
              await tx.examQuestion.create({
                data: {
                  examId: id,
                  sectionId: section.id,
                  questionId: sec.questionIds[qIdx],
                  order: qIdx,
                },
              });
            }
          }
        }
      }

      return tx.exam.findUnique({
        where: { id },
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
      });
    });
  }

  async deleteExam(id: string) {
    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Exam not found');
    }

    return prisma.exam.delete({ where: { id } });
  }

  async togglePublish(id: string) {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) {
      throw new AppError(404, 'Exam not found');
    }

    return prisma.exam.update({
      where: { id },
      data: { isPublished: !exam.isPublished },
    });
  }

  async assignStudents(examId: string, studentIds: string[]) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      throw new AppError(404, 'Exam not found');
    }

    // Verify all students exist and have STUDENT role
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
        role: 'STUDENT',
      },
    });

    const validStudentIds = students.map((s) => s.id);

    // Upsert assignments
    const assignments = await Promise.all(
      validStudentIds.map((userId) =>
        prisma.examAssignment.upsert({
          where: {
            examId_userId: {
              examId,
              userId,
            },
          },
          update: {},
          create: {
            examId,
            userId,
          },
        })
      )
    );

    return {
      assignedCount: assignments.length,
      assignedUserIds: validStudentIds,
    };
  }
}

export const examService = new ExamService();
