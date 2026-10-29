export const BUILDING_ORDER = [
  'CIRCULAR BUILDING',
  'SAIL',
  'RECTANGULAR BUILDING',
  'AHS',
  'SSPE',
  'SCAD'
];

export const ROOM_CAPACITY = 40;

export const BUILDING_LAYOUT = {
  'CIRCULAR BUILDING': { floors: 5, roomsPerFloor: 20, startFloor: 1 },
  SAIL: { floors: 13, roomsPerFloor: 13, startFloor: 2 },
  'RECTANGULAR BUILDING': { floors: 4, roomsPerFloor: 18, startFloor: 1 },
  AHS: { floors: 9, roomsPerFloor: 15, startFloor: 1 },
  SSPE: { floors: 2, roomsPerFloor: 10, startFloor: 2 },
  SCAD: { floors: 3, roomsPerFloor: 9, startFloor: 1 }
};

function normalizeBuildingName(value = '') {
  return String(value || '').trim().toUpperCase().replace(/_/g, ' ').replace(/\s+/g, ' ');
}

export function compareCampusHalls(a, b) {
  const buildingNameA = a.building || a.block || '';
  const buildingNameB = b.building || b.block || '';
  const buildingOrderA = BUILDING_ORDER.findIndex((name) => normalizeBuildingName(name) === normalizeBuildingName(buildingNameA));
  const buildingOrderB = BUILDING_ORDER.findIndex((name) => normalizeBuildingName(name) === normalizeBuildingName(buildingNameB));

  const firstIndexA = buildingOrderA >= 0 ? buildingOrderA : Number.MAX_SAFE_INTEGER;
  const firstIndexB = buildingOrderB >= 0 ? buildingOrderB : Number.MAX_SAFE_INTEGER;

  if (firstIndexA !== firstIndexB) return firstIndexA - firstIndexB;
  const floorA = Number(a.floor ?? 1);
  const floorB = Number(b.floor ?? 1);
  if (floorA !== floorB) return floorA - floorB;
  return Number(a.roomNumber || 0) - Number(b.roomNumber || 0);
}

export function createDefaultHallCatalog() {
  const halls = [];

  BUILDING_ORDER.forEach((buildingName, buildingIndex) => {
    const layout = BUILDING_LAYOUT[buildingName];
    for (let floor = layout.startFloor; floor < layout.startFloor + layout.floors; floor += 1) {
      for (let roomNumber = 1; roomNumber <= layout.roomsPerFloor; roomNumber += 1) {
        const roomCode = Number(`${floor}${String(roomNumber).padStart(2, '0')}`);
        halls.push({
          name: `${buildingName} - ${roomCode}`,
          roomNumber: String(roomCode),
          block: buildingName,
          building: buildingName,
          buildingOrder: buildingIndex + 1,
          floor,
          rows: 5,
          columns: 8,
          capacity: ROOM_CAPACITY
        });
      }
    }
  });

  return halls;
}
