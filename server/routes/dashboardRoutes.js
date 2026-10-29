import express from 'express';
import { protect } from '../middleware/auth.js';
import { stats } from '../controllers/dashboardController.js';

const router = express.Router();
router.use(protect);
router.get('/stats', stats);
export default router;
