import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthContext } from '../auth/AuthProvider';
import { SkeletonDashboard, useToast } from '../components';

export default function Dashboard() {
  const { user, logout, token, initialized } = useAuthContext();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, totalProgress: 0 });

  // Countdown timer
  useEffect(() => {
    if (!nextSchedule?.scheduled_at) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(nextSchedule.scheduled_at).getTime();
      const diff = target - now;

      if (diff > 0) {
        setCountdown({
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextSchedule]);

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

    // Fetch next lecture schedule
    (async () => {
      try {
        const { data } = await api.get('/announcements/next-schedule');
        if (mounted && data) setNextSchedule(data);
      } catch (e) {
        // Ignore errors for schedule
      }
    })();

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

        if (mounted) {
          setCourses(coursesWithCounts);
          // Calculate mock stats
          const completed = Math.floor(coursesWithCounts.length * 0.3);
          const inProgress = coursesWithCounts.length - completed;
          setStats({
            completed,
            inProgress,
            totalProgress: coursesWithCounts.length > 0 ? 85 : 0
          });
        }
      } catch (e) {
        if (mounted) {
          setCourses([]);
          setError('تعذر تحميل الدورات');
          toast.error('تعذر تحميل الدورات', 'خطأ في الاتصال');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialized, token]);

  // Show skeleton while loading
  if (loading && !error) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl animate-fade-in">

        {/* Top Section - Welcome Card + Next Lecture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Welcome Card - Takes 2 columns */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-l from-blue-700 to-blue-500 p-6 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Text content */}
              <div className="text-center md:text-right flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  مرحبًا بك يا {user?.name}
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  تابع مسيرتك التعليمية واستكشف المحتوى الجديد.
                </p>
              </div>

              {/* Progress Circle */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-sm text-blue-100">تقدمك في الدورات</div>
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${stats.totalProgress * 3.02} 302`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{stats.totalProgress}%</span>
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-xl font-bold">{stats.inProgress}</div>
                    <div className="text-xs text-blue-100">في تقدم</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{stats.completed}</div>
                    <div className="text-xs text-blue-100">مكتملة</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Lecture Card - White/Light green theme */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col items-center justify-center text-center shadow-sm">
            {/* Clock icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="text-sm text-slate-500 mb-1">المحاضرة القادمة:</div>
            <h3 className="font-bold text-lg text-slate-800 mb-1">
              {nextSchedule?.title || 'لم يتم تحديد محاضرة'}
            </h3>
            <div className="text-xs text-slate-500 mb-3">
              {nextSchedule?.scheduled_at
                ? new Date(nextSchedule.scheduled_at).toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'سيتم الإعلان قريباً'}
            </div>

            {/* Countdown + Button */}
            {nextSchedule?.course?.id ? (
              <Link
                to={`/courses/${nextSchedule.course.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <span>انضم الآن</span>
                <span className="bg-white/20 rounded px-2 py-0.5 text-xs font-mono">
                  {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                </span>
              </Link>
            ) : (
              <button className="rounded-lg bg-slate-100 text-slate-400 px-4 py-2.5 text-sm font-medium cursor-not-allowed" disabled>
                لا يوجد محاضرة حالياً
              </button>
            )}
          </div>
        </div>

        {/* Courses Section Title */}
        <h2 className="text-xl font-bold text-slate-800 mb-4 text-right">دوراتك المسجلة</h2>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-right mb-4">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center">
            <div className="text-slate-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-500">لا توجد دورات مسجلة حالياً</p>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course, index) => {
            // Generate a mock progress percentage for display
            const progressPercent = index === 0 ? 30 : index === 1 ? 60 : Math.floor(Math.random() * 80) + 10;

            return (
              <div
                key={course.id}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Course Image */}
                <div className="h-55 bg-slate-100 overflow-hidden">
                  <img
                    src={course.image || '/images/course-placeholder.jpg'}
                    alt={course.title}
                    className="w-full h-full object-cover object-[70%_11%]"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('bg-gradient-to-br', 'from-blue-400', 'to-blue-600');
                    }}
                  />
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 text-right">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-1 text-right">
                    {course.instructor?.name || 'غير متوفر'}
                  </p>
                  <p className="text-sm text-slate-500 mb-3 text-right">
                    {course.lecturesCount ?? 0} محاضرات
                  </p>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-slate-600 whitespace-nowrap">اكتمل {progressPercent}%</span>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* View Course Button */}
                  <Link
                    to={`/courses/${course.id}`}
                    className="inline-block rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium transition-colors"
                  >
                    عرض الدورة
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
