import express from 'express';
import { protect } from '../middleware/auth.js';
import { createExam, deleteExam, getExam, listExams, updateExam } from '../controllers/examController.js';

const router = express.Router();
router.use(protect);
router.get('/', listExams);
router.post('/', createExam);
router.get('/:id', getExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);
export default router;
