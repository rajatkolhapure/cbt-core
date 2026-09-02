import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateSubjectInput,
  CreateChapterInput,
  BulkImportQuestionsInput,
} from '../validators/question.validators';

export class QuestionService {
  async listQuestions(filters: {
    subjectId?: string;
    chapterId?: string;
    type?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.chapterId) where.chapterId = filters.chapterId;
    if (filters.type) where.type = filters.type;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.search) {
      where.OR = [
        { text: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true, code: true } },
          chapter: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getQuestionById(id: string) {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        subject: true,
        chapter: true,
      },
    });

    if (!question) {
      throw new AppError(404, 'Question not found');
    }

    return question;
  }

  async createQuestion(data: CreateQuestionInput) {
    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
    });
    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    if (data.chapterId) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: data.chapterId },
      });
      if (!chapter) {
        throw new AppError(404, 'Chapter not found');
      }
    }

    return prisma.question.create({
      data: {
        type: data.type,
        text: data.text,
        options: data.options ?? null,
        correctAnswer: data.correctAnswer,
        marks: data.marks,
        negativeMarks: data.negativeMarks,
        difficulty: data.difficulty,
        explanation: data.explanation || null,
        imageUrl: data.imageUrl || null,
        tags: data.tags || [],
        subjectId: data.subjectId,
        chapterId: data.chapterId || null,
        isActive: data.isActive ?? true,
      },
      include: {
        subject: true,
        chapter: true,
      },
    });
  }

  async updateQuestion(id: string, data: UpdateQuestionInput) {
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Question not found');
    }

    return prisma.question.update({
      where: { id },
      data: {
        ...data,
        options: data.options !== undefined ? data.options : existing.options,
        correctAnswer: data.correctAnswer !== undefined ? data.correctAnswer : existing.correctAnswer,
        tags: data.tags !== undefined ? data.tags : existing.tags,
      },
      include: {
        subject: true,
        chapter: true,
      },
    });
  }

  async deleteQuestion(id: string) {
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Question not found');
    }

    // Soft delete so historical exams/answers retain referential integrity
    return prisma.question.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async bulkImport(data: BulkImportQuestionsInput) {
    const results = {
      total: data.questions.length,
      imported: 0,
      errors: [] as { index: number; question: string; error: string }[],
    };

    // Cache subjects & chapters
    const subjects = await prisma.subject.findMany({
      include: { chapters: true },
    });

    for (let i = 0; i < data.questions.length; i++) {
      const item = data.questions[i];
      try {
        // Match subject by name or code case-insensitively
        let subject = subjects.find(
          (s) =>
            s.name.toLowerCase() === item.subject.toLowerCase() ||
            s.code.toLowerCase() === item.subject.toLowerCase()
        );

        if (!subject) {
          // Auto create subject if not found
          subject = await prisma.subject.create({
            data: {
              name: item.subject,
              code: item.subject.substring(0, 4).toUpperCase(),
            },
            include: { chapters: true },
          });
          subjects.push(subject);
        }

        let chapterId: string | null = null;
        if (item.chapter) {
          let chapter = subject.chapters.find(
            (c) => c.name.toLowerCase() === item.chapter!.toLowerCase()
          );
          if (!chapter) {
            chapter = await prisma.chapter.create({
              data: {
                name: item.chapter,
                subjectId: subject.id,
              },
            });
            subject.chapters.push(chapter);
          }
          chapterId = chapter.id;
        }

        // Normalize question type
        const normalizedType = item.type.toUpperCase() as any;
        const normalizedDifficulty = (item.difficulty || 'MEDIUM').toUpperCase() as any;

        await prisma.question.create({
          data: {
            type: normalizedType,
            text: item.question,
            options: item.options ? (item.options as any) : undefined,
            correctAnswer: item.correctAnswer,
            marks: item.marks ?? 4,
            negativeMarks: item.negativeMarks ?? 1,
            difficulty: normalizedDifficulty,
            explanation: item.explanation || null,
            tags: item.tags || [],
            subjectId: subject.id,
            chapterId,
          },
        });

        results.imported++;
      } catch (err: any) {
        results.errors.push({
          index: i,
          question: item.question,
          error: err.message || 'Failed to import question',
        });
      }
    }

    return results;
  }

  async exportQuestions(subjectId?: string) {
    const where: any = { isActive: true };
    if (subjectId) where.subjectId = subjectId;

    return prisma.question.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
        chapter: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listSubjects() {
    return prisma.subject.findMany({
      include: {
        chapters: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createSubject(data: CreateSubjectInput) {
    const existing = await prisma.subject.findFirst({
      where: {
        OR: [{ name: data.name }, { code: data.code }],
      },
    });

    if (existing) {
      throw new AppError(409, 'Subject with this name or code already exists');
    }

    return prisma.subject.create({
      data,
      include: { chapters: true },
    });
  }

  async createChapter(data: CreateChapterInput) {
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    const existing = await prisma.chapter.findUnique({
      where: {
        subjectId_name: {
          subjectId: data.subjectId,
          name: data.name,
        },
      },
    });

    if (existing) {
      throw new AppError(409, 'Chapter already exists in this subject');
    }

    return prisma.chapter.create({
      data,
    });
  }
}

export const questionService = new QuestionService();
