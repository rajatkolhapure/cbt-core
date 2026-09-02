import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AUTH_CONFIG } from '../config/auth';
import type { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async register(_req: AuthRequest, res: Response, _next: NextFunction) {
    return res.status(403).json({
      error: 'Public candidate registration is disabled. Please contact your institution administrator.',
    });
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.login(req.body);

      res.cookie(AUTH_CONFIG.cookieName, token, AUTH_CONFIG.cookieOptions);

      res.json({
        message: 'Login successful',
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: AuthRequest, res: Response) {
    res.clearCookie(AUTH_CONFIG.cookieName);
    res.json({ message: 'Logged out successfully' });
  }

  async saveHardwareProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const profile = await authService.saveHardwareProfile(userId, req.body, ipAddress);
      res.json({ message: 'Hardware profile recorded', profile });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
