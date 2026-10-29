import { countBranchConflicts, markConflicts } from './conflictChecker.js';

export function validateAllocation({ assignments, unallocated, totalStudents, totalSeats }) {
  const rows = markConflicts(assignments);
  const conflicts = countBranchConflicts(assignments);
  const allocatedStudents = rows.length;
  const availableSeats = Math.max(totalSeats - allocatedStudents, 0);
  return {
    rows,
    summary: {
      totalStudents,
      allocatedStudents,
      unallocatedStudents: unallocated.length,
      totalSeats,
      occupiedSeats: allocatedStudents,
      availableSeats,
      conflicts,
      conflictRate: allocatedStudents ? Number(((conflicts / allocatedStudents) * 100).toFixed(2)) : 0,
      hallUtilization: totalSeats ? Number(((allocatedStudents / totalSeats) * 100).toFixed(2)) : 0
    }
  };
}
