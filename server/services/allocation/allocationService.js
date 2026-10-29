import Student from '../../models/Student.js';
import Exam from '../../models/Exam.js';
import Hall from '../../models/Hall.js';
import SeatingPlan from '../../models/SeatingPlan.js';
import AllocationRun from '../../models/AllocationRun.js';
import { emitEvent } from '../../sockets/socket.js';
import { generateSeats } from './seatGenerator.js';
import { greedyAllocate } from './greedyAllocator.js';
import { improveWithSwaps } from './backtrackingAllocator.js';
import { validateAllocation } from './validator.js';
import { compareCampusHalls, createDefaultHallCatalog } from '../../utils/buildingConfig.js';

export async function generateAllocation(examId, options = {}) {
  const started = Date.now();
  emitEvent(options.regenerate ? 'allocationRegenerated' : 'allocationStarted', { examId });
  const exam = await Exam.findById(examId);
  if (!exam) {
    const error = new Error('Invalid exam');
    error.statusCode = 404;
    throw error;
  }

  const requestedHallIds = Array.isArray(options.hallIds) ? options.hallIds.filter(Boolean) : [];
  let halls;

  if (requestedHallIds.length) {
    halls = await Hall.find({ _id: { $in: requestedHallIds } });
    halls.sort(compareCampusHalls);
  } else {
    const existingHalls = await Hall.find();
    if (existingHalls.length === 0) {
      const generatedHalls = createDefaultHallCatalog();
      await Hall.insertMany(generatedHalls, { ordered: false });
      halls = generatedHalls;
    } else {
      halls = existingHalls;
      halls.sort(compareCampusHalls);
    }
  }

  const examDepartments = Array.isArray(exam.departments) && exam.departments.length ? exam.departments : null;
  const students = await Student.find(examDepartments ? { branch: { $in: examDepartments } } : {}).sort({ branch: 1, registerNumber: 1 });
  if (!students.length) {
    throw new Error('Allocation cannot be completed for the selected departments. Add students for the selected departments first.');
  }
  if (!halls.length) throw new Error('Allocation cannot be completed. Please add an examination hall.');

  const seats = generateSeats(halls);
  if (seats.length < students.length) {
    const error = new Error(`Allocation cannot be completed. Required seats: ${students.length}. Available seats: ${seats.length}. Please add another examination hall.`);
    error.statusCode = 400;
    throw error;
  }

  let result = greedyAllocate(students, seats);
  const improved = improveWithSwaps(result.assignments);
  const validation = validateAllocation({
    assignments: improved,
    unallocated: result.unallocated,
    totalStudents: students.length,
    totalSeats: seats.length
  });

  await SeatingPlan.deleteMany({ examId });
  const docs = validation.rows.map((entry) => ({
    examId,
    hallId: entry.hallId,
    studentId: entry.student._id,
    registerNumber: entry.student.registerNumber,
    studentName: entry.student.name,
    seatNumber: entry.seatNumber,
    row: entry.row,
    column: entry.column,
    branch: entry.student.branch,
    block: entry.hall.block,
    conflict: entry.conflict
  }));
  await SeatingPlan.insertMany(docs, { ordered: false });

  const run = await AllocationRun.create({
    examId,
    ...validation.summary,
    executionTime: Number(((Date.now() - started) / 1000).toFixed(2))
  });
  const populated = await getAllocation(examId);
  emitEvent('allocationCompleted', { examId, summary: run });
  emitEvent('seatingUpdated', { examId, summary: run });
  return { exam, run, ...populated };
}

export async function getAllocation(examId) {
  const plans = await SeatingPlan.find({ examId })
    .populate('hallId')
    .populate('studentId')
    .sort({ block: 1, row: 1, column: 1 });
  const latestRun = await AllocationRun.findOne({ examId }).sort({ createdAt: -1 });
  return { plans, summary: latestRun };
}

export async function validateExistingAllocation(examId) {
  const allocation = await getAllocation(examId);
  return allocation.summary || {
    totalStudents: 0,
    allocatedStudents: allocation.plans.length,
    conflicts: allocation.plans.filter((plan) => plan.conflict).length
  };
}
