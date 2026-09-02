import { Response, NextFunction } from 'express';
import { attemptService } from '../services/attempt.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export class AttemptController {
  async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const result = await attemptService.startAttempt(
        req.body,
        req.user!.userId,
        ipAddress
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAttempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await attemptService.getAttemptState(
        req.params.id as string,
        req.user!.userId,
        req.user!.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async saveAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const answer = await attemptService.saveAnswer(
        req.params.id as string,
        req.user!.userId,
        req.body
      );
      res.json({ message: 'Answer saved successfully', answer });
    } catch (error) {
      next(error);
    }
  }

  async bulkSaveAnswers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await attemptService.bulkSaveAnswers(
        req.params.id as string,
        req.user!.userId,
        req.body
      );
      res.json({ message: 'Answers saved in bulk', ...result });
    } catch (error) {
      next(error);
    }
  }

  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await attemptService.submitAttempt(
        req.params.id as string,
        req.user!.userId,
        req.body.isAutoSubmit || false
      );
      res.json({ message: 'Exam submitted successfully', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await attemptService.getResult(
        req.params.id as string,
        req.user!.userId,
        req.user!.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await attemptService.getReview(
        req.params.id as string,
        req.user!.userId,
        req.user!.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const attemptController = new AttemptController();
