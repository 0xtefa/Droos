import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/courses');
        if (mounted) setCourses(data);
      } catch (e) {
        if (mounted) setError('Failed to load courses');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-wide text-indigo-200">Courses</div>
          <h1 className="text-3xl font-bold text-white">Browse courses</h1>
          <p className="text-sm text-slate-300">Select a course to view its lectures.</p>
        </div>
      </div>

      {loading && <div className="text-slate-300">Loading courses...</div>}
      {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Link
            to={`/courses/${course.id}`}
            key={course.id}
            className="block rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-md shadow-slate-950/50 hover:border-indigo-500/60 hover:shadow-indigo-900/60"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{course.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-300">{course.description || 'No description'}</p>
              </div>
              <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200">{course.role || 'Course'}</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Instructor: {course.instructor?.name || 'N/A'}
            </div>
          </Link>
        ))}
      </div>

      {!loading && !error && courses.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          No courses yet. Instructors can create courses via the API.
        </div>
      )}
    </div>
  );
}
