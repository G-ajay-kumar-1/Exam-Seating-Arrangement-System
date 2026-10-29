import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpenCheck, Building2, Grid2x2, LayoutDashboard, LogOut, Search, Settings, Users } from 'lucide-react';
import LiveStatus from '../components/LiveStatus.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', to: '/students', icon: Users },
  { label: 'Examinations', to: '/exams', icon: BookOpenCheck },
  { label: 'Halls', to: '/halls', icon: Building2 },
  { label: 'Seat Allocation', to: '/allocation', icon: Grid2x2 },
  { label: 'Student Search', to: '/search', icon: Search },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings }
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useSocket({
    seatingUpdated: () => {},
    allocationCompleted: () => {},
    examCreated: () => {},
    hallUpdated: () => {},
    studentAdded: () => {},
    studentUpdated: () => {},
    studentDeleted: () => {}
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      <aside className="fixed inset-y-0 left-0 flex w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Exam Cell</div>
          <h1 className="mt-2 text-xl font-bold">Automated Seating</h1>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-72 min-h-screen">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Automated Exam Seating System</p>
              <h2 className="mt-1 text-2xl font-bold">Intelligent Seat Allocation & Examination Management</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-slate-500">Signed In</div>
                <div className="font-semibold text-ink">{user?.name || 'Admin'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="mb-6">
            <LiveStatus lastUpdated={new Date()} />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
