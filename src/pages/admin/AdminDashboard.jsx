import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useToast } from '../../components';

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/dashboard');
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 h-32"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-right">لوحة تحكم المسؤول</h1>
          <p className="text-gray-500 text-right mt-2">مرحباً بك في لوحة التحكم</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.users?.total || 0}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-right">
              <span className="text-green-500">+{stats?.users?.new_this_week || 0}</span> هذا الأسبوع
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="text-4xl">🎓</div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">الطلاب</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.users?.students || 0}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-right">
              {stats?.users?.moderators || 0} متابع
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="text-4xl">📚</div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">الكورسات</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.courses?.total || 0}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-right">
              {stats?.courses?.total_lectures || 0} محاضرة
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div className="text-4xl">✅</div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">الحضور</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.attendance?.total || 0}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-right">
              <span className="text-green-500">{stats?.attendance?.today || 0}</span> اليوم
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/courses"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📚
            </div>
            <div className="text-right flex-1">
              <h3 className="font-bold text-gray-800">إدارة الكورسات</h3>
              <p className="text-gray-500 text-sm">إضافة وحذف الكورسات</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              👥
            </div>
            <div className="text-right flex-1">
              <h3 className="font-bold text-gray-800">إدارة المستخدمين</h3>
              <p className="text-gray-500 text-sm">ترقية المتابعين</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/admin/announcements"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              📢
            </div>
            <div className="text-right flex-1">
              <h3 className="font-bold text-gray-800">الإعلانات والمواعيد</h3>
              <p className="text-gray-500 text-sm">تحديد مواعيد المحاضرات</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-right">آخر الطلاب المسجلين</h2>
          <div className="space-y-4">
            {stats?.recent_students?.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">
                  {new Date(student.created_at).toLocaleDateString('ar-EG')}
                </span>
                <div className="text-right">
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
              </div>
            ))}
            {(!stats?.recent_students || stats.recent_students.length === 0) && (
              <p className="text-center text-gray-500 py-4">لا يوجد طلاب مسجلين حديثاً</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
