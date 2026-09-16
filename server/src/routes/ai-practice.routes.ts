import { Router } from 'express';
import { aiPracticeController } from '../controllers/ai-practice.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Require student/admin authentication for practice sessions
router.use(requireAuth);

// Get complete syllabus taxonomy
router.get('/taxonomy', (req, res, next) =>
  aiPracticeController.getTaxonomy(req, res, next)
);

// Create a new practice session
router.post('/sessions', (req, res, next) =>
  aiPracticeController.createSession(req, res, next)
);

// Get session details & telemetry
router.get('/sessions/:id', (req, res, next) =>
  aiPracticeController.getSession(req, res, next)
);

// Zero-latency buffer prefetch next batch
router.get('/sessions/:id/next-batch', (req, res, next) =>
  aiPracticeController.getNextBatch(req, res, next)
);

// Submit an answer
router.post('/sessions/:id/answer', (req, res, next) =>
  aiPracticeController.submitAnswer(req, res, next)
);

// Finish session and compute scorecard
router.post('/sessions/:id/finish', (req, res, next) =>
  aiPracticeController.finishSession(req, res, next)
);

export default router;
