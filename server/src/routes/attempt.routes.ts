import { Router } from 'express';
import { attemptController } from '../controllers/attempt.controller';
import { integrityController } from '../controllers/integrity.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  startAttemptSchema,
  saveAnswerSchema,
  bulkSaveAnswersSchema,
  submitAttemptSchema,
  integrityEventSchema,
} from '../validators/attempt.validators';

const router = Router();

// All attempt routes require authentication
router.use(requireAuth);

// Start an exam attempt
router.post(
  '/start',
  validate(startAttemptSchema),
  (req, res, next) => attemptController.start(req, res, next)
);

// Get current attempt state & timer
router.get(
  '/:id',
  (req, res, next) => attemptController.getAttempt(req, res, next)
);

// Save single answer
router.post(
  '/:id/answer',
  validate(saveAnswerSchema),
  (req, res, next) => attemptController.saveAnswer(req, res, next)
);

// Bulk save answers (for reconnection sync)
router.post(
  '/:id/bulk-save',
  validate(bulkSaveAnswersSchema),
  (req, res, next) => attemptController.bulkSaveAnswers(req, res, next)
);

// Submit exam
router.post(
  '/:id/submit',
  validate(submitAttemptSchema),
  (req, res, next) => attemptController.submit(req, res, next)
);

// Get result after submission
router.get(
  '/:id/result',
  (req, res, next) => attemptController.getResult(req, res, next)
);

// Get detailed review (questions, explanations)
router.get(
  '/:id/review',
  (req, res, next) => attemptController.getReview(req, res, next)
);

// Integrity events for attempt
router.post(
  '/:id/integrity-event',
  validate(integrityEventSchema),
  (req, res, next) => integrityController.logEvent(req, res, next)
);

router.get(
  '/:id/integrity-events',
  (req, res, next) => integrityController.getAttemptEvents(req, res, next)
);

export default router;
