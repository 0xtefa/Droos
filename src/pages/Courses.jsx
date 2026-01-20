import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthContext } from '../auth/AuthProvider';
import { SkeletonCourseGrid, useToast } from '../components';

// دالة للتعامل مع صيغة الجمع العربي للمحاضرات
const formatLectureCount = (count) => {
  if (count === 0) return 'لا توجد محاضرات';
  if (count === 1) return 'محاضرة واحدة';
  if (count === 2) return 'محاضرتان';
  if (count >= 3 && count <= 10) return `${count} محاضرات`;
  return `${count} محاضرة`; // 11 وأكثر
};

export default function Courses() {
  const { token, initialized } = useAuthContext();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'fiqh', label: 'فقه' },
    { id: 'tafsir', label: 'تفسير' },
    { id: 'aqeedah', label: 'عقيدة' },
    { id: 'raqaiq', label: 'رقائق' },
    { id: 'general', label: 'متنوع' },
  ];

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

  // Filter courses based on search term and category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeFilter === 'all' || course.category === activeFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-6 animate-fade-in">

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن دورة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 pr-12 text-right text-gray-700 placeholder-gray-400 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-3 justify-start" dir="rtl">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.id
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && <SkeletonCourseGrid count={4} />}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-right">
            تعذر تحميل الدورات
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Course Image */}
                  <div className="w-36 h-28 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={course.image || `/src/images/course-${(index % 4) + 1}.jpg`}
                      alt={course.title}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('bg-gradient-to-br', 'from-blue-100', 'to-blue-200');
                      }}
                    />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 text-right">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {course.instructor?.name || 'غير متوفر'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatLectureCount(course.lecturesCount ?? 0)}
                    </p>
                  </div>
                </div>

                {/* View Course Button */}
                <div className="mt-4">
                  <Link
                    to={`/courses/${course.id}`}
                    className="block w-full text-center py-3 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                  >
                    عرض الدورة
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-500">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد دورات بعد'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
