import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const courseTitle = useMemo(() => course?.title ?? 'Course', [course]);

  useEffect(() => {
    let mounted = true;
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const [{ data: courseList }, { data: lectureList }] = await Promise.all([
          api.get('/courses'),
          api.get(`/courses/${courseId}/lectures`),
        ]);
        if (!mounted) return;
        const foundCourse = courseList.find((c) => String(c.id) === String(courseId)) ?? null;
        setCourse(foundCourse);
        if (!foundCourse) {
          setError('Course not found');
        }
        setLectures(lectureList);
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-wide text-indigo-200">Course</div>
          <h1 className="text-3xl font-bold text-white">{courseTitle}</h1>
          <p className="text-sm text-slate-300">Lectures and audio links.</p>
        </div>
        <Link to="/courses" className="text-sm text-indigo-300 hover:text-indigo-200">
          ← Back to courses
        </Link>
      </div>

      {loading && <div className="text-slate-300">Loading...</div>}
      {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-slate-200">
            <h2 className="text-xl font-semibold text-white">Course overview</h2>
            <p className="mt-2 text-sm text-slate-300">{course?.description || 'No description provided.'}</p>
            <p className="mt-2 text-xs text-slate-400">Instructor: {course?.instructor?.name ?? 'N/A'}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Lectures</h3>
            {lectures.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
                No lectures yet.
              </div>
            )}
            <div className="space-y-3">
              {lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm shadow-slate-950/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-wide text-slate-400">Lecture #{lecture.position}</div>
                      <div className="text-lg font-semibold text-white">{lecture.title}</div>
                      <div className="text-sm text-slate-300">{lecture.description || 'No description'}</div>
                    </div>
                    {lecture.audio_url && (
                      <a
                        href={lecture.audio_url}
                        className="text-sm text-indigo-300 hover:text-indigo-200"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Audio
                      </a>
                    )}
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
