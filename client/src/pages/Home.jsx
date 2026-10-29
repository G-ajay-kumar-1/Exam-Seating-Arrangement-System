import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap, BookOpen, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleExamType = (type) => {
    if (token) {
      navigate('/allocation', { state: { examType: type } });
    } else {
      navigate('/login', { state: { redirectAfter: '/allocation', examType: type } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-blue-900">Automated Exam Seating</h1>
              <p className="text-xs text-blue-600">SIMATS Engineering</p>
            </div>
          </div>
          {token && (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Dashboard
            </button>
          )}
          {!token && (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              <LogIn className="w-4 h-4" />
              Admin Login
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-blue-900 mb-4">
            Automated Exam Seating System
          </h2>
          <p className="text-xl text-blue-700 mb-4">
            Intelligent Seat Allocation to Prevent Same-Branch Clustering
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Streamline your examination process with our advanced seating allocation system.
            Automatically generate conflict-free seating arrangements for theory exams,
            lab exams, and government examinations.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">Smart Allocation</h3>
            <p className="text-gray-600">
              Automatically assigns seats using intelligent branch-aware constraints
              to minimize conflicts and ensure fair distribution.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
            <Code2 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">Conflict Prevention</h3>
            <p className="text-gray-600">
              Advanced algorithms reduce same-branch adjacency and support fair seating
              arrangements across different examination types.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
            <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">Instant Reports</h3>
            <p className="text-gray-600">
              Generate comprehensive hall-wise seating plans and export them
              as CSV, Excel, or PDF instantly.
            </p>
          </div>
        </div>

        {/* Exam Type Selection */}
        <div className="bg-white rounded-lg shadow-xl p-12 mb-12">
          <h3 className="text-2xl font-bold text-blue-900 text-center mb-8">
            Select Examination Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Theory Exams */}
            <button
              onClick={() => handleExamType('Theory Exam')}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-8 transition-all hover:shadow-xl hover:scale-105 border-2 border-blue-200 hover:border-blue-600"
            >
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition" />
              <div className="relative">
                <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-blue-900 mb-2">Theory Exams</h4>
                <p className="text-gray-600 mb-4">
                  Generate seating for classroom-based theoretical examinations
                </p>
                <div className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold group-hover:bg-blue-700 transition">
                  Begin →
                </div>
              </div>
            </button>

            {/* Lab Exams */}
            <button
              onClick={() => handleExamType('Lab Exam')}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-8 transition-all hover:shadow-xl hover:scale-105 border-2 border-green-200 hover:border-green-600"
            >
              <div className="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-5 transition" />
              <div className="relative">
                <Code2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-green-900 mb-2">Lab Exams</h4>
                <p className="text-gray-600 mb-4">
                  Organize software and hardware lab practical examinations
                </p>
                <div className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg font-semibold group-hover:bg-green-700 transition">
                  Begin →
                </div>
              </div>
            </button>

            {/* Government Exams */}
            <button
              onClick={() => handleExamType('Government Exam')}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-8 transition-all hover:shadow-xl hover:scale-105 border-2 border-purple-200 hover:border-purple-600"
            >
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-5 transition" />
              <div className="relative">
                <GraduationCap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-purple-900 mb-2">Govt Exams</h4>
                <p className="text-gray-600 mb-4">
                  Allocate seating for JEE/NEET and other government entrance examinations
                </p>
                <div className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold group-hover:bg-purple-700 transition">
                  Begin →
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { num: '1', title: 'Import Data', desc: 'Upload student and exam information' },
              { num: '2', title: 'Configure', desc: 'Set up halls and seating capacity' },
              { num: '3', title: 'Generate', desc: 'Run intelligent allocation algorithm' },
              { num: '4', title: 'Export', desc: 'Get reports in any format needed' }
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {step.num}
                </div>
                <h4 className="font-bold text-blue-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>Automated Exam Seating System v1.0</p>
            <p className="text-sm">SIMATS Engineering | Saveetha Institute of Medical and Technical Sciences</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
