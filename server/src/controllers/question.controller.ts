import { Response, NextFunction } from 'express';
import { questionService } from '../services/question.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export class QuestionController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subjectId, chapterId, type, difficulty, search, page, limit } = req.query;
      const result = await questionService.listQuestions({
        subjectId: subjectId as string,
        chapterId: chapterId as string,
        type: type as string,
        difficulty: difficulty as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const question = await questionService.getQuestionById(req.params.id as string);
      res.json({ question });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const question = await questionService.createQuestion(req.body);
      res.status(201).json({ message: 'Question created successfully', question });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const question = await questionService.updateQuestion(req.params.id as string, req.body);
      res.json({ message: 'Question updated successfully', question });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await questionService.deleteQuestion(req.params.id as string);
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async bulkImport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await questionService.bulkImport(req.body);
      res.json({ message: 'Bulk import processed', ...result });
    } catch (error) {
      next(error);
    }
  }

  async export(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.query;
      const questions = await questionService.exportQuestions(subjectId as string);
      res.json({ questions });
    } catch (error) {
      next(error);
    }
  }

  async listSubjects(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subjects = await questionService.listSubjects();
      res.json({ subjects });
    } catch (error) {
      next(error);
    }
  }

  async createSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subject = await questionService.createSubject(req.body);
      res.status(201).json({ message: 'Subject created successfully', subject });
    } catch (error) {
      next(error);
    }
  }

  async createChapter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chapter = await questionService.createChapter(req.body);
      res.status(201).json({ message: 'Chapter created successfully', chapter });
    } catch (error) {
      next(error);
    }
  }
}

export const questionController = new QuestionController();
