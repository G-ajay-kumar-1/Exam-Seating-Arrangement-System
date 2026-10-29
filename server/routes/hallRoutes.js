import express from 'express';
import { protect } from '../middleware/auth.js';
import { createHall, deleteHall, listHalls, updateHall } from '../controllers/hallController.js';

const router = express.Router();
router.use(protect);
router.get('/', listHalls);
router.post('/', createHall);
router.put('/:id', updateHall);
router.delete('/:id', deleteHall);
export default router;
