import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth';
import { AppError } from '../middleware/error.middleware';
import prisma from '../config/database';
import type { JwtPayload } from '../middleware/auth.middleware';
import type { LoginInput, RegisterInput } from '../validators/auth.validators';

export class AuthService {
  async register(data: RegisterInput) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    // Check candidateId uniqueness if provided
    if (data.candidateId) {
      const existingCandidate = await prisma.user.findUnique({
        where: { candidateId: data.candidateId },
      });
      if (existingCandidate) {
        throw new AppError(409, 'Candidate ID already in use');
      }
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      AUTH_CONFIG.bcryptRounds
    );

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        candidateId: data.candidateId,
        role: 'STUDENT', // Registration always creates students
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        candidateId: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is disabled');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        candidateId: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async saveHardwareProfile(
    userId: string,
    data: {
      isVM: boolean;
      gpuRenderer: string;
      gpuVendor: string;
      logicalCores: number;
      deviceMemoryGB?: number;
      screenResolution: string;
      isMultiMonitor: boolean;
      monitorCount: number;
      userAgent: string;
      detectedFlags?: string[];
    },
    ipAddress?: string
  ) {
    const profile = await prisma.hardwareProfile.create({
      data: {
        userId,
        isVM: data.isVM ?? false,
        gpuRenderer: data.gpuRenderer || 'Unknown',
        gpuVendor: data.gpuVendor || 'Unknown',
        logicalCores: data.logicalCores || 1,
        deviceMemoryGB: data.deviceMemoryGB,
        screenResolution: data.screenResolution || 'Unknown',
        isMultiMonitor: data.isMultiMonitor ?? false,
        monitorCount: data.monitorCount || 1,
        userAgent: data.userAgent || 'Unknown',
        detectedFlags: (data.detectedFlags as any) || [],
      },
    });

    // Check for active attempt to log proactive integrity events if suspicious
    const activeAttempt = await prisma.attempt.findFirst({
      where: { userId, state: 'IN_PROGRESS' },
      orderBy: { createdAt: 'desc' },
    });

    if (data.isVM && activeAttempt) {
      await prisma.integrityEvent.create({
        data: {
          attemptId: activeAttempt.id,
          userId,
          eventType: 'SUSPICIOUS_HARDWARE',
          details: {
            reason: 'Virtual Machine Environment Detected',
            gpuRenderer: data.gpuRenderer,
            gpuVendor: data.gpuVendor,
            detectedFlags: data.detectedFlags,
          },
          ipAddress,
        },
      });
    }

    if (data.isMultiMonitor && data.monitorCount > 1 && activeAttempt) {
      await prisma.integrityEvent.create({
        data: {
          attemptId: activeAttempt.id,
          userId,
          eventType: 'MULTI_MONITOR_ON_LOGIN',
          details: {
            reason: 'Multiple Display Monitors Detected',
            monitorCount: data.monitorCount,
            screenResolution: data.screenResolution,
          },
          ipAddress,
        },
      });
    }

    return profile;
  }

  private generateToken(user: { id: string; email: string; role: string }): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, AUTH_CONFIG.jwtSecret, {
      expiresIn: AUTH_CONFIG.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
