import { countConflictsForSeat, seatKey } from './conflictChecker.js';

export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function interleaveBranches(students) {
  const groups = new Map();
  for (const student of shuffle(students)) {
    const branch = student.branch || 'UNKNOWN';
    groups.set(branch, [...(groups.get(branch) || []), student]);
  }
  const buckets = [...groups.values()].sort((a, b) => b.length - a.length);
  const ordered = [];
  while (buckets.some((bucket) => bucket.length)) {
    buckets.sort((a, b) => b.length - a.length);
    for (const bucket of buckets) {
      if (bucket.length) ordered.push(bucket.shift());
    }
  }
  return ordered;
}

export function greedyAllocate(students, seats) {
  const orderedStudents = interleaveBranches(students);
  const openSeats = [...seats];
  const assignments = new Map();
  const unallocated = [];

  for (const student of orderedStudents) {
    if (!openSeats.length) {
      unallocated.push(student);
      continue;
    }
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < openSeats.length; i += 1) {
      const score = countConflictsForSeat(student, openSeats[i], assignments);
      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
        if (score === 0) break;
      }
    }
    const [seat] = openSeats.splice(bestIndex, 1);
    assignments.set(seatKey(seat), { ...seat, student, branch: student.branch });
  }
  return { assignments, unallocated };
}
