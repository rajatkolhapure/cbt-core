import { Response, NextFunction } from 'express';
import { examService } from '../services/exam.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export class ExamController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exams = await examService.listExams({
        userId: req.user!.userId,
        role: req.user!.role,
      });
      res.json({ exams });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exam = await examService.getExamById(req.params.id as string, {
        userId: req.user!.userId,
        role: req.user!.role,
      });
      res.json({ exam });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exam = await examService.createExam(req.body);
      res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exam = await examService.updateExam(req.params.id as string, req.body);
      res.json({ message: 'Exam updated successfully', exam });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await examService.deleteExam(req.params.id as string);
      res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async togglePublish(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exam = await examService.togglePublish(req.params.id as string);
      res.json({
        message: `Exam ${exam.isPublished ? 'published' : 'unpublished'} successfully`,
        exam,
      });
    } catch (error) {
      next(error);
    }
  }

  async assign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await examService.assignStudents(req.params.id as string, req.body.studentIds);
      res.json({ message: 'Students assigned successfully', ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const examController = new ExamController();
