import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectDepartmentFromRegisterNumber,
  normalizeDepartmentName,
  validateStudentRegistration
} from '../utils/studentValidation.js';

test('detectDepartmentFromRegisterNumber matches all required departmental prefixes', () => {
  assert.equal(detectDepartmentFromRegisterNumber('192372001'), 'CSE_AI');
  assert.equal(detectDepartmentFromRegisterNumber('192311001'), 'AIML');
  assert.equal(detectDepartmentFromRegisterNumber('192371001'), 'CSE');
  assert.equal(detectDepartmentFromRegisterNumber('192324001'), 'ECE');
  assert.equal(detectDepartmentFromRegisterNumber('192312001'), 'MEC');
  assert.equal(detectDepartmentFromRegisterNumber('192322001'), 'EEE');
  assert.equal(detectDepartmentFromRegisterNumber('192373001'), 'CSE_DS');
});

test('validateStudentRegistration rejects non-numeric and invalid department numbers', () => {
  assert.equal(validateStudentRegistration('192372001').valid, true);
  assert.equal(validateStudentRegistration('19237200A').valid, false);
  assert.equal(validateStudentRegistration('123456789').valid, false);
  assert.equal(validateStudentRegistration('1923720012').valid, false);
});

test('normalizeDepartmentName normalizes PDF department names', () => {
  assert.equal(normalizeDepartmentName('CSE AI'), 'CSE_AI');
  assert.equal(normalizeDepartmentName('CSE DS'), 'CSE_DS');
  assert.equal(normalizeDepartmentName('AIML'), 'AIML');
});
