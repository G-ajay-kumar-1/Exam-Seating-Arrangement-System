import express from 'express';
import { searchStudent } from '../controllers/searchController.js';

const router = express.Router();
router.get('/student/:registerNumber', searchStudent);
export default router;
