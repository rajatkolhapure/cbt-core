import { Response, NextFunction } from 'express';
import { aiPracticeService } from '../services/ai-practice.service';
import { aiGeneratorService } from '../services/ai-generator.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export class AiPracticeController {
  async getTaxonomy(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taxonomy = aiGeneratorService.getTaxonomy();
      res.json({ taxonomy });
    } catch (error) {
      next(error);
    }
  }

  async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await aiPracticeService.createSession(userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const session = await aiPracticeService.getSession(id, userId);
      res.json({ session });
    } catch (error) {
      next(error);
    }
  }

  async getNextBatch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const count = Number(req.query.count) || 5;
      const questions = await aiPracticeService.getNextBatch(id, userId, count);
      res.json({ questions });
    } catch (error) {
      next(error);
    }
  }

  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const result = await aiPracticeService.submitAnswer(id, userId, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async finishSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const scorecard = await aiPracticeService.finishSession(id, userId);
      res.json(scorecard);
    } catch (error) {
      next(error);
    }
  }
}

export const aiPracticeController = new AiPracticeController();
export default aiPracticeController;
