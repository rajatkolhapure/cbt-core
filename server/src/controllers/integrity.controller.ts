import { Response, NextFunction } from 'express';
import { integrityService } from '../services/integrity.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export class IntegrityController {
  async logEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const event = await integrityService.logEvent(
        req.params.id as string,
        req.user!.userId,
        ipAddress,
        req.body
      );
      res.status(201).json({ message: 'Event logged', event });
    } catch (error) {
      next(error);
    }
  }

  async getAttemptEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await integrityService.getEventsForAttempt(
        req.params.id as string,
        {
          userId: req.user!.userId,
          role: req.user!.role,
        }
      );
      res.json({ events });
    } catch (error) {
      next(error);
    }
  }

  async listAllEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventType, userId, attemptId, page, limit } = req.query;
      const result = await integrityService.listAllEvents({
        eventType: eventType as string,
        userId: userId as string,
        attemptId: attemptId as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const integrityController = new IntegrityController();
