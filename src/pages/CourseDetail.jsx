import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { SkeletonLectureList, Skeleton, useToast } from '../components';

export default function CourseDetail() {
  const { courseId } = useParams();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  const courseTitle = useMemo(() => course?.title ?? 'الدورة', [course]);

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
          setError('لم يتم العثور على الدورة');
        }
        setLectures(lectureList);
        setProgress(progressData || { completed: 0, total: lectureList?.length ?? 0, percentage: 0 });
      } catch (e) {
        if (mounted) setError('فشل في تحميل الدورة');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  // دالة للتعامل مع صيغة الجمع العربي للمحاضرات
  const formatLectureCount = (count) => {
    if (count === 0) return 'لا توجد محاضرات';
    if (count === 1) return 'محاضرة واحدة';
    if (count === 2) return 'محاضرتان';
    if (count >= 3 && count <= 10) return `${count} محاضرات`;
    return `${count} محاضرة`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/courses" className="hover:text-blue-600">الدورات</Link>
          <span>/</span>
          <span className="text-gray-800">{courseTitle}</span>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Course Image */}
            <div className="w-full md:w-48 h-32 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden flex-shrink-0">
              {course?.image && (
                <img
                  src={course.image}
                  alt={courseTitle}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1 text-right">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{courseTitle}</h1>
              <p className="text-gray-500 mb-3">{course?.description || 'لا يوجد وصف'}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  👨‍🏫 {course?.instructor?.name || 'غير متوفر'}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  📚 {formatLectureCount(lectures.length)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {progress.completed} / {progress.total} مكتملة
            </span>
            <h3 className="text-lg font-bold text-gray-800">تقدمك في الدورة</h3>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                progress.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm font-medium text-gray-600">
            {progress.percentage === 100 ? '🎉 مبروك! أكملت الدورة' : `${progress.percentage}%`}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <SkeletonLectureList count={4} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Lectures List */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">📖 المحاضرات</h3>

            {lectures.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد محاضرات بعد
              </div>
            ) : (
              <div className="space-y-3">
                {lectures.map((lecture, index) => (
                  <Link
                    key={lecture.id}
                    to={`/lectures/${lecture.id}`}
                    className={`block p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      lecture.is_completed
                        ? 'border-green-200 bg-green-50 hover:border-green-300'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Lecture Number */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        lecture.is_completed
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {lecture.is_completed ? (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="font-bold">{lecture.position || index + 1}</span>
                        )}
                      </div>

                      {/* Lecture Info */}
                      <div className="flex-1 text-right">
                        <h4 className="font-semibold text-gray-800 mb-1">{lecture.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {lecture.description || 'اضغط لعرض المحاضرة'}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {lecture.quiz && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                            📝 اختبار
                          </span>
                        )}
                        {lecture.is_completed ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            ✓ مكتملة
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            لم تكتمل
                          </span>
                        )}
                      </div>

                      {/* Arrow */}
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
