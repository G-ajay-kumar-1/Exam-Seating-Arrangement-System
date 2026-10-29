import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';

const defaultForm = {
  name: '',
  type: 'Theory Exam',
  subject: '',
  date: '',
  startTime: '10:00',
  endTime: '12:00',
  academicYear: '2026-2027',
  semester: 'V',
  departments: ['CSE_AI', 'AIML', 'CSE', 'ECE', 'MEC', 'EEE', 'CSE_DS']
};

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');

  const loadExams = async () => {
    const { data } = await api.get('/exams');
    setExams(data);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleDepartmentToggle = (department) => {
    setForm((current) => {
      const hasDepartment = current.departments.includes(department);
      return {
        ...current,
        departments: hasDepartment
          ? current.departments.filter((item) => item !== department)
          : [...current.departments, department]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/exams', { ...form, departments: form.departments });
      setMessage('Examination created successfully.');
      setForm(defaultForm);
      loadExams();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create exam.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/exams/${id}`);
      setMessage('Examination deleted.');
      loadExams();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete exam.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Examination Management</h2>
      </div>

      {message ? <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="card p-5">
          <h3 className="mb-4 text-lg font-bold">Create Examination</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Exam Name</label>
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Exam Type</label>
                <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option>Theory Exam</option>
                  <option>Lab Exam</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Semester</label>
                <input className="field" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Subject</label>
              <input className="field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Departments</label>
              <div className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
                {['CSE_AI', 'AIML', 'CSE', 'ECE', 'MEC', 'EEE', 'CSE_DS'].map((department) => (
                  <label key={department} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.departments.includes(department)}
                      onChange={() => handleDepartmentToggle(department)}
                    />
                    {department}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Exam Date</label>
                <input className="field" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Academic Year</label>
                <input className="field" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Start Time</label>
                <input className="field" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">End Time</label>
                <input className="field" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
              </div>
            </div>
            <button className="btn-primary"><Plus size={16} /> Create Exam</button>
          </div>
        </form>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-bold">Examination List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Timing</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-500">No examinations created.</td></tr>
                ) : exams.map((exam) => (
                  <tr key={exam._id}>
                    <td>{exam.name}</td>
                    <td>{exam.subject}</td>
                    <td>{new Date(exam.date).toLocaleDateString()}</td>
                    <td>{exam.startTime} - {exam.endTime}</td>
                    <td>
                      <div className="text-xs text-slate-500">{Array.isArray(exam.departments) ? exam.departments.join(', ') : 'All'}</div>
                      <button className="btn-danger mt-2" onClick={() => handleDelete(exam._id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
