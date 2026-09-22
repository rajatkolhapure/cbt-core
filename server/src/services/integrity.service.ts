import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import type { IntegrityEventInput } from '../validators/attempt.validators';

export class IntegrityService {
  async logEvent(
    attemptId: string,
    userId: string,
    ipAddress: string | undefined,
    data: IntegrityEventInput
  ) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { exam: true },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to attempt');
    }

    const event = await prisma.integrityEvent.create({
      data: {
        attemptId,
        userId,
        eventType: data.eventType as any,
        details: data.details ? (data.details as any) : undefined,
        ipAddress: ipAddress || null,
      },
    });

    return event;
  }

  async getEventsForAttempt(attemptId: string, user: { userId: string; role: string }) {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (user.role !== 'ADMIN' && attempt.userId !== user.userId) {
      throw new AppError(403, 'Unauthorized access to attempt events');
    }

    return prisma.integrityEvent.findMany({
      where: { attemptId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async listAllEvents(filters: {
    eventType?: string;
    userId?: string;
    attemptId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.eventType) where.eventType = filters.eventType;
    if (filters.userId) where.userId = filters.userId;
    if (filters.attemptId) where.attemptId = filters.attemptId;

    const [total, events] = await Promise.all([
      prisma.integrityEvent.count({ where }),
      prisma.integrityEvent.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          attempt: {
            select: {
              id: true,
              exam: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const integrityService = new IntegrityService();
