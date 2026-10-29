import { countBranchConflicts, countConflictsForSeat, seatKey } from './conflictChecker.js';

export function improveWithSwaps(assignments, maxAttempts = 600) {
  const current = new Map(assignments);
  let bestConflictCount = countBranchConflicts(current);
  let attempts = 0;
  const keys = [...current.keys()];

  while (bestConflictCount > 0 && attempts < maxAttempts) {
    attempts += 1;
    let improved = false;
    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        const a = current.get(keys[i]);
        const b = current.get(keys[j]);
        if (!a || !b || a.branch === b.branch) continue;
        const before = countConflictsForSeat(a.student, a, current) + countConflictsForSeat(b.student, b, current);
        const swappedA = { ...a, student: b.student, branch: b.branch };
        const swappedB = { ...b, student: a.student, branch: a.branch };
        current.set(keys[i], swappedA);
        current.set(keys[j], swappedB);
        const totalConflicts = countBranchConflicts(current);
        const after = countConflictsForSeat(swappedA.student, swappedA, current) + countConflictsForSeat(swappedB.student, swappedB, current);
        if (totalConflicts < bestConflictCount || after < before) {
          bestConflictCount = totalConflicts;
          improved = true;
          break;
        }
        current.set(keys[i], a);
        current.set(keys[j], b);
      }
      if (improved || attempts >= maxAttempts) break;
    }
    if (!improved) break;
  }
  return current;
}
