import { Router } from 'express';
import { questionController } from '../controllers/question.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createQuestionSchema,
  updateQuestionSchema,
  createSubjectSchema,
  createChapterSchema,
  bulkImportQuestionsSchema,
} from '../validators/question.validators';

const router = Router();

// All question routes require authentication
router.use(requireAuth);

// Subject & Chapter routes
router.get('/subjects', (req, res, next) => questionController.listSubjects(req, res, next));
router.post(
  '/subjects',
  requireAdmin,
  validate(createSubjectSchema),
  (req, res, next) => questionController.createSubject(req, res, next)
);
router.post(
  '/chapters',
  requireAdmin,
  validate(createChapterSchema),
  (req, res, next) => questionController.createChapter(req, res, next)
);

// Question routes (Admin only for management)
router.get('/', requireAdmin, (req, res, next) => questionController.list(req, res, next));
router.get('/export', requireAdmin, (req, res, next) => questionController.export(req, res, next));
router.get('/:id', requireAdmin, (req, res, next) => questionController.getById(req, res, next));

router.post(
  '/',
  requireAdmin,
  validate(createQuestionSchema),
  (req, res, next) => questionController.create(req, res, next)
);

router.post(
  '/import',
  requireAdmin,
  validate(bulkImportQuestionsSchema),
  (req, res, next) => questionController.bulkImport(req, res, next)
);

router.put(
  '/:id',
  requireAdmin,
  validate(updateQuestionSchema),
  (req, res, next) => questionController.update(req, res, next)
);

router.delete(
  '/:id',
  requireAdmin,
  (req, res, next) => questionController.delete(req, res, next)
);

export default router;
