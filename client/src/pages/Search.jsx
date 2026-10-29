import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { api } from '../services/api.js';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.get(`/search/student/${encodeURIComponent(query)}`);
      setResult(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Student not found.');
      setResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Student Seat Search</h2>
      </div>

      <form onSubmit={handleSearch} className="card p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} />
            <input className="field pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by register number or name" required />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </div>
      </form>

      {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

      {result && (
        <div className="card p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-bold">Student Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold">Name:</span> {result.student.name}</div>
                <div><span className="font-semibold">Register No:</span> {result.student.registerNumber}</div>
                <div><span className="font-semibold">Branch:</span> {result.student.branch}</div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-bold">Seat Details</h3>
              {result.allocations?.[0] ? (
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Block:</span> {result.allocations[0].block}</div>
                  <div><span className="font-semibold">Room:</span> {result.allocations[0].hallId?.roomNumber}</div>
                  <div><span className="font-semibold">Seat:</span> {result.allocations[0].seatNumber}</div>
                </div>
              ) : <div className="text-slate-500">No seat allocation found.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
