import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  registerNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  branch: { type: String, required: true, uppercase: true, trim: true, index: true },
  email: { type: String, trim: true },
  year: { type: Number, required: true, min: 1, max: 5 },
  section: { type: String, trim: true }
}, { timestamps: true });

studentSchema.index({ branch: 1, year: 1 });

export default mongoose.model('Student', studentSchema);
