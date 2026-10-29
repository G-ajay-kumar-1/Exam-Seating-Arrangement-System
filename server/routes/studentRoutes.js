import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createStudent,
  deleteStudent,
  exportStudents,
  getStudent,
  importRegistrationList,
  importStudents,
  listStudents,
  updateStudent
} from '../controllers/studentController.js';

const router = express.Router();
router.use(protect);
router.get('/', listStudents);
router.get('/export', exportStudents);
router.post('/import', upload.single('file'), importStudents);
router.post('/import-list', importRegistrationList);
router.post('/', createStudent);
router.get('/:id', getStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
export default router;
