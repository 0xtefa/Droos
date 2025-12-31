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
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pt-[100px]">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wide text-sky-700">مرحبًا بعودتك</div>
        <h1 className="text-3xl font-bold text-slate-900">تسجيل الدخول</h1>
        <p className="text-sm text-slate-600">ادخل للوصول إلى الدورات والمحاضرات والاختبارات.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
        <div className="space-y-2">
          <label className="text-sm text-slate-700" htmlFor="email">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-700" htmlFor="password">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">حدث خطأ أثناء تسجيل الدخول</div>}
        <button
          type="submit"
          disabled={loading}
          className="mt-[15px] flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
        <div className="mt-[15px] text-center text-sm text-slate-600">
          لا تملك حسابًا؟{' '}
          <Link to="/register" className="text-sky-700 hover:text-sky-600">
            أنشئ حسابًا
          </Link>
        </div>
      </form>
    </div>
  );
}
