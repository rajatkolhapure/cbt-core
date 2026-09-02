import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export class AdminController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getDashboardStats();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async listStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;
      const result = await adminService.listStudents({
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await adminService.createStudent(req.body);
      res.status(201).json({ message: 'Student created successfully', student });
    } catch (error) {
      next(error);
    }
  }

  async bulkImportStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.bulkImportStudents(req.body);
      res.json({ message: 'Student import completed', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getStudentProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await adminService.getStudentProfile(req.params.id as string);
      res.json({ student });
    } catch (error) {
      next(error);
    }
  }

  async getLiveMonitoring(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getLiveMonitoringData();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async terminateAttempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { attemptId } = req.params;
      const adminName = (req.user as any)?.name || 'Rajat Kolhapure';
      const result = await adminService.terminateCandidateAttempt(attemptId as string, adminName);
      res.json({ message: 'Candidate session terminated successfully', result });
    } catch (error) {
      next(error);
    }
  }

  async sendWarning(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { attemptId } = req.params;
      const { message } = req.body;
      const event = await adminService.sendProctorWarning(attemptId as string, message);
      res.json({ message: 'Warning dispatched to candidate session', event });
    } catch (error) {
      next(error);
    }
  }

  async getCandidateDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { attemptId } = req.params;
      const data = await adminService.getCandidateDetails(attemptId as string);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async addTime(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { attemptId } = req.params;
      const { minutes } = req.body;
      if (!minutes || typeof minutes !== 'number' || minutes <= 0 || minutes > 60) {
        return res.status(400).json({ error: 'Minutes must be a number between 1 and 60' });
      }
      const result = await adminService.addTime(attemptId as string, minutes);
      res.json({ message: `Added ${minutes} minutes to candidate session`, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
