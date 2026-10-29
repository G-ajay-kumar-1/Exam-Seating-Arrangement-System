import Exam from '../models/Exam.js';
import { emitEvent } from '../sockets/socket.js';

export const listExams = async (req, res, next) => {
  try { res.json(await Exam.find().sort({ date: -1 })); } catch (error) { next(error); }
};
export const createExam = async (req, res, next) => {
  try {
    const { name, type, subject, date, startTime, endTime, academicYear, semester, departments } = req.body;
    const normalizedDepartments = Array.isArray(departments) ? departments.filter(Boolean) : [];
    if (!name || !type || !subject || !date || !startTime || !endTime || !academicYear || !semester) {
      return res.status(400).json({ message: 'All fields are required: name, type, subject, date, startTime, endTime, academicYear, semester' });
    }
    if (!normalizedDepartments.length) {
      return res.status(400).json({ message: 'At least one department must be selected for the exam.' });
    }
    if (new Date(date) < new Date()) {
      return res.status(400).json({ message: 'Exam date must be in the future' });
    }
    const exam = await Exam.create({ name, type, subject, date, startTime, endTime, academicYear, semester, departments: normalizedDepartments, status: 'Scheduled' });
    emitEvent('examCreated', { exam });
    res.status(201).json(exam);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map((e) => e.message).join(', ') });
    }
    next(error);
  }
};
export const getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) { next(error); }
};
export const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    emitEvent('examCreated', { exam });
    res.json(exam);
  } catch (error) { next(error); }
};
export const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (error) { next(error); }
};
