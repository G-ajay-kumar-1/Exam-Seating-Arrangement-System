import Hall from '../models/Hall.js';
import { emitEvent } from '../sockets/socket.js';
import { compareCampusHalls } from '../utils/buildingConfig.js';

export const listHalls = async (req, res, next) => {
  try {
    const halls = await Hall.find();
    halls.sort(compareCampusHalls);
    res.json(halls);
  } catch (error) { next(error); }
};
export const createHall = async (req, res, next) => {
  try {
    const hall = await Hall.create(req.body);
    emitEvent('hallUpdated', { hall });
    res.status(201).json(hall);
  } catch (error) { next(error); }
};
export const updateHall = async (req, res, next) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    emitEvent('hallUpdated', { hall });
    res.json(hall);
  } catch (error) { next(error); }
};
export const deleteHall = async (req, res, next) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    emitEvent('hallUpdated', { id: req.params.id });
    res.json({ message: 'Hall deleted' });
  } catch (error) { next(error); }
};
