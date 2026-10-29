import { useEffect, useState } from 'react';
import { Download, Search as SearchIcon, FileText, Printer } from 'lucide-react';
import { api } from '../services/api.js';

export default function Reports() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const { data } = await api.get('/exams?limit=100');
      const examList = Array.isArray(data) ? data : data.data || [];
      setExams(examList);
      if (examList.length > 0) {
        setSelectedExamId(examList[0]._id);
      }
    } catch (err) {
      setError('Failed to load exams');
    }
  };

  useEffect(() => {
    if (!selectedExamId) return;
    loadPlans();
  }, [selectedExamId]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/allocation/${selectedExamId}`);
      setPlans(data.rows || []);
    } catch (err) {
      setError('Failed to load seating plans');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchSearch = !searchTerm || 
      plan.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = !filterBranch || plan.branch === filterBranch;
    return matchSearch && matchBranch;
  });

  const branches = [...new Set(plans.map(p => p.branch))].sort();

  const selectedExam = exams.find(e => e._id === selectedExamId);

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/reports/export/${format}/${selectedExamId}`, { responseType: 'blob' });
      const extension = format === 'excel' ? 'xlsx' : format;
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seating-report.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || `Unable to export ${format.toUpperCase()} report.`);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Seating Reports
          </h1>
          <p className="text-gray-600 mt-2">View and export examination seating arrangements</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Export Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Options
          </h3>
          <div className="flex flex-wrap gap-3">
            {selectedExamId && (
              <>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition"
                >
                  <Printer className="w-4 h-4 inline mr-2" />
                  Print
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Exam</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="">Choose an exam...</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name} - {exam.subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Branch</label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Register No or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {selectedExam && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
              <div className="text-2xl font-bold text-blue-900">{plans.length}</div>
              <div className="text-sm text-gray-600">Total Seating Plans</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
              <div className="text-2xl font-bold text-green-900">{filteredPlans.length}</div>
              <div className="text-sm text-gray-600">Filtered Results</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-600">
              <div className="text-2xl font-bold text-purple-900">{branches.length}</div>
              <div className="text-sm text-gray-600">Branches</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-600">
              <div className="text-2xl font-bold text-orange-900">{[...new Set(plans.map((plan) => String(plan.hallId?._id || plan.hallId)))].length}</div>
              <div className="text-sm text-gray-600">Halls Used</div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-600">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">Reg No</th>
                  <th className="px-6 py-3 text-left font-bold">Name</th>
                  <th className="px-6 py-3 text-left font-bold">Branch</th>
                  <th className="px-6 py-3 text-left font-bold">Exam</th>
                  <th className="px-6 py-3 text-left font-bold">Subject</th>
                  <th className="px-6 py-3 text-left font-bold">Block</th>
                  <th className="px-6 py-3 text-left font-bold">Room</th>
                  <th className="px-6 py-3 text-left font-bold">Seat</th>
                  <th className="px-6 py-3 text-left font-bold">Row</th>
                  <th className="px-6 py-3 text-left font-bold">Col</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      No seating plans available.
                    </td>
                  </tr>
                ) : (
                  filteredPlans.map((plan, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-blue-50 transition">
                      <td className="px-6 py-3 font-bold text-blue-900">{plan.registerNumber}</td>
                      <td className="px-6 py-3">{plan.studentName}</td>
                      <td className="px-6 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-bold">
                          {plan.branch}
                        </span>
                      </td>
                      <td className="px-6 py-3">{plan.examId?.name || 'N/A'}</td>
                      <td className="px-6 py-3">{plan.examId?.subject || 'N/A'}</td>
                      <td className="px-6 py-3 font-bold">{plan.block}</td>
                      <td className="px-6 py-3">{plan.hallId?.roomNumber || 'N/A'}</td>
                      <td className="px-6 py-3 font-bold text-lg">{plan.seatNumber}</td>
                      <td className="px-6 py-3 text-center">{plan.row}</td>
                      <td className="px-6 py-3 text-center">{plan.column}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            .no-print { display: none; }
            table { font-size: 11px; }
            th, td { padding: 8px 12px; }
          }
        `}</style>
      </div>
    </div>
  );
}
