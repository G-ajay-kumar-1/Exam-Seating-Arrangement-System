import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import Hall from '../models/Hall.js';
import SeatingPlan from '../models/SeatingPlan.js';
import AllocationRun from '../models/AllocationRun.js';
import { connectDB } from '../utils/db.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const branches = ['CSE_AI', 'AIML', 'CSE', 'ECE', 'MEC'];
const departmentPrefixes = {
  CSE_AI: '192372',
  AIML: '192311',
  CSE: '192371',
  ECE: '192324',
  MEC: '192312'
};
const firstNames = ['Ravi', 'Anjali', 'Arjun', 'Priya', 'Karthik', 'Sneha', 'Vikram', 'Neha', 'Aman', 'Meera', 
  'Raj', 'Divya', 'Rohan', 'Sakshi', 'Amit', 'Ritika', 'Nikhil', 'Pooja', 'Akshay', 'Nisha'];
const lastNames = ['Kumar', 'Sharma', 'Nair', 'Menon', 'Rao', 'Iyer', 'Singh', 'Patel', 'Verma', 'Das', 'Gupta', 'Mishra'];

async function seed() {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Student.deleteMany(),
    Exam.deleteMany(),
    Hall.deleteMany(),
    SeatingPlan.deleteMany(),
    AllocationRun.deleteMany()
  ]);

  // Create admin user
  await User.create({
    name: 'Exam Cell Administrator',
    email: 'admin@college.edu',
    passwordHash: await User.hashPassword('Admin@123'),
    role: 'admin'
  });

  // Generate 450 students across branches
  const students = [];
  const studentsPerBranch = 90; // 450 / 5 branches
  
  branches.forEach((branch) => {
    for (let i = 0; i < studentsPerBranch; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const year = Math.floor(Math.random() * 4) + 1; // Years 1-4
      const section = String.fromCharCode(65 + (i % 3)); // A, B, or C
      const regNo = `${departmentPrefixes[branch]}${String(i + 1).padStart(3, '0')}`;
      
      students.push({
        registerNumber: regNo,
        name: `${firstName} ${lastName}`,
        branch,
        year,
        section,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.college.edu`
      });
    }
  });

  await Student.insertMany(students);
  console.log(`✓ Created ${students.length} students`);

  // Create multiple exams
  const exams = [];
  const subjects = {
    CSE_AI: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'Deep Learning', 'Robotics'],
    AIML: ['Natural Language Processing', 'Data Mining', 'Statistics', 'Pattern Recognition', 'Cloud AI'],
    CSE: ['Computer Networks', 'Database Management', 'Operating Systems', 'Data Structures', 'Web Development'],
    ECE: ['Digital Signal Processing', 'Microelectronics', 'Communication Theory', 'Electromagnetics', 'Circuit Design'],
    MEC: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Technology', 'Robotics']
  };

  let examId = 0;
  const dates = ['2026-09-10', '2026-09-15', '2026-09-20', '2026-09-25'];
  const timings = [
    { start: '10:00', end: '12:00', name: 'FN' },
    { start: '14:00', end: '16:00', name: 'AN' }
  ];

  branches.forEach((branch) => {
    subjects[branch].forEach((subject, idx) => {
      timings.forEach((timing) => {
        exams.push({
          name: `${branch} - ${subject} (${timing.name})`,
          type: 'Theory Exam',
          subject,
          date: new Date(dates[examId % dates.length]),
          startTime: timing.start,
          endTime: timing.end,
          academicYear: '2026-2027',
          semester: '5',
          departments: [branch]
        });
        examId++;
      });
    });
  });

  await Exam.insertMany(exams);
  console.log(`✓ Created ${exams.length} exams`);

  // Create halls in different blocks
  const halls = [];
  const blocks = ['A', 'B', 'C'];
  const roomConfigs = [
    { rows: 5, columns: 6 },   // 30 seats
    { rows: 6, columns: 6 },   // 36 seats
    { rows: 7, columns: 7 },   // 49 seats
    { rows: 8, columns: 6 }    // 48 seats
  ];

  blocks.forEach((block) => {
    roomConfigs.forEach((config, idx) => {
      const roomNum = `${block}${String(101 + idx)}`;
      halls.push({
        name: `Hall ${roomNum}`,
        roomNumber: roomNum,
        block,
        rows: config.rows,
        columns: config.columns,
        capacity: config.rows * config.columns
      });
    });
  });

  await Hall.insertMany(halls);
  console.log(`✓ Created ${halls.length} halls (total capacity: ${halls.reduce((sum, h) => sum + h.capacity, 0)} seats)`);

  console.log('\n✓ Database seeded successfully!');
  console.log('═══════════════════════════════════════════════');
  console.log('Admin Credentials:');
  console.log('  Email: admin@college.edu');
  console.log('  Password: Admin@123');
  console.log('═══════════════════════════════════════════════');
  console.log(`Students: ${students.length}`);
  console.log(`Exams: ${exams.length}`);
  console.log(`Halls: ${halls.length}`);
  console.log('═══════════════════════════════════════════════');
  
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
