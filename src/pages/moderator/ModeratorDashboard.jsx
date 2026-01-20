import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../components';

export default function ModeratorDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ title: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/moderator/dashboard');
      setData(data);
    } catch (e) {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const viewStudentAttendance = async (student) => {
    setSelectedStudent(student);
    try {
      const { data } = await api.get(`/moderator/students/${student.id}/attendance`);
      setStudentAttendance(data);
    } catch (e) {
      toast.error('فشل في تحميل سجل الحضور');
    }
  };

  const openNotifyModal = (student) => {
    setSelectedStudent(student);
    setNotifyForm({ title: '', message: '' });
    setShowNotifyModal(true);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      await api.post(`/moderator/students/${selectedStudent.id}/notify`, notifyForm);
      toast.success('تم إرسال الإشعار بنجاح');
      setShowNotifyModal(false);
    } catch (e) {
      toast.error('فشل في إرسال الإشعار');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    return new Date(dateString).toLocaleDateString('ar-EG', {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
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
          <h1 className="text-3xl font-bold text-gray-800 text-right">لوحة تحكم المتابع</h1>
          <p className="text-gray-500 text-right mt-2">متابعة الطلاب المعينين لك</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">الطلاب المعينين لك</p>
                <p className="text-3xl font-bold text-gray-800">{data?.assigned_students_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="text-4xl">✅</div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">إجمالي الحضور</p>
                <p className="text-3xl font-bold text-gray-800">{data?.total_attendance || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 text-right">الطلاب المعينين لك</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.students?.map((student) => (
              <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openNotifyModal(student)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      📩 إرسال إشعار
                    </button>
                    <button
                      onClick={() => viewStudentAttendance(student)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      📋 سجل الحضور
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>✅ {student.attendances_count || 0} حضور</span>
                      <span>📝 {student.submissions_count || 0} اختبار</span>
                      {student.last_attendance && (
                        <span>آخر حضور: {formatDate(student.last_attendance)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(!data?.students || data.students.length === 0) && (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-500">لم يتم تعيين طلاب لك بعد</p>
                <p className="text-sm text-gray-400 mt-2">سيقوم المسؤول بتعيين الطلاب لك</p>
              </div>
            )}
          </div>
        </div>

        {/* Student Attendance Modal */}
        {selectedStudent && studentAttendance && !showNotifyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentAttendance(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  سجل حضور: {selectedStudent.name}
                </h2>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-center text-gray-600">
                  إجمالي الحضور: <span className="font-bold text-gray-800">{studentAttendance.total_attendance}</span> محاضرة
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {studentAttendance.attendances?.map((attendance) => (
                  <div key={attendance.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDate(attendance.created_at)}
                      </span>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">
                          {attendance.lecture?.title || 'محاضرة'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {attendance.lecture?.course?.title || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {(!studentAttendance.attendances || studentAttendance.attendances.length === 0) && (
                  <p className="text-center text-gray-500 py-8">لا يوجد سجل حضور</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Send Notification Modal */}
        {showNotifyModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">
                إرسال إشعار لـ {selectedStudent.name}
              </h2>

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-right text-gray-700 font-medium mb-2">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={notifyForm.title}
                    onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="عنوان الإشعار"
                    required
                  />
                </div>

                <div>
                  <label className="block text-right text-gray-700 font-medium mb-2">
                    الرسالة
                  </label>
                  <textarea
                    value={notifyForm.message}
                    onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="نص الرسالة..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNotifyModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {sending ? 'جارٍ الإرسال...' : 'إرسال'}
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
