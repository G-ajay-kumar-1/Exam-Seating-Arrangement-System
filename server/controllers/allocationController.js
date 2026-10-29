import { generateAllocation, getAllocation, validateExistingAllocation } from '../services/allocation/allocationService.js';

export async function generate(req, res, next) {
  try {
    const { examId, hallIds } = req.body;
    if (!examId) {
      return res.status(400).json({ message: 'examId is required' });
    }
    const result = await generateAllocation(examId, { hallIds: Array.isArray(hallIds) ? hallIds : [] });
    res.status(201).json({
      rows: result.plans || [],
      total: result.run?.totalStudents || 0,
      allocated: result.run?.allocatedStudents || 0,
      unallocated: result.run?.unallocatedStudents || 0,
      conflicts: result.run?.branchConflicts || 0,
      summary: result.run
    });
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(error.statusCode || 400).json({ message: error.message });
    next(error);
  }
}

export async function regenerate(req, res, next) {
  try {
    const result = await generateAllocation(req.body.examId, { regenerate: true });
    res.status(201).json({
      rows: result.plans || [],
      total: result.run?.totalStudents || 0,
      allocated: result.run?.allocatedStudents || 0,
      unallocated: result.run?.unallocatedStudents || 0,
      conflicts: result.run?.branchConflicts || 0,
      summary: result.run
    });
  } catch (error) {
    res.status(error.statusCode || 400);
    next(error);
  }
}

export async function byExam(req, res, next) {
  try {
    const { plans, summary } = await getAllocation(req.params.examId);
    res.json({
      rows: plans || [],
      total: summary?.totalStudents || 0,
      allocated: summary?.allocatedStudents || 0,
      unallocated: summary?.unallocatedStudents || 0,
      conflicts: summary?.branchConflicts || 0,
      summary
    });
  } catch (error) {
    next(error);
  }
}

export async function validate(req, res, next) {
  try { res.json(await validateExistingAllocation(req.params.examId)); } catch (error) { next(error); }
}
