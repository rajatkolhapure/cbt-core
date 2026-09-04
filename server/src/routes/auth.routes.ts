import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  loginSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../validators/auth.validators';

const router = Router();

// POST /api/auth/send-otp
router.post(
  '/send-otp',
  validate(sendOtpSchema),
  (req, res, next) => authController.sendOtp(req, res, next)
);

// POST /api/auth/verify-otp (completes registration with OTP verification & auto-assigns exam)
router.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  (req, res, next) => authController.verifyOtp(req, res, next)
);

// POST /api/auth/register (direct registration fallback)
router.post(
  '/register',
  validate(registerSchema),
  (req, res, next) => authController.register(req, res, next)
);

// POST /api/auth/login
router.post(
  '/login',
  validate(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  (req, res, next) => authController.me(req, res, next)
);

// POST /api/auth/logout
router.post(
  '/logout',
  (req, res) => authController.logout(req, res)
);

// POST /api/auth/hardware-profile
router.post(
  '/hardware-profile',
  requireAuth,
  (req, res, next) => authController.saveHardwareProfile(req, res, next)
);

export default router;
