import { Router } from 'express';
import { examController } from '../controllers/exam.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createExamSchema,
  updateExamSchema,
  assignExamSchema,
} from '../validators/exam.validators';

const router = Router();

// All exam routes require authentication
router.use(requireAuth);

// Student & Admin can view list (filtered by role)
router.get('/', (req, res, next) => examController.list(req, res, next));
router.get('/:id', (req, res, next) => examController.getById(req, res, next));

// Admin-only exam management
router.post(
  '/',
  requireAdmin,
  validate(createExamSchema),
  (req, res, next) => examController.create(req, res, next)
);

router.put(
  '/:id',
  requireAdmin,
  validate(updateExamSchema),
  (req, res, next) => examController.update(req, res, next)
);

router.delete(
  '/:id',
  requireAdmin,
  (req, res, next) => examController.delete(req, res, next)
);

router.patch(
  '/:id/publish',
  requireAdmin,
  (req, res, next) => examController.togglePublish(req, res, next)
);

router.post(
  '/:id/assign',
  requireAdmin,
  validate(assignExamSchema),
  (req, res, next) => examController.assign(req, res, next)
);

export default router;
