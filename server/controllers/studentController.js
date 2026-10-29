import { Readable } from 'stream';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import Student from '../models/Student.js';
import { emitEvent } from '../sockets/socket.js';
import { detectDepartmentFromRegisterNumber, normalizeDepartmentName, validateStudentRegistration } from '../utils/studentValidation.js';

const BRANCHES = ['CSE_AI', 'AIML', 'CSE', 'ECE', 'MEC', 'EEE', 'CSE_DS'];

const normalize = (row) => ({
  registerNumber: String(row['Register Number'] || row.registerNumber || row.RegisterNo || '').replace(/\s+/g, '').trim().toUpperCase(),
  name: String(row.Name || row.name || '').trim(),
  branch: normalizeDepartmentName(row.Branch || row.branch || '').trim().toUpperCase(),
  year: Number(row.Year || row.year || 0),
  section: String(row.Section || row.section || '').trim(),
  email: String(row.Email || row.email || '').trim()
});

function shuffleList(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getDefaultRegistrationRanges() {
  const list = [];
  const ranges = [
    [192372001, 192372600],
    [192311001, 192311600],
    [192371001, 192371600],
    [192324001, 192324600],
    [192312001, 192312600],
    [192322001, 192322600],
    [192373001, 192373600]
  ];
  for (const [start, end] of ranges) {
    for (let number = start; number <= end; number += 1) {
      list.push(String(number));
    }
  }
  return list;
}

function parseRegistrationList(rawValue) {
  if (Array.isArray(rawValue)) return rawValue.map((item) => String(item).trim()).filter(Boolean);
  if (!rawValue) return [];
  const rows = String(rawValue)
    .replace(/\r/g, '')
    .split(/[\n,;\t]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const numbers = [];
  for (const row of rows) {
    const match = row.match(/\d{9,12}/);
    if (match) numbers.push(match[0]);
  }
  return numbers;
}

async function parseUpload(file) {
  if (/\.xlsx$/i.test(file.originalname)) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  }
  return new Promise((resolve, reject) => {
    const rows = [];
    Readable.from(file.buffer).pipe(csv()).on('data', (row) => rows.push(row)).on('end', () => resolve(rows)).on('error', reject);
  });
}

export async function listStudents(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const filter = {};
    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.year) filter.year = Number(req.query.year);
    if (req.query.q) {
      const query = escapeRegex(String(req.query.q));
      filter.$or = [
        { registerNumber: new RegExp(query, 'i') },
        { name: new RegExp(query, 'i') }
      ];
    }
    const sort = { [req.query.sort || 'registerNumber']: req.query.order === 'desc' ? -1 : 1 };
    const [data, total] = await Promise.all([
      Student.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Student.countDocuments(filter)
    ]);
    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req, res, next) {
  try {
    const student = await Student.create(normalize(req.body));
    emitEvent('studentAdded', { student });
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Duplicate register number' });
    next(error);
  }
}

export async function getStudent(req, res, next) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, normalize(req.body), { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    emitEvent('studentUpdated', { student });
    res.json(student);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Duplicate register number' });
    next(error);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    emitEvent('studentDeleted', { id: req.params.id });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    next(error);
  }
}

export async function importStudents(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Upload a CSV or XLSX file' });
    const rows = await parseUpload(req.file);
    const existing = new Set((await Student.find({}, 'registerNumber')).map((s) => s.registerNumber));
    const seen = new Set();
    const valid = [];
    const invalid = [];
    for (const raw of rows) {
      const row = normalize(raw);
      const errors = [];
      const validation = validateStudentRegistration(row.registerNumber, row.branch || detectDepartmentFromRegisterNumber(row.registerNumber));
      if (!row.registerNumber) errors.push('Missing register number');
      if (!row.name) errors.push('Missing name');
      if (!row.branch) errors.push('Missing branch');
      if (!row.year) errors.push('Missing year');
      if (!validation.valid) errors.push(validation.reason);
      if (existing.has(row.registerNumber) || seen.has(row.registerNumber)) errors.push('Duplicate register number');
      seen.add(row.registerNumber);
      if (errors.length) invalid.push({ row, errors });
      else valid.push({ ...row, branch: validation.department || row.branch });
    }
    if (req.body.confirm === 'true' && valid.length) {
      await Student.insertMany(valid, { ordered: false });
      emitEvent('studentAdded', { count: valid.length });
    }
    res.json({ detected: rows.length, validCount: valid.length, invalidCount: invalid.length, valid: valid.slice(0, 25), invalid });
  } catch (error) {
    next(error);
  }
}

export async function importRegistrationList(req, res, next) {
  try {
    let list = parseRegistrationList(req.body?.registerNumbers || req.body?.list || req.body?.data || '');
    if (!list.length && req.body?.useDefaultRanges) list = getDefaultRegistrationRanges();
    if (!list.length) return res.status(400).json({ message: 'No registration numbers provided.' });

    const groupSize = Math.max(1, Number(req.body?.groupSize || 40));
    const shouldShuffle = req.body?.shuffle !== false;
    const year = Number(req.body?.year || 3);
    const sectionList = ['A', 'B', 'C', 'D'];

    const cleaned = [...new Set(list.map((n) => String(n).trim()).filter((n) => /^\d{9}$/.test(n)))];
    const shuffled = shouldShuffle ? shuffleList(cleaned) : cleaned;

    const existing = new Set((await Student.find({}, 'registerNumber')).map((s) => s.registerNumber));
    const valid = [];
    const duplicates = [];
    const invalid = [];
    for (let index = 0; index < shuffled.length; index += 1) {
      const registerNumber = shuffled[index];
      const validation = validateStudentRegistration(registerNumber);
      if (!validation.valid) {
        invalid.push({ registerNumber, reason: validation.reason });
        continue;
      }
      if (existing.has(registerNumber)) {
        duplicates.push(registerNumber);
        continue;
      }

      const branch = validation.department;
      const section = sectionList[index % sectionList.length];
      valid.push({
        registerNumber,
        name: req.body?.namePrefix ? `${req.body.namePrefix} ${index + 1}` : `Student ${index + 1}`,
        branch,
        year,
        section,
        email: `${registerNumber.toLowerCase()}@college.edu`
      });
    }

    if (valid.length) {
      await Student.insertMany(valid, { ordered: false });
      emitEvent('studentAdded', { count: valid.length });
    }

    const batches = [];
    for (let index = 0; index < valid.length; index += groupSize) {
      batches.push(valid.slice(index, index + groupSize).map((student) => student.registerNumber));
    }

    res.json({
      detected: cleaned.length,
      validCount: valid.length,
      duplicateCount: duplicates.length,
      invalidCount: invalid.length,
      duplicateNumbers: duplicates.slice(0, 20),
      invalidNumbers: invalid.slice(0, 20),
      groupSize,
      totalBatches: batches.length,
      batches,
      message: `Imported ${valid.length} registration numbers. ${batches.length} subject batches created with ${groupSize} students each.`
    });
  } catch (error) {
    next(error);
  }
}

export async function exportStudents(req, res, next) {
  try {
    const students = await Student.find().sort({ registerNumber: 1 }).lean();
    const sheet = XLSX.utils.json_to_sheet(students.map((s) => ({
      'Register No': s.registerNumber,
      Name: s.name,
      Branch: s.branch,
      Year: s.year,
      Section: s.section,
      Email: s.email
    })));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Students');
    const buffer = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}
