import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthContext } from '../auth/AuthProvider';

export default function Courses() {
  const { token, initialized } = useAuthContext();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Require auth token to avoid 401 errors from protected /courses endpoint.
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

        // Always use course id for any downstream lookups instead of relying on title text.
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-right">
          <div className="text-sm uppercase tracking-wide text-sky-700">الدورات</div>
          <h1 className="text-3xl font-bold text-slate-900">استعرض الدورات</h1>
          <p className="text-sm text-slate-600">اختر دورة لعرض محاضراتها.</p>
        </div>
      </div>

      {loading && <div className="text-slate-600">جاري تحميل الدورات...</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">تعذر تحميل الدورات</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Link
            to={`/courses/${course.id}`}
            key={course.id}
            className="block rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition-colors hover:border-sky-200 hover:shadow-md"
          >
            <div className="flex flex-row-reverse items-center justify-between">
              <div className="text-right">
                <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{course.description || 'لا يوجد وصف'}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600 text-right space-y-1">
              <div>المدرب: {course.instructor?.name || 'غير متوفر'}</div>
              <div>عدد المحاضرات: {course.lecturesCount ?? 0}</div>
            </div>
          </Link>
        ))}
      </div>

      {!loading && !error && courses.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm text-right">
          لا توجد دورات بعد. يمكن للمدربين إنشاء الدورات عبر واجهة البرمجة.
        </div>
      )}
    </div>
  );
}
