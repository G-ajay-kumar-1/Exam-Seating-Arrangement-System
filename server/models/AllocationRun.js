import mongoose from 'mongoose';

const allocationRunSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  totalStudents: Number,
  allocatedStudents: Number,
  unallocatedStudents: Number,
  totalSeats: Number,
  occupiedSeats: Number,
  availableSeats: Number,
  conflicts: Number,
  conflictRate: Number,
  hallUtilization: Number,
  algorithm: { type: String, default: 'branch-aware-greedy-swap' },
  executionTime: Number
}, { timestamps: true });

export default mongoose.model('AllocationRun', allocationRunSchema);
