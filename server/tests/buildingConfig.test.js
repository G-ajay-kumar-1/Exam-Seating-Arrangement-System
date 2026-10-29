import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILDING_ORDER, createDefaultHallCatalog, ROOM_CAPACITY } from '../utils/buildingConfig.js';
import { generateSeats } from '../services/allocation/seatGenerator.js';
import { parseDepartmentText } from '../utils/pdfStudentParser.js';

test('campus catalog follows the required building order and room capacity', () => {
  const halls = createDefaultHallCatalog();
  assert.deepEqual(BUILDING_ORDER, [
    'CIRCULAR BUILDING',
    'SAIL',
    'RECTANGULAR BUILDING',
    'AHS',
    'SSPE',
    'SCAD'
  ]);
  assert.ok(halls.length > 0);
  assert.equal(halls[0].building, 'CIRCULAR BUILDING');
  assert.equal(halls[0].capacity, ROOM_CAPACITY);
  assert.equal(halls[0].rows, 5);
  assert.equal(halls[0].columns, 8);
  const seats = generateSeats(halls.slice(0, 2));
  assert.equal(seats.length, 80);
});

test('parseDepartmentText reads aligned department rows from PDF-like text', () => {
  const text = [
    '192372001 KAVYA R CSE_AI',
    '192311001 ARUN KUMAR AIML',
    '192371001 PRIYA S CSE',
    '192324001 RAVI ECE'
  ].join('\n');

  const { records, errors } = parseDepartmentText(text);
  assert.equal(errors.length, 0);
  assert.equal(records.length, 4);
  assert.equal(records[0].registerNumber, '192372001');
  assert.equal(records[0].branch, 'CSE_AI');
  assert.equal(records[1].branch, 'AIML');
  assert.equal(records[2].branch, 'CSE');
  assert.equal(records[3].branch, 'ECE');
});
