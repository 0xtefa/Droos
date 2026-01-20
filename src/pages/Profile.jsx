import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuthContext } from '../auth/AuthProvider';
import { useToast } from '../components';

export default function Profile() {
  const { user, setUser } = useAuthContext();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data } = await api.get('/profile/stats');
      setStats(data.stats);
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      toast.error('فشل في تحميل بيانات الملف الشخصي', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صالحة', 'خطأ');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'خطأ');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser({ ...user, avatar: data.avatar });
      toast.success('تم تحديث الصورة بنجاح', 'تم');
    } catch (error) {
      toast.error('فشل في تحديث الصورة', 'خطأ');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('كلمة المرور الجديدة غير متطابقة', 'خطأ');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'خطأ');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/profile/password', passwordData);
      toast.success('تم تغيير كلمة المرور بنجاح', 'تم');
      setShowPasswordForm(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error) {
      const message = error.response?.data?.message || 'فشل في تغيير كلمة المرور';
      toast.error(message, 'خطأ');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl p-8 h-48"></div>
            <div className="bg-white rounded-2xl p-6 h-32"></div>
            <div className="bg-white rounded-2xl p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">الملف الشخصي</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-100 border-4 border-blue-200">
                <img
                  src={user?.avatar || (user?.role === 'instructor' ? '/src/images/instructor2.png' : '/src/images/student2.png')}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </label>
            </div>

            {/* User Info */}
            <div className="text-center md:text-right flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{user?.name}</h2>
              <p className="text-gray-500 mb-2">{user?.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                user?.role === 'instructor'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'instructor' ? 'مدرّب' : 'طالب'}
              </span>
            </div>

            {/* Points Badge */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-center text-white">
              <p className="text-sm opacity-90 mb-1">نقاطي</p>
              <p className="text-3xl font-bold">{stats?.totalPoints || 0}</p>
              <p className="text-xs opacity-75 mt-1">نقطة</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-2xl font-bold text-gray-800">{stats?.enrolledCourses || 0}</p>
            <p className="text-sm text-gray-500">دورات مسجلة</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-2xl font-bold text-gray-800">{stats?.completedLectures || 0}</p>
            <p className="text-sm text-gray-500">محاضرات مكتملة</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-2xl font-bold text-gray-800">{stats?.quizzesTaken || 0}</p>
            <p className="text-sm text-gray-500">اختبارات</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-2xl font-bold text-gray-800">{stats?.attendanceCount || 0}</p>
            <p className="text-sm text-gray-500">حضور</p>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">تقدمي في الدورات</h3>

          {courses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لم تسجل في أي دورة بعد</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      course.progress === 100
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {course.progress === 100 ? 'مكتملة' : `${course.progress}%`}
                    </span>
                    <h4 className="font-semibold text-gray-800">{course.title}</h4>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        course.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{course.completedLectures} / {course.totalLectures} محاضرة</span>
                    <span>باقي {course.totalLectures - course.completedLectures} محاضرات</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showPasswordForm ? 'إلغاء' : 'تغيير'}
            </button>
            <h3 className="text-xl font-bold text-gray-800">تغيير كلمة المرور</h3>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {changingPassword ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
