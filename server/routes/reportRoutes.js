import express from 'express';
import { protect } from '../middleware/auth.js';
import { csvReport, excelReport, pdfReport } from '../controllers/reportController.js';

const router = express.Router();
router.use(protect);
router.get('/export/pdf/:examId', pdfReport);
router.get('/export/excel/:examId', excelReport);
router.get('/export/csv/:examId', csvReport);
router.get('/:examId/pdf', pdfReport);
router.get('/:examId/excel', excelReport);
router.get('/:examId/csv', csvReport);
export default router;
