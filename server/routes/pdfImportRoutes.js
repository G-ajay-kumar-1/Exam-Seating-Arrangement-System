import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Student from '../models/Student.js';
import { parseDepartmentPdf } from '../utils/pdfStudentParser.js';
import { validateStudentRegistration } from '../utils/studentValidation.js';
import { emitEvent } from '../sockets/socket.js';

const router = express.Router();
router.use(protect);

router.post('/department-pdf', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Upload a department PDF file.' });
    if (!/\.pdf$/i.test(req.file.originalname)) {
      return res.status(400).json({ message: 'Only PDF files are allowed for department import.' });
    }

    const { records, errors } = await parseDepartmentPdf(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ message: 'No valid student records were found in the PDF.', errors });
    }

    const existing = new Set((await Student.find({}, 'registerNumber')).map((student) => student.registerNumber));
    const valid = [];
    const invalid = [];
    const seen = new Set();

    for (const record of records) {
      const validation = validateStudentRegistration(record.registerNumber, record.branch);
      if (!validation.valid) {
        invalid.push({ ...record, error: validation.reason });
        continue;
      }
      if (existing.has(record.registerNumber) || seen.has(record.registerNumber)) {
        invalid.push({ ...record, error: 'Duplicate register number' });
        continue;
      }
      seen.add(record.registerNumber);
      valid.push(record);
    }

    if (req.body.confirm === 'true' && valid.length) {
      await Student.insertMany(valid, { ordered: false });
    }

    res.json({
      detected: records.length,
      validCount: valid.length,
      invalidCount: invalid.length,
      valid: valid.slice(0, 20),
      invalid: invalid.slice(0, 20),
      errors
    });
  } catch (error) {
    next(error);
  }
});

export default router;
