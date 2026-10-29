import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import Hall from '../models/Hall.js';
import SeatingPlan from '../models/SeatingPlan.js';
import AllocationRun from '../models/AllocationRun.js';

export async function stats(req, res, next) {
  try {
    const [students, branches, exams, halls, latestRun, byBranch, occupancy, examDistribution] = await Promise.all([
      Student.countDocuments(),
      Student.distinct('branch'),
      Exam.countDocuments(),
      Hall.find(),
      AllocationRun.findOne().sort({ createdAt: -1 }),
      Student.aggregate([{ $group: { _id: '$branch', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      SeatingPlan.aggregate([{ $group: { _id: '$hallId', occupied: { $sum: 1 } } }]),
      SeatingPlan.aggregate([{ $group: { _id: '$examId', count: { $sum: 1 } } }])
    ]);
    const totalSeats = halls.reduce((sum, hall) => sum + hall.capacity, 0);
    const occupied = latestRun?.occupiedSeats || 0;
    res.json({
      cards: {
        totalStudents: students,
        totalBranches: branches.length,
        totalExams: exams,
        totalHalls: halls.length,
        allocatedSeats: occupied,
        availableSeats: Math.max(totalSeats - occupied, 0),
        unallocatedStudents: latestRun?.unallocatedStudents || 0,
        branchConflicts: latestRun?.conflicts || 0
      },
      byBranch: byBranch.map((x) => ({ branch: x._id, count: x.count })),
      hallOccupancy: halls.map((hall) => {
        const hit = occupancy.find((o) => String(o._id) === String(hall._id));
        return { hall: `${hall.block}-${hall.roomNumber}`, occupied: hit?.occupied || 0, capacity: hall.capacity };
      }),
      allocationPie: [{ name: 'Allocated', value: occupied }, { name: 'Available', value: Math.max(totalSeats - occupied, 0) }],
      examDistribution
    });
  } catch (error) {
    next(error);
  }
}
