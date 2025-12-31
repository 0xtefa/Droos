import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [completingLectureId, setCompletingLectureId] = useState(null);

  const courseTitle = useMemo(() => course?.title ?? 'Course', [course]);

  const toEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace('www.', '');
      const isYouTube = ['youtube.com', 'youtu.be', 'm.youtube.com', 'youtube-nocookie.com'].some((domain) =>
        host.endsWith(domain)
      );
      if (!isYouTube) return url;

      const listId = parsed.searchParams.get('list');
      const watchId = parsed.searchParams.get('v');
      const shortId = host.includes('youtu.be') ? parsed.pathname.replace('/', '') : null;
      const embedPath = parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/embed/')[1] : null;
      const videoId = watchId || shortId || embedPath;

      const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
      });
      if (listId) params.set('list', listId);

      if (!videoId && listId) {
        return `https://www.youtube.com/embed/videoseries?${params.toString()}`;
      }

      if (!videoId) return url;
      const query = params.toString();
      return `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ''}`;
    } catch (e) {
      return url;
    }
  };

  useEffect(() => {
    let mounted = true;
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const [{ data: courseList }, { data: lectureList }, { data: progressData }] = await Promise.all([
          api.get('/courses'),
          api.get(`/courses/${courseId}/lectures`),
          api.get(`/courses/${courseId}/progress`),
        ]);
        if (!mounted) return;
        const foundCourse = courseList.find((c) => String(c.id) === String(courseId)) ?? null;
        setCourse(foundCourse);
        if (!foundCourse) {
          setError('Course not found');
        }
        setLectures(lectureList);
        setProgress(progressData || { completed: 0, total: lectureList?.length ?? 0, percentage: 0 });
      } catch (e) {
        if (mounted) setError('Failed to load course');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  const markCompleted = async (lectureId) => {
    try {
      setCompletingLectureId(lectureId);
      const { data } = await api.post(`/lectures/${lectureId}/complete`);
      setLectures((prev) =>
        prev.map((lec) => (lec.id === lectureId ? { ...lec, is_completed: true } : lec))
      );
      if (data?.progress) setProgress(data.progress);
    } catch (e) {
      console.error('Mark lecture complete failed', {
        status: e.response?.status,
        message: e.response?.data?.message,
      });
    } finally {
      setCompletingLectureId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-right">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="text-sm font-semibold uppercase tracking-wide text-sky-700">الدورة</div>
        <h1 className="text-4xl font-extrabold leading-tight text-slate-900">{courseTitle}</h1>
        <p className="text-sm text-slate-600">المحاضرات، الفيديو، والروابط الصوتية.</p>
        <Link to="/courses" className="text-sm font-semibold text-sky-700 hover:text-sky-600">
          العودة إلى الدورات
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-right shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-sky-700">تقدم الدورة</div>
            <div className="text-sm text-slate-700">
              {progress.completed} / {progress.total} محاضرات مكتملة
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-2 bg-sky-600 transition-all"
                style={{ width: `${Math.min(progress.percentage, 100)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-slate-600">{progress.percentage}%</div>
          </div>
        </div>
      </div>

      {loading && <div className="text-slate-600">جاري التحميل...</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 shadow-sm text-right">
            <h2 className="text-xl font-semibold text-slate-900">نظرة عامة</h2>
            <p className="mt-2 text-sm text-slate-600">{course?.description || 'لا يوجد وصف.'}</p>
            <p className="mt-2 text-xs text-slate-500">المدرب: {course?.instructor?.name ?? 'غير متوفر'}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 text-right">المحاضرات</h3>
            {lectures.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm text-right">
                لا توجد محاضرات بعد.
              </div>
            )}
            <div className="space-y-3">
              {lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-right"
                >
                  <div className="flex flex-col gap-5">
                    {lecture.video_url && (
                      <div className="w-full">
                        <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                          <iframe
                            className="h-full w-full"
                            src={toEmbedUrl(lecture.video_url)}
                            title={lecture.title}
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        محاضرة #{lecture.position}
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{lecture.title}</div>
                      <div className="text-sm text-slate-600 max-w-3xl">{lecture.description || 'لا يوجد وصف'}</div>
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                        {lecture.is_completed ? (
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">تم الإكمال</span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">لم يكتمل بعد</span>
                        )}
                      </div>
                    </div>

                    {lecture.audio_url && (
                      <div className="w-full">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                          <div className="mb-2 text-sm font-semibold text-slate-800 text-right">الصوت</div>
                          <audio className="w-full" controls src={lecture.audio_url}>
                            المتصفح لا يدعم تشغيل الصوت.
                          </audio>
                        </div>
                      </div>
                    )}

                    {lecture.summary?.summary && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-inner">
                        <div className="mb-2 text-xs font-semibold text-sky-700">ملخص المحاضرة</div>
                        <p className="leading-relaxed">{lecture.summary.summary}</p>
                      </div>
                    )}

                    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-700 md:flex-row">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markCompleted(lecture.id)}
                          disabled={lecture.is_completed || completingLectureId === lecture.id}
                          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${lecture.is_completed ? 'bg-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
                        >
                          {lecture.is_completed
                            ? 'تم الإكمال'
                            : completingLectureId === lecture.id
                              ? 'جارٍ الحفظ...'
                              : 'تم الاستماع إلى الدرس'}
                        </button>
                      </div>

                      <div className="flex flex-row-reverse items-center gap-3 text-sm text-slate-600">
                        {lecture.quiz ? (
                          lecture.is_completed ? (
                            <Link
                              to={`/lectures/${lecture.id}/quiz`}
                              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
                            >
                              الانتقال إلى اختبار المحاضرة
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500"
                            >
                              أكمل المحاضرة لفتح الاختبار
                            </button>
                          )
                        ) : (
                          <span className="text-sm text-slate-500">سيتم إضافة الاختبار قريبًا.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
