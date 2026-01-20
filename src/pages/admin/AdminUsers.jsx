import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../components';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedModerator, setSelectedModerator] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.role = filter;
      if (search) params.search = search;

      const { data } = await api.get('/admin/users', { params });
      setUsers(data);
    } catch (e) {
      toast.error('فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/users/statistics');
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [filter, search]);

  const handlePromote = async (user) => {
    if (!confirm(`هل تريد ترقية "${user.name}" إلى متابع؟`)) return;

    try {
      await api.post(`/admin/users/${user.id}/promote`);
      toast.success('تم ترقية المستخدم إلى متابع بنجاح');
      fetchUsers();
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل في ترقية المستخدم');
    }
  };

  const handleDemote = async (user) => {
    if (!confirm(`هل تريد تخفيض "${user.name}" إلى طالب؟`)) return;

    try {
      await api.post(`/admin/users/${user.id}/demote`);
      toast.success('تم تخفيض المستخدم إلى طالب بنجاح');
      fetchUsers();
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل في تخفيض المستخدم');
    }
  };

  const openAssignModal = async (moderator) => {
    setSelectedModerator(moderator);
    try {
      const { data: assigned } = await api.get(`/admin/users/${moderator.id}/assigned-students`);
      setAssignedStudents(assigned);
      setSelectedStudentIds(assigned.map(s => s.id));
    } catch (e) {
      setAssignedStudents([]);
      setSelectedStudentIds([]);
    }
    setShowAssignModal(true);
  };

  const handleAssignStudents = async () => {
    try {
      await api.post(`/admin/users/${selectedModerator.id}/assign-students`, {
        student_ids: selectedStudentIds,
      });
      toast.success('تم تعيين الطلاب بنجاح');
      setShowAssignModal(false);
    } catch (e) {
      toast.error('فشل في تعيين الطلاب');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const students = users.filter(u => u.role === 'student');

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">مسؤول</span>;
      case 'moderator':
        return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">متابع</span>;
      default:
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">طالب</span>;
    }
  };

  if (loading && users.length === 0) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-right">إدارة المستخدمين</h1>
          <p className="text-gray-500 text-right mt-1">ترقية المتابعين وتعيين الطلاب</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.total_users}</p>
              <p className="text-gray-500 text-sm">إجمالي المستخدمين</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.students_count}</p>
              <p className="text-gray-500 text-sm">طالب</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.moderators_count}</p>
              <p className="text-gray-500 text-sm">متابع</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-red-600">{stats.admins_count}</p>
              <p className="text-gray-500 text-sm">مسؤول</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الإيميل..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأدوار</option>
              <option value="student">الطلاب</option>
              <option value="moderator">المتابعين</option>
              <option value="admin">المسؤولين</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الإجراءات</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الإحصائيات</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الدور</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">المستخدم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.role === 'student' && (
                          <button
                            onClick={() => handlePromote(user)}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                          >
                            ترقية لمتابع
                          </button>
                        )}
                        {user.role === 'moderator' && (
                          <>
                            <button
                              onClick={() => openAssignModal(user)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                            >
                              تعيين طلاب
                            </button>
                            <button
                              onClick={() => handleDemote(user)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              تخفيض
                            </button>
                          </>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>✅ {user.attendances_count || 0} حضور</span>
                        <span>📝 {user.submissions_count || 0} اختبار</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا يوجد مستخدمين</p>
            </div>
          )}
        </div>

        {/* Assign Students Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">
                تعيين طلاب لـ {selectedModerator?.name}
              </h2>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {students.map((student) => (
                  <label
                    key={student.id}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${
                      selectedStudentIds.includes(student.id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </label>
                ))}
                {students.length === 0 && (
                  <p className="text-center text-gray-500 py-4">لا يوجد طلاب</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAssignStudents}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  حفظ ({selectedStudentIds.length} طالب)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
