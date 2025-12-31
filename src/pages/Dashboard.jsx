import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthContext } from '../auth/AuthProvider';

export default function Dashboard() {
  const { user, logout, token, initialized } = useAuthContext();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch when auth is ready and a token exists (endpoint is protected).
    if (!initialized) return;
    if (!token) {
      setCourses([]);
      setError('يجب تسجيل الدخول لعرض الدورات');
      setLoading(false);
      return;
    }

    let mounted = true;
    setError(null);
    setCourses([]);
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get('/courses');
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

        // Keep all course handling id-based; no title filtering so Arabic/typo titles still render.
        const coursesWithCounts = await Promise.all(
          list.map(async (course) => {
            try {
              const { data: lectures } = await api.get(`/courses/${course.id}/lectures`);
              return { ...course, lecturesCount: Array.isArray(lectures) ? lectures.length : 0 };
            } catch (err) {
              return { ...course, lecturesCount: 0 };
            }
          })
        );

        if (mounted) setCourses(coursesWithCounts);
      } catch (e) {
        if (mounted) {
          setCourses([]);
          setError('تعذر تحميل الدورات');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialized, token]);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-row-reverse items-start justify-end">
        <div className="ml-auto max-w-xl text-right space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">مرحبًا بك يا {user?.name}</h1>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 text-right text-slate-900 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-sky-700">المحاضرة القادمة</div>
            <div className="text-xl font-bold">ما لا يسع المسلم جهله</div>
            <div className="text-sm text-slate-700">عنوان المحاضرة: مقدمة أساسية</div>
            <div className="text-xs text-slate-600">التاريخ والوقت: الخميس 8:00 م (تجريبي)</div>
          </div>
          <div className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            استعد للمحاضرة القادمة وتأكد من مراجعة الدروس السابقة.
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-right text-slate-700 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide text-sky-700">الدورات</div>
              <h2 className="text-xl font-semibold text-slate-900">أحدث الدورات المتاحة</h2>
            </div>
            <Link to="/courses" className="text-sm text-sky-700 hover:text-sky-600">عرض الكل</Link>
          </div>

          {loading && <div className="text-slate-600">جاري تحميل الدورات...</div>}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm text-right">
              لا توجد دورات حالياً.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-sky-200 hover:shadow-md"
              >
                <div className="text-sm uppercase tracking-wide text-slate-500">دورة</div>
                <div className="text-lg font-semibold text-slate-900">{course.title}</div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{course.description || 'لا يوجد وصف'}</p>
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  <div>المدرب: {course.instructor?.name || 'غير متوفر'}</div>
                  <div>عدد المحاضرات: {course.lecturesCount ?? 0}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-right text-slate-700 shadow-sm space-y-2">
          <div className="text-sm uppercase tracking-wide text-sky-700">تنويه</div>
          <p className="text-sm text-slate-700">الرجاء متابعة جدول المحاضرات والالتزام بمواعيد الاختبارات.</p>
          <p className="text-xs text-slate-500">جميع المواعيد وأوقات البث افتراضية للأغراض التجريبية.</p>
        </div>
      </div>
    </div>
  );
}
