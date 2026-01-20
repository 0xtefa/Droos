import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useToast } from '../../components';

export default function AdminCourses() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/courses');
      setCourses(data);
    } catch (e) {
      toast.error('فشل في تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, formData);
        toast.success('تم تحديث الكورس بنجاح');
      } else {
        await api.post('/admin/courses', formData);
        toast.success('تم إنشاء الكورس بنجاح');
      }
      setShowModal(false);
      setEditingCourse(null);
      setFormData({ title: '', description: '' });
      fetchCourses();
    } catch (e) {
      toast.error('فشل في حفظ الكورس');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (!confirm(`هل أنت متأكد من حذف "${course.title}"؟`)) return;

    try {
      await api.delete(`/admin/courses/${course.id}`);
      toast.success('تم حذف الكورس بنجاح');
      fetchCourses();
    } catch (e) {
      toast.error('فشل في حذف الكورس');
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({ title: course.title, description: course.description || '' });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 h-40"></div>
              ))}
            </div>
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
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>إضافة كورس</span>
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800">إدارة الكورسات</h1>
            <p className="text-gray-500 mt-1">إضافة وتعديل وحذف الكورسات</p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-right">{course.title}</h3>
              </div>

              <p className="text-gray-500 text-right mb-4 line-clamp-2">
                {course.description || 'لا يوجد وصف'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link
                  to={`/admin/courses/${course.id}/statistics`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  عرض الإحصائيات ←
                </Link>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>👁 {course.listeners_count || 0} مستمع</span>
                  <span>📚 {course.lectures_count || 0} محاضرة</span>
                </div>
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500">لا يوجد كورسات بعد</p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                أضف أول كورس
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">
                {editingCourse ? 'تعديل الكورس' : 'إضافة كورس جديد'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-right text-gray-700 font-medium mb-2">
                    عنوان الكورس
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل عنوان الكورس"
                    required
                  />
                </div>

                <div>
                  <label className="block text-right text-gray-700 font-medium mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="أدخل وصف الكورس (اختياري)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'جارٍ الحفظ...' : editingCourse ? 'تحديث' : 'إضافة'}
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
