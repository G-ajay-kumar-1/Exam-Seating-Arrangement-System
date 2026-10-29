import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  {
    title: 'Smart Allocation',
    description: 'Automatically assigns seats using branch-aware constraints.'
  },
  {
    title: 'Conflict Prevention',
    description: 'Reduces same-branch adjacency and supports fair seating.'
  },
  {
    title: 'Instant Reports',
    description: 'Generate hall-wise seating plans and export them instantly.'
  }
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'admin@college.edu', password: 'Admin@123', confirmPassword: 'Admin@123' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      const redirectAfter = location.state?.redirectAfter || '/dashboard';
      navigate(redirectAfter, {
        replace: true,
        state: location.state?.examType ? { examType: location.state.examType } : undefined
      });
    } catch (err) {
      const action = mode === 'login' ? 'Login' : 'Sign up';
      setError(err.response?.data?.message || `${action} failed. Make sure the backend is running and try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
            <ShieldCheck size={16} />
            Secure Admin Access
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Automated Exam Seating System
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Intelligent Seat Allocation for Fair, Organized and Efficient Examinations
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card p-5">
                <div className="mb-3 inline-flex rounded-md bg-sky-100 p-2 text-sky-700">
                  {feature.title === 'Smart Allocation' && <Sparkles size={18} />}
                  {feature.title === 'Conflict Prevention' && <Users size={18} />}
                  {feature.title === 'Instant Reports' && <LogIn size={18} />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-8 shadow-lg">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{mode === 'login' ? 'Admin Login' : 'Create Admin Account'}</p>
            <h2 className="mt-2 text-3xl font-bold">{mode === 'login' ? 'Welcome back' : 'Get started'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  className="field"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
            ) : null}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="admin@college.edu"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                className="field"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                required
              />
            </div>

            {mode === 'signup' ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
                <input
                  className="field"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            ) : null}

            {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Login' : 'Sign up')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
            <button type="button" className="font-semibold text-campus hover:underline" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>
          {mode === 'login' ? <p className="mt-3 text-center text-xs text-slate-500">Demo account: admin@college.edu / Admin@123</p> : null}
        </section>
      </div>
    </div>
  );
}
