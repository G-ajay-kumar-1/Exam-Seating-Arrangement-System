const ORTHOGONAL = [[0, -1], [0, 1], [-1, 0], [1, 0]];
const DIAGONAL = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

export function neighborKeys(seat, includeDiagonal = false) {
  const offsets = includeDiagonal ? [...ORTHOGONAL, ...DIAGONAL] : ORTHOGONAL;
  return offsets.map(([dr, dc]) => `${seat.hallId}:${seat.row + dr}:${seat.column + dc}`);
}

export function seatKey(seat) {
  return `${seat.hallId}:${seat.row}:${seat.column}`;
}

export function countConflictsForSeat(student, seat, assignments, includeDiagonal = false) {
  return neighborKeys(seat, includeDiagonal).reduce((count, key) => {
    const neighbor = assignments.get(key);
    return count + (neighbor?.branch === student.branch ? 1 : 0);
  }, 0);
}

export function markConflicts(assignments, includeDiagonal = false) {
  const values = [...assignments.values()].map((entry) => ({ ...entry, conflict: false }));
  const byKey = new Map(values.map((entry) => [seatKey(entry), entry]));
  for (const entry of values) {
    entry.conflict = neighborKeys(entry, includeDiagonal).some((key) => byKey.get(key)?.branch === entry.branch);
  }
  return values;
}

export function countBranchConflicts(assignments, includeDiagonal = false) {
  const byKey = assignments instanceof Map ? assignments : new Map(assignments.map((entry) => [seatKey(entry), entry]));
  let conflicts = 0;
  for (const entry of byKey.values()) {
    for (const key of neighborKeys(entry, includeDiagonal)) {
      const neighbor = byKey.get(key);
      if (neighbor && neighbor.branch === entry.branch && seatKey(entry) < key) conflicts += 1;
    }
  }
  return conflicts;
}
