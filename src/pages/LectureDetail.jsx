import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components';

export default function LectureDetail() {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [lecture, setLecture] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [attending, setAttending] = useState(false);

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
    fetchLecture();
  }, [lectureId]);

  const fetchLecture = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/lectures/${lectureId}`);
      setLecture(data.lecture);
      setCourse(data.course);
    } catch (e) {
      setError('لم يتم العثور على المحاضرة');
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async () => {
    try {
      setCompleting(true);
      await api.post(`/lectures/${lectureId}/complete`);
      setLecture(prev => ({ ...prev, is_completed: true }));
      toast.success('تم إكمال المحاضرة بنجاح! 🎉');
    } catch (e) {
      toast.error('فشل في تحديث حالة المحاضرة');
    } finally {
      setCompleting(false);
    }
  };

  const markAttendance = async () => {
    try {
      setAttending(true);
      await api.post(`/lectures/${lectureId}/attend`);
      setLecture(prev => ({ ...prev, is_attended: true }));
      toast.success('تم تسجيل الحضور بنجاح! +100 نقطة 🌟');
    } catch (e) {
      if (e.response?.status === 409) {
        toast.info('تم تسجيل حضورك مسبقاً');
        setLecture(prev => ({ ...prev, is_attended: true }));
      } else {
        toast.error('فشل في تسجيل الحضور');
      }
    } finally {
      setAttending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
            <div className="aspect-video bg-gray-300 rounded-2xl"></div>
            <div className="bg-white rounded-2xl p-6 h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link to="/courses" className="text-blue-600 hover:text-blue-700">
            العودة إلى الدورات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/courses" className="hover:text-blue-600">الدورات</Link>
          <span>/</span>
          <Link to={`/courses/${course?.id}`} className="hover:text-blue-600">{course?.title}</Link>
          <span>/</span>
          <span className="text-gray-800">{lecture?.title}</span>
        </div>

        {/* Lecture Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between flex-row-reverse">
            <div className="flex items-center gap-2">
              {lecture?.is_completed && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ مكتملة
                </span>
              )}
              {lecture?.is_attended && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ حضور مسجل
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm text-blue-600 font-medium">المحاضرة {lecture?.position}</span>
              <h1 className="text-2xl font-bold text-gray-800 mt-1">{lecture?.title}</h1>
              <p className="text-gray-500 mt-2">{lecture?.description || 'لا يوجد وصف'}</p>
            </div>
          </div>
        </div>

        {/* Video Player */}
        {lecture?.video_url && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={toEmbedUrl(lecture.video_url)}
                title={lecture.title}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Audio Player */}
        {lecture?.audio_url && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-right">🎧 الملف الصوتي</h3>
            <audio className="w-full" controls src={lecture.audio_url}>
              المتصفح لا يدعم تشغيل الصوت.
            </audio>
          </div>
        )}

        {/* Lecture Summary */}
        {lecture?.summary?.summary && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-right">📝 ملخص المحاضرة</h3>
            <p className="text-gray-600 leading-relaxed text-right">{lecture.summary.summary}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 text-right">الإجراءات</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attendance Button */}
            <button
              onClick={markAttendance}
              disabled={lecture?.is_attended || attending}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl font-medium transition-all ${
                lecture?.is_attended
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {lecture?.is_attended ? (
                <>
                  <span className="text-2xl">✅</span>
                  <span>تم تسجيل الحضور</span>
                </>
              ) : attending ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>جارٍ التسجيل...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🙋</span>
                  <span>تسجيل الحضور (+100 نقطة)</span>
                </>
              )}
            </button>

            {/* Complete Button */}
            <button
              onClick={markCompleted}
              disabled={lecture?.is_completed || completing}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl font-medium transition-all ${
                lecture?.is_completed
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {lecture?.is_completed ? (
                <>
                  <span className="text-2xl">✅</span>
                  <span>تم إكمال المحاضرة</span>
                </>
              ) : completing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">📚</span>
                  <span>تم الاستماع للدرس</span>
                </>
              )}
            </button>
          </div>

          {/* Quiz Button */}
          <div className="mt-4">
            {lecture?.quiz ? (
              lecture?.is_completed ? (
                <Link
                  to={`/lectures/${lectureId}/quiz`}
                  className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all"
                >
                  <span className="text-2xl">📝</span>
                  <span>الانتقال إلى الاختبار</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
                >
                  <span className="text-2xl">🔒</span>
                  <span>أكمل المحاضرة لفتح الاختبار</span>
                </button>
              )
            ) : (
              <div className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-gray-50 text-gray-500">
                <span className="text-2xl">📋</span>
                <span>سيتم إضافة الاختبار قريباً</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Link
            to={`/courses/${course?.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span>العودة للدورة</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
