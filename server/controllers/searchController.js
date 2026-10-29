import SeatingPlan from '../models/SeatingPlan.js';
import Student from '../models/Student.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function searchStudent(req, res, next) {
  try {
    const term = escapeRegex(req.params.registerNumber);
    const student = await Student.findOne({
      $or: [
        { registerNumber: new RegExp(`^${term}$`, 'i') },
        { name: new RegExp(term, 'i') }
      ]
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const allocations = await SeatingPlan.find({ studentId: student._id })
      .populate('examId')
      .populate('hallId')
      .sort({ createdAt: -1 });
    res.json({ student, allocations });
  } catch (error) {
    next(error);
  }
}
