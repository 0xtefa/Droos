import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { useToast } from '../../components';

export default function AdminCourseStatistics() {
  const { courseId } = useParams();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attended');

  useEffect(() => {
    fetchStatistics();
  }, [courseId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/courses/${courseId}/statistics`);
      setStats(data);
    } catch (e) {
      toast.error('فشل في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/admin" className="hover:text-blue-600">لوحة التحكم</Link>
          <span>/</span>
          <Link to="/admin/courses" className="hover:text-blue-600">الكورسات</Link>
          <span>/</span>
          <span className="text-gray-800">{stats?.course?.title}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-right mb-2">
            إحصائيات: {stats?.course?.title}
          </h1>
          <p className="text-gray-500 text-right">{stats?.course?.description || 'لا يوجد وصف'}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-3xl font-bold text-gray-800">{stats?.total_lectures || 0}</p>
            <p className="text-gray-500">محاضرة</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-3xl font-bold text-gray-800">{stats?.total_students || 0}</p>
            <p className="text-gray-500">طالب إجمالي</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-3xl font-bold text-green-600">{stats?.attended_count || 0}</p>
            <p className="text-gray-500">سمعوا الكورس</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-3xl font-bold text-red-600">{stats?.not_attended_count || 0}</p>
            <p className="text-gray-500">لم يسمعوا</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('attended')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'attended'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              ✅ سمعوا الكورس ({stats?.attended_count || 0})
            </button>
            <button
              onClick={() => setActiveTab('not_attended')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'not_attended'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              ❌ لم يسمعوا ({stats?.not_attended_count || 0})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'attended' && (
              <div className="space-y-4">
                {stats?.attended_students?.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-full bg-gray-200 rounded-full h-2" style={{ width: '100px' }}>
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{student.progress}%</span>
                      <span className="text-sm text-gray-500">
                        {student.attended_lectures}/{student.total_lectures} محاضرة
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                ))}
                {(!stats?.attended_students || stats.attended_students.length === 0) && (
                  <p className="text-center text-gray-500 py-8">لا يوجد طلاب سمعوا هذا الكورس بعد</p>
                )}
              </div>
            )}

            {activeTab === 'not_attended' && (
              <div className="space-y-4">
                {stats?.not_attended_students?.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-red-500 text-sm">لم يبدأ بعد</span>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                ))}
                {(!stats?.not_attended_students || stats.not_attended_students.length === 0) && (
                  <p className="text-center text-gray-500 py-8">جميع الطلاب سمعوا هذا الكورس! 🎉</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
