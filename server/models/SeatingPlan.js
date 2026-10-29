import mongoose from 'mongoose';

const seatingPlanSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  registerNumber: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  seatNumber: { type: String, required: true, index: true },
  row: { type: Number, required: true },
  column: { type: Number, required: true },
  branch: { type: String, required: true, index: true },
  block: { type: String, required: true },
  status: { type: String, enum: ['occupied'], default: 'occupied' },
  conflict: { type: Boolean, default: false }
}, { timestamps: true });

seatingPlanSchema.index({ examId: 1, hallId: 1, seatNumber: 1 }, { unique: true });
seatingPlanSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('SeatingPlan', seatingPlanSchema);
