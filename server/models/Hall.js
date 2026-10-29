import mongoose from 'mongoose';

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  roomNumber: { type: String, required: true, trim: true },
  block: { type: String, required: true, trim: true },
  building: { type: String, trim: true, default: '' },
  buildingOrder: { type: Number, default: 0 },
  floor: { type: Number, default: 1 },
  rows: { type: Number, required: true, min: 1 },
  columns: { type: Number, required: true, min: 1 },
  capacity: { type: Number, required: true }
}, { timestamps: true });

hallSchema.pre('validate', function calculateCapacity(next) {
  this.capacity = Number(this.rows || 0) * Number(this.columns || 0);
  next();
});

export default mongoose.model('Hall', hallSchema);
