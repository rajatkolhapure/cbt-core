import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validators';

const router = Router();

// POST /api/auth/register (Disabled)
router.post('/register', (_req, res) => {
  res.status(403).json({
    error: 'Public candidate registration is disabled. Please contact the administrator (Rajat Kolhapure).',
  });
});

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
