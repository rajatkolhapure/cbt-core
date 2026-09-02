import { Router } from 'express';
import { integrityController } from '../controllers/integrity.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Global integrity monitoring log view (Admin only)
router.use(requireAuth);
router.use(requireAdmin);

router.get('/events', (req, res, next) => integrityController.listAllEvents(req, res, next));

export default router;
