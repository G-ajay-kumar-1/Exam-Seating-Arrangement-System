import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

const emptyForm = {
  registerNumber: '',
  name: '',
  branch: '',
  year: '3',
  section: '',
  email: ''
};

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterQ, setFilterQ] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');

  const pages = useMemo(() => Math.max(1, Math.ceil(total / 10)), [total]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filterQ) params.set('q', filterQ);
      if (filterBranch) params.set('branch', filterBranch);
      if (filterYear) params.set('year', filterYear);
      const { data } = await api.get(`/students?${params.toString()}`);
      setStudents(data.data || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, filterBranch, filterYear]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    loadStudents();
  };

  const handleRegisterLookup = async (event) => {
    event.preventDefault();
    const term = lookupQuery.trim();
    if (!term) {
      setLookupError('Enter a register number to search.');
      setLookupResult(null);
      return;
    }

    try {
      const { data } = await api.get(`/search/student/${encodeURIComponent(term)}`);
      setLookupResult(data.student);
      setLookupError('');
    } catch (error) {
      setLookupError(error.response?.data?.message || 'Student not found.');
      setLookupResult(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, form);
        setMessage('Student updated successfully.');
      } else {
        await api.post('/students', form);
        setMessage('Student added successfully.');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadStudents();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save student.');
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      registerNumber: student.registerNumber,
      name: student.name,
      branch: student.branch,
      year: String(student.year),
      section: student.section || '',
      email: student.email || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setMessage('Student deleted.');
      loadStudents();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete student.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-sm text-slate-500">Add, edit, search, and manage student records.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-soft" onClick={() => navigate('/students/import')}>
            <Upload size={16} />
            Import
          </button>
          <button className="btn-primary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {message ? <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">{message}</div> : null}

      <form onSubmit={handleRegisterLookup} className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1 block text-sm font-medium">Quick student lookup by register number</label>
            <input
              className="field"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Enter registration number"
            />
          </div>
          <button type="submit" className="btn-primary self-end">Search Student</button>
        </div>

        {lookupError ? <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{lookupError}</div> : null}

        {lookupResult ? (
          <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
            <div className="font-bold text-slate-900">Student Details</div>
            <div className="mt-2"><span className="font-semibold">Name:</span> {lookupResult.name}</div>
            <div><span className="font-semibold">Register No:</span> {lookupResult.registerNumber}</div>
            <div><span className="font-semibold">Branch:</span> {lookupResult.branch}</div>
            <div><span className="font-semibold">Year:</span> {lookupResult.year}</div>
            <div><span className="font-semibold">Section:</span> {lookupResult.section || '-'}</div>
            <div><span className="font-semibold">Email:</span> {lookupResult.email || '-'}</div>
          </div>
        ) : null}
      </form>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="card p-5">
          <h3 className="mb-4 text-lg font-bold">{editingId ? 'Edit Student' : 'Add Student'}</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Register Number</label>
              <input className="field" value={form.registerNumber} onChange={(e) => setForm({ ...form, registerNumber: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Branch</label>
                <select className="field" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required>
                  <option value="">Select branch</option>
                  <option value="CSE_AI">CSE AI</option>
                  <option value="AIML">AIML</option>
                  <option value="CSE">CSE</option>
                  <option value="CSE_DS">CSE DS</option>
                  <option value="ECE">ECE</option>
                  <option value="MEC">MEC</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Year</label>
                <input className="field" type="number" min="1" max="5" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Section</label>
                <input className="field" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">{editingId ? 'Update Student' : 'Save Student'}</button>
              {editingId ? (
                <button type="button" className="btn-soft" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} />
                <input className="field pl-9" value={filterQ} onChange={(e) => setFilterQ(e.target.value)} placeholder="Search register number or name" />
              </div>
              <select className="field max-w-[180px]" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                <option value="">All Branches</option>
                <option value="CSE_AI">CSE AI</option>
                <option value="AIML">AIML</option>
                <option value="CSE">CSE</option>
                <option value="CSE_DS">CSE DS</option>
                <option value="ECE">ECE</option>
                <option value="MEC">MEC</option>
                <option value="EEE">EEE</option>
              </select>
              <select className="field max-w-[120px]" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                <option value="">All Years</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              <button type="submit" className="btn-primary">Search</button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Register No</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">Loading students...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">No students found.</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.registerNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.branch}</td>
                      <td>{student.year}</td>
                      <td>{student.section || '-'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-soft" onClick={() => handleEdit(student)}>
                            <Pencil size={14} />
                          </button>
                          <button className="btn-danger" onClick={() => handleDelete(student._id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-600">
            <span>Showing {students.length} of {total}</span>
            <div className="flex gap-2">
              <button className="btn-soft" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
              <span className="px-3 py-2">Page {page} / {pages}</span>
              <button className="btn-soft" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
