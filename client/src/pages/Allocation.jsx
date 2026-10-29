import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ChevronDown, DownloadCloud, Loader, Settings, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

const ExamTypeOptions = [
  { value: 'Theory Exam', label: 'Theory Exam' },
  { value: 'Lab Exam', label: 'Lab Exam' },
  { value: 'Government Exam', label: 'Government Exam' }
];

const TimingOptions = [
  { value: 'FN', label: 'Forenoon (FN)' },
  { value: 'AN', label: 'Afternoon (AN)' }
];

export default function Allocation() {
  const location = useLocation();
  const { examId } = useParams();
  const [exams, setExams] = useState([]);
  const [halls, setHalls] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('Theory Exam');
  const [selectedTiming, setSelectedTiming] = useState('FN');
  const [selectedHalls, setSelectedHalls] = useState([]);
  const [seatingPlan, setSeatingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState('generate'); // 'generate' or 'view'
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadData();
  }, [examId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [examsRes, hallsRes, studentsRes] = await Promise.all([
        api.get('/exams?limit=100'),
        api.get('/halls?limit=100'),
        api.get('/students?limit=10000')
      ]);
      const examList = Array.isArray(examsRes.data) ? examsRes.data : examsRes.data.data || [];
      setExams(examList);
      setHalls(Array.isArray(hallsRes.data) ? hallsRes.data : hallsRes.data.data || []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.data || []);
      const requestedExamId = examId || location.state?.examId;
      const requestedExam = examList.find((exam) => exam._id === requestedExamId);
      if (requestedExamId && requestedExam) setSelectedExam(requestedExam._id);
      if (location.state?.examType) setSelectedExamType(location.state.examType);

      if (examId) {
        const allocationResponse = await api.get(`/allocation/${examId}`);
        const rows = allocationResponse.data.rows || [];
        const hallIds = [...new Set(rows.map((row) => String(row.hallId?._id || row.hallId)))];
        setSelectedHalls(hallIds);
        setSeatingPlan(rows);
        setMetrics({
          total: allocationResponse.data.total || 0,
          allocated: allocationResponse.data.allocated || 0,
          unallocated: allocationResponse.data.unallocated || 0,
          conflicts: allocationResponse.data.conflicts || 0
        });
        setView(rows.length > 0 ? 'view' : 'generate');
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHallToggle = (hallId) => {
    setSelectedHalls(prev =>
      prev.includes(hallId) ? prev.filter(id => id !== hallId) : [...prev, hallId]
    );
  };

  const generateSeating = async (hallIdsOverride = null) => {
    const hallIds = hallIdsOverride ?? selectedHalls;

    if (!selectedExam) {
      setError('Please select an exam');
      return;
    }
    if (hallIds.length === 0) {
      setError('Please select at least one hall');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/allocation/generate', {
        examId: selectedExam,
        examType: selectedExamType,
        timing: selectedTiming,
        hallIds
      });

      setSeatingPlan(response.data.rows || []);
      setMetrics({
        total: response.data.total || 0,
        allocated: response.data.allocated || 0,
        unallocated: response.data.unallocated || 0,
        conflicts: response.data.conflicts || 0
      });
      setView('view');
      setSuccess('Seating plan generated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate seating plan');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const autoGenerateInAllRooms = () => {
    const allHallIds = halls.map((hall) => hall._id);
    setSelectedHalls(allHallIds);
    generateSeating(allHallIds);
  };

  const downloadExport = async (format) => {
    if (!selectedExam) return;
    try {
      const response = await api.get(`/reports/export/${format}/${selectedExam}`, {
        responseType: format === 'pdf' ? 'blob' : 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `seating-plan-${selectedExam}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download report');
    }
  };

  const SeatingGrid = ({ seating, hallId }) => {
    if (!seating || seating.length === 0) return null;

    const hallSeating = seating.filter(s => s.hallId?._id === hallId || s.hallId === hallId);
    if (hallSeating.length === 0) return null;

    const hall = halls.find(h => h._id === hallId);
    if (!hall) return null;

    // Create grid
    const grid = Array(hall.rows).fill(null).map(() => Array(hall.columns).fill(null));
    hallSeating.forEach(s => {
      if (s.row >= 0 && s.row < hall.rows && s.column >= 0 && s.column < hall.columns) {
        grid[s.row][s.column] = s;
      }
    });

    const getBranchColor = (branch) => {
      const colors = {
        'CSE': 'bg-blue-100 text-blue-900 border-blue-300',
        'ECE': 'bg-green-100 text-green-900 border-green-300',
        'MECH': 'bg-purple-100 text-purple-900 border-purple-300',
        'EEE': 'bg-orange-100 text-orange-900 border-orange-300',
        'CIVIL': 'bg-red-100 text-red-900 border-red-300'
      };
      return colors[branch] || 'bg-gray-100 text-gray-900 border-gray-300';
    };

    return (
      <div key={hallId} className="mb-8 bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          {hall.block} - Room {hall.roomNumber} ({hall.capacity} seats)
        </h3>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {grid.map((row, r) => (
              <div key={r} className="flex gap-1 mb-1">
                {row.map((seat, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`w-16 h-16 rounded border-2 flex items-center justify-center cursor-pointer transition hover:shadow-md ${
                      seat ? getBranchColor(seat.branch) : 'bg-gray-50 border-gray-200'
                    }`}
                    title={seat ? `${seat.studentName} (${seat.registerNumber})` : 'Empty'}
                  >
                    {seat ? (
                      <div className="text-center text-xs">
                        <div className="font-bold">{seat.seatNumber}</div>
                        <div className="text-xs line-clamp-1">{seat.branch}</div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">-</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Occupied: {hallSeating.filter(s => s.studentId).length} | Available: {hall.capacity - hallSeating.filter(s => s.studentId).length}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Seat Allocation
          </h1>
          <p className="text-gray-600 mt-2">Generate intelligent seating arrangements</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {view === 'generate' ? (
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Generate Seating Plan</h2>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Exam Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Exam *</label>
                    <select
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                    >
                      <option value="">Choose an exam...</option>
                      {exams.map(exam => (
                        <option key={exam._id} value={exam._id}>
                          {exam.name} - {exam.subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Exam Type *</label>
                    <select
                      value={selectedExamType}
                      onChange={(e) => setSelectedExamType(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                    >
                      {ExamTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timing */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Timing *</label>
                  <div className="flex gap-4">
                    {TimingOptions.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="timing"
                          value={opt.value}
                          checked={selectedTiming === opt.value}
                          onChange={(e) => setSelectedTiming(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hall Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Halls *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {halls.map(hall => (
                      <label key={hall._id} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition">
                        <input
                          type="checkbox"
                          checked={selectedHalls.includes(hall._id)}
                          onChange={() => handleHallToggle(hall._id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{hall.block} - Room {hall.roomNumber}</div>
                          <div className="text-sm text-gray-600">{hall.capacity} seats ({hall.rows}×{hall.columns})</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-gray-700">
                    <p>Total Students: <span className="font-bold">{(exams.find((exam) => exam._id === selectedExam)?.departments?.length ? students.filter((student) => exams.find((exam) => exam._id === selectedExam).departments.includes(student.branch)).length : students.length)}</span></p>
                    <p>Total Seats Available: <span className="font-bold">{selectedHalls.reduce((sum, hallId) => sum + (halls.find(h => h._id === hallId)?.capacity || 0), 0)}</span></p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={autoGenerateInAllRooms}
                    disabled={generating || !selectedExam || halls.length === 0}
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Auto Seating in All Rooms'
                    )}
                  </button>

                  <button
                    onClick={() => generateSeating()}
                    disabled={generating || !selectedExam || selectedHalls.length === 0}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Seating Plan'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : seatingPlan ? (
          <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
                <div className="text-2xl font-bold text-blue-900">{metrics.total}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                <div className="text-2xl font-bold text-green-900">{metrics.allocated}</div>
                <div className="text-sm text-gray-600">Allocated</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-600">
                <div className="text-2xl font-bold text-orange-900">{metrics.unallocated}</div>
                <div className="text-sm text-gray-600">Unallocated</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
                <div className="text-2xl font-bold text-red-900">{metrics.conflicts}</div>
                <div className="text-sm text-gray-600">Conflicts</div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <DownloadCloud className="w-5 h-5" />
                Export Seating Plan
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => downloadExport('csv')}
                  className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => downloadExport('excel')}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => downloadExport('pdf')}
                  className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition"
                >
                  Print
                </button>
              </div>
            </div>

            {/* Seating Grids */}
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Seating Arrangements</h3>
              {selectedHalls.map(hallId => (
                <SeatingGrid key={hallId} seating={seatingPlan} hallId={hallId} />
              ))}
            </div>

            {/* Back Button */}
            <button
              onClick={() => setView('generate')}
              className="w-full py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition"
            >
              Back to Generation
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
