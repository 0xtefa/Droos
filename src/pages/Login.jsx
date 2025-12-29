import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/AuthProvider';

export default function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Welcome back</div>
        <h1 className="text-3xl font-bold text-white">Sign in to Droos</h1>
        <p className="text-sm text-slate-300">Access your courses, lectures, and quizzes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/50">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 focus:border-indigo-400 focus:outline-none"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 focus:border-indigo-400 focus:outline-none"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-900/50 hover:bg-indigo-600 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <div className="text-center text-sm text-slate-300">
          No account?{' '}
          <Link to="/register" className="text-indigo-300 hover:text-indigo-200">
            Create one
          </Link>
        </div>
      </form>
    </div>
  );
}
