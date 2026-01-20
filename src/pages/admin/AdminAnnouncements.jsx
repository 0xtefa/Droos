import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../components';

export default function AdminAnnouncements() {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'lecture_schedule',
    course_id: '',
    scheduled_at: '',
    send_notification: true,
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchCourses();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/announcements');
      setAnnouncements(data);
    } catch (e) {
      // Only show error if it's not an auth error (401)
      if (e.response?.status !== 401) {
        toast.error('فشل في تحميل الإعلانات');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/admin/courses');
      setCourses(data);
    } catch (e) {
      // Silently fail for courses fetch
      console.error('Failed to fetch courses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/admin/announcements', {
        ...formData,
        course_id: formData.course_id || null,
      });
      toast.success('تم إنشاء الإعلان بنجاح');
      setShowModal(false);
      setFormData({
        title: '',
        message: '',
        type: 'lecture_schedule',
        course_id: '',
        scheduled_at: '',
        send_notification: true,
      });
      fetchAnnouncements();
    } catch (e) {
      toast.error('فشل في إنشاء الإعلان');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (announcement) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    try {
      await api.delete(`/admin/announcements/${announcement.id}`);
      toast.success('تم حذف الإعلان بنجاح');
      fetchAnnouncements();
    } catch (e) {
      toast.error('فشل في حذف الإعلان');
    }
  };

  const handleSendReminder = async (announcement) => {
    try {
      const { data } = await api.post(`/admin/announcements/${announcement.id}/send-reminder`);
      toast.success(`تم إرسال التذكير إلى ${data.sent_to} طالب`);
    } catch (e) {
      toast.error('فشل في إرسال التذكير');
    }
  };

  const toggleActive = async (announcement) => {
    try {
      await api.put(`/admin/announcements/${announcement.id}`, {
        is_active: !announcement.is_active,
      });
      toast.success(announcement.is_active ? 'تم إلغاء تفعيل الإعلان' : 'تم تفعيل الإعلان');
      fetchAnnouncements();
    } catch (e) {
      toast.error('فشل في تحديث الإعلان');
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'lecture_schedule':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">ميعاد محاضرة</span>;
      case 'reminder':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">تذكير</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">عام</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
            <div className="bg-white rounded-2xl p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>إعلان جديد</span>
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800">الإعلانات ومواعيد المحاضرات</h1>
            <p className="text-gray-500 mt-1">تحديد مواعيد المحاضرات وإرسال التذكيرات</p>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-2xl p-6 shadow-sm ${
                !announcement.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendReminder(announcement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="إرسال تذكير"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleActive(announcement)}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={announcement.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(announcement)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {getTypeBadge(announcement.type)}
                  <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                </div>
              </div>

              {announcement.message && (
                <p className="text-gray-600 text-right mb-4">{announcement.message}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-400">
                  أنشئ بواسطة: {announcement.creator?.name}
                </span>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {announcement.course && (
                    <span>📚 {announcement.course.title}</span>
                  )}
                  {announcement.scheduled_at && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(announcement.scheduled_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📢</div>
              <p className="text-gray-500">لا يوجد إعلانات بعد</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                أنشئ أول إعلان
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4 text-right">
                إعلان جديد / ميعاد محاضرة
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-right text-gray-700 text-sm font-medium mb-1">
                    نوع الإعلان
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lecture_schedule">ميعاد محاضرة</option>
                    <option value="reminder">تذكير</option>
                    <option value="general">إعلان عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-right text-gray-700 text-sm font-medium mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: المحاضرة القادمة"
                    required
                  />
                </div>

                <div>
                  <label className="block text-right text-gray-700 text-sm font-medium mb-1">
                    الرسالة (اختياري)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="تفاصيل إضافية..."
                  />
                </div>

                <div>
                  <label className="block text-right text-gray-700 text-sm font-medium mb-1">
                    الكورس (اختياري)
                  </label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر كورس...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                {formData.type === 'lecture_schedule' && (
                  <div>
                    <label className="block text-right text-gray-700 text-sm font-medium mb-1">
                      ميعاد المحاضرة
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.type === 'lecture_schedule'}
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.send_notification}
                    onChange={(e) => setFormData({ ...formData, send_notification: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700 text-sm">إرسال إشعار لجميع الطلاب</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'جارٍ الإنشاء...' : 'إنشاء'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
