import { useEffect, useState } from 'react';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';

const defaultForm = {
  name: '',
  roomNumber: '',
  block: 'A',
  rows: 5,
  columns: 8,
  capacity: 40
};

export default function Halls() {
  const [halls, setHalls] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');

  const loadHalls = async () => {
    const { data } = await api.get('/halls');
    setHalls(data);
  };

  useEffect(() => {
    loadHalls();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, capacity: Number(form.rows) * Number(form.columns) };
    try {
      await api.post('/halls', payload);
      setMessage('Hall added successfully.');
      setForm(defaultForm);
      loadHalls();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create hall.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/halls/${id}`);
      setMessage('Hall deleted.');
      loadHalls();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete hall.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Hall Management</h2>
      </div>

      {message ? <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="card p-5">
          <h3 className="mb-4 text-lg font-bold">Add Examination Hall</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Hall Name / Room Number</label>
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Room Number</label>
                <input className="field" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Block</label>
                <input className="field" value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Rows</label>
                <input className="field" type="number" min="1" value={form.rows} onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Columns</label>
                <input className="field" type="number" min="1" value={form.columns} onChange={(e) => setForm({ ...form, columns: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Capacity</label>
                <input className="field" type="number" value={Number(form.rows) * Number(form.columns)} readOnly />
              </div>
            </div>
            <button className="btn-primary"><Plus size={16} /> Add Hall</button>
          </div>
        </form>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-bold">Hall List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Hall</th>
                  <th>Block</th>
                  <th>Rows</th>
                  <th>Columns</th>
                  <th>Capacity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {halls.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-500">No halls created.</td></tr>
                ) : halls.map((hall) => (
                  <tr key={hall._id}>
                    <td>{hall.roomNumber}</td>
                    <td>{hall.block}</td>
                    <td>{hall.rows}</td>
                    <td>{hall.columns}</td>
                    <td>{hall.capacity}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDelete(hall._id)}>
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
