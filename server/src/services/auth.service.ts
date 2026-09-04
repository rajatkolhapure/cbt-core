import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import { AUTH_CONFIG } from '../config/auth';
import { AppError } from '../middleware/error.middleware';
import prisma from '../config/database';
import type { JwtPayload } from '../middleware/auth.middleware';
import type { LoginInput, RegisterInput, SendOtpInput, VerifyOtpInput } from '../validators/auth.validators';

const getResendClient = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.trim() === '' || key.startsWith('re_123456789')) return null;
  return new Resend(key.trim());
};

export class AuthService {
  async sendOtp(data: SendOtpInput) {
    const email = data.email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists.');
    }

    // Cooldown check (60 seconds)
    const recentOtp = await prisma.otpToken.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const secondsLeft = Math.ceil((recentOtp.createdAt.getTime() + 60 * 1000 - Date.now()) / 1000);
      throw new AppError(429, `Please wait ${secondsLeft > 0 ? secondsLeft : 60} seconds before requesting a new code.`);
    }

    // Purge old tokens for this email
    await prisma.otpToken.deleteMany({
      where: { email },
    });

    // Generate 6-digit code
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpToken.create({
      data: {
        email,
        codeHash,
        expiresAt,
      },
    });

    // Send email via Resend
    const resendClient = getResendClient();
    if (resendClient) {
      try {
        await resendClient.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'CBT Verification <noreply@cbt.rajatkolhapure.me>',
          to: email,
          subject: `${otpCode} is your CBT Examination Verification Code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #1C1D21; background-color: #FBF9F5; color: #1C1D21;">
              <div style="border-bottom: 2px solid #1C1D21; padding-bottom: 12px; margin-bottom: 18px;">
                <h2 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #1A2B4C;">CBT Official Examination Portal</h2>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #575A65;">Candidate Verification &amp; Security</p>
              </div>
              <p style="font-size: 14px; margin-bottom: 12px;">Hello ${data.name || 'Candidate'},</p>
              <p style="font-size: 14px; margin-bottom: 20px;">Use the following 6-digit verification code to complete your registration and unlock your assigned test paper:</p>
              <div style="background-color: #1A2B4C; color: #FBF9F5; text-align: center; padding: 16px; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace; border: 1px solid #1C1D21; margin-bottom: 20px;">
                ${otpCode}
              </div>
              <p style="font-size: 12px; color: #575A65; margin-bottom: 8px;">This code is valid for 10 minutes. If you did not request this verification, no action is required.</p>
              <div style="border-top: 1px solid #DCD6CD; padding-top: 12px; margin-top: 24px; font-size: 10px; color: #8E929E; text-align: center;">
                Chief Proctor: Rajat Kolhapure · Computer-Based Testing Infrastructure
              </div>
            </div>
          `,
        });
      } catch (emailErr: any) {
        console.error('[Resend Error]', emailErr);
        throw new AppError(500, `Failed to deliver verification email: ${emailErr.message || 'Please check your email address.'}`);
      }
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn(`\n========================================\n[OTP NOTIFICATION]\nEmail: ${email}\nOTP Code: ${otpCode}\n(Configure RESEND_API_KEY in server/.env to dispatch live emails)\n========================================\n`);
    }

    return { message: 'Verification code sent to your email address.' };
  }

  async verifyOtp(data: VerifyOtpInput) {
    const email = data.email.toLowerCase().trim();
    const candidateId = data.candidateId?.trim() || null;

    // Check token
    const tokenRecord = await prisma.otpToken.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!tokenRecord) {
      throw new AppError(400, 'Verification code has expired or was not requested. Please request a new code.');
    }

    const isMatch = await bcrypt.compare(data.code.trim(), tokenRecord.codeHash);
    if (!isMatch) {
      throw new AppError(400, 'Invalid verification code. Please check and try again.');
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists.');
    }

    // Check candidateId uniqueness if provided
    if (candidateId) {
      const existingCandidate = await prisma.user.findUnique({
        where: { candidateId },
      });
      if (existingCandidate) {
        throw new AppError(409, 'Candidate Roll Number is already registered.');
      }
    }

    // Hash password & create user
    const hashedPassword = await bcrypt.hash(data.password, AUTH_CONFIG.bcryptRounds);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: data.name.trim(),
        candidateId,
        role: 'STUDENT',
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

    // Automatic Exam Assignment:
    // Find default active published exam (e.g., "MHT-CET Practice Mock 01" or first published exam)
    const defaultExam =
      (await prisma.exam.findFirst({
        where: { title: { contains: 'MHT-CET', mode: 'insensitive' } },
        orderBy: { createdAt: 'asc' },
      })) ||
      (await prisma.exam.findFirst({
        where: { isPublished: true },
        orderBy: { createdAt: 'asc' },
      })) ||
      (await prisma.exam.findFirst({
        orderBy: { createdAt: 'asc' },
      }));

    if (defaultExam) {
      await prisma.examAssignment.upsert({
        where: {
          examId_userId: {
            examId: defaultExam.id,
            userId: user.id,
          },
        },
        create: {
          examId: defaultExam.id,
          userId: user.id,
        },
        update: {},
      });
      console.log(`[Registration] Assigned exam "${defaultExam.title}" to newly registered user ${user.email}`);
    }

    // Delete used OTP tokens
    await prisma.otpToken.deleteMany({
      where: { email },
    });

    const token = this.generateToken(user);
    return { user, token };
  }

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
        role: 'STUDENT',
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

    const defaultExam = await prisma.exam.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' },
    });

    if (defaultExam) {
      await prisma.examAssignment.create({
        data: {
          examId: defaultExam.id,
          userId: user.id,
        },
      });
    }

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
