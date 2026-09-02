import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createStudentSchema,
  bulkImportStudentsSchema,
} from '../validators/admin.validators';

const router = Router();

// All admin routes strictly require authenticated ADMIN role
router.use(requireAuth);
router.use(requireAdmin);

router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));

// Student management
router.get('/students', (req, res, next) => adminController.listStudents(req, res, next));
router.get('/students/:id', (req, res, next) => adminController.getStudentProfile(req, res, next));

router.post(
  '/students',
  validate(createStudentSchema),
  (req, res, next) => adminController.createStudent(req, res, next)
);

// Live Proctoring & Monitoring
router.get('/live-monitoring', (req, res, next) => adminController.getLiveMonitoring(req, res, next));
router.post('/proctor/terminate/:attemptId', (req, res, next) => adminController.terminateAttempt(req, res, next));
router.post('/proctor/warning/:attemptId', (req, res, next) => adminController.sendWarning(req, res, next));
router.get('/proctor/candidate/:attemptId', (req, res, next) => adminController.getCandidateDetails(req, res, next));
router.post('/proctor/add-time/:attemptId', (req, res, next) => adminController.addTime(req, res, next));

export default router;
