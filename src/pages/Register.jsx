import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/AuthProvider';

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
];

export default function Register() {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    password_confirmation: '',
  });
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
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const validation = err.response?.data?.errors;
      if (validation) {
        const messages = Object.values(validation).flat();
        setError(messages.join(' '));
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Join Droos</div>
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="text-sm text-slate-300">Pick your role to start building or attending courses.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/50">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 focus:border-indigo-400 focus:outline-none"
            value={form.name}
            onChange={handleChange}
          />
        </div>
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
          <label className="text-sm text-slate-200" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 focus:border-indigo-400 focus:outline-none"
            value={form.role}
            onChange={handleChange}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
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
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="password_confirmation">
            Confirm Password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 focus:border-indigo-400 focus:outline-none"
            value={form.password_confirmation}
            onChange={handleChange}
          />
        </div>
        {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-900/50 hover:bg-indigo-600 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <div className="text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-300 hover:text-indigo-200">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
