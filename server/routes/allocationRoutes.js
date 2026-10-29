import express from 'express';
import { protect } from '../middleware/auth.js';
import { byExam, generate, regenerate, validate } from '../controllers/allocationController.js';

const router = express.Router();
router.use(protect);
router.post('/generate', generate);
router.post('/regenerate', regenerate);
router.get('/:examId', byExam);
router.get('/:examId/validate', validate);
export default router;
