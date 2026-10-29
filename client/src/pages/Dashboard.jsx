import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { BookOpenCheck, Building2, GraduationCap, Users } from 'lucide-react';
import { api } from '../services/api.js';

const CHART_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

const statCards = [
  { key: 'totalStudents', label: 'Total Students', icon: Users },
  { key: 'totalBranches', label: 'Total Branches', icon: GraduationCap },
  { key: 'totalExams', label: 'Total Exams', icon: BookOpenCheck },
  { key: 'totalHalls', label: 'Total Halls', icon: Building2 }
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    cards: {
      totalStudents: 0,
      totalBranches: 0,
      totalExams: 0,
      totalHalls: 0,
      allocatedSeats: 0,
      availableSeats: 0,
      unallocatedStudents: 0,
      branchConflicts: 0
    },
    byBranch: [],
    hallOccupancy: [],
    allocationPie: [],
    examDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
        setError('');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load dashboard data. Check the backend and MongoDB connection.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="card p-8 text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-md border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon }) => (
          <div key={key} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="mt-2 text-3xl font-bold">{stats.cards[key] ?? 0}</div>
              </div>
              <div className="rounded-md bg-sky-100 p-3 text-sky-700">
                <Icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Allocated Seats', value: stats.cards.allocatedSeats },
          { label: 'Available Seats', value: stats.cards.availableSeats },
          { label: 'Unallocated Students', value: stats.cards.unallocatedStudents },
          { label: 'Branch Conflicts', value: stats.cards.branchConflicts }
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-2 text-2xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold">Students by Branch</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byBranch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold">Hall Occupancy</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hallOccupancy}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hall" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="occupied" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold">Allocated vs Available Seats</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.allocationPie} dataKey="value" nameKey="name" outerRadius={90} label>
                  {stats.allocationPie.map((entry, index) => (
                    <Cell key={entry.name} fill={index === 0 ? '#2563eb' : '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold">Exam-wise Student Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.examDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
