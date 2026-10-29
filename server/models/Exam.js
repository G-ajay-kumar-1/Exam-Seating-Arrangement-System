import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['Theory Exam', 'Lab Exam', 'Other'] },
  subject: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  departments: {
    type: [String],
    default: [],
    validate: {
      validator(value) {
        return Array.isArray(value) && value.length > 0 && value.every((dept) => ['CSE_AI', 'AIML', 'CSE', 'ECE', 'MEC', 'EEE', 'CSE_DS'].includes(dept));
      },
      message: 'Departments must include valid department codes.'
    }
  },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
