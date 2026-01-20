import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/AuthProvider';
import { useToast, ButtonSpinner } from '../components';

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
];

export default function Register() {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const toast = useToast();
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
      toast.success('تم إنشاء الحساب بنجاح', 'مرحبًا بك');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const validation = err.response?.data?.errors;
      if (validation) {
        const messages = Object.values(validation).flat();
        setError(messages.join(' '));
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
      toast.error('فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wide text-sky-700">انضم إلى دروس</div>
        <h1 className="text-3xl font-bold text-slate-900">أنشئ حسابك</h1>
        <p className="text-sm text-slate-600">اختر دورك للبدء في إنشاء أو حضور الدورات.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
        <div className="space-y-2">
          <label className="text-sm text-slate-700" htmlFor="name">
            الاسم
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none"
            value={form.name}
            onChange={handleChange}
          />
        </div>
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
          <label className="text-sm text-slate-700" htmlFor="role">
            الدور
          </label>
          <select
            id="role"
            name="role"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none"
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
        <div className="space-y-2">
          <label className="text-sm text-slate-700" htmlFor="password_confirmation">
            تأكيد كلمة المرور
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none"
            value={form.password_confirmation}
            onChange={handleChange}
          />
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">حدث خطأ أثناء إنشاء الحساب</div>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:opacity-60"
        >
          {loading && <ButtonSpinner className="text-white" />}
          {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
        </button>
        <div className="text-center text-sm text-slate-600">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-sky-700 hover:text-sky-600">
            تسجيل الدخول
          </Link>
        </div>
      </form>
    </div>
  );
}
