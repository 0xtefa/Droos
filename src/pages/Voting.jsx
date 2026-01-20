import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../components';

export default function Voting() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votes, setVotes] = useState(null);
  const [myVotes, setMyVotes] = useState({ schedule: null, attendance: null });

  // Schedule options
  const scheduleOptions = [
    { id: 'thursday_4', label: 'الخميس الساعة 4', icon: '📅' },
    { id: 'wednesday_6', label: 'الأربعاء الساعة 6', icon: '📅' },
    { id: 'online', label: 'أونلاين', icon: '💻' },
  ];

  // Attendance options
  const attendanceOptions = [
    { id: 'yes', label: 'نعم، سأحضر', icon: '✅' },
    { id: 'no', label: 'لا، لن أحضر', icon: '❌' },
  ];

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const { data } = await api.get('/votes');
      setVotes(data.totals);
      setMyVotes(data.myVotes || { schedule: null, attendance: null });
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type, value) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const { data } = await api.post('/votes', { type, value });
      setVotes(data.totals);
      setMyVotes(data.myVotes);
      toast.success('تم تسجيل تصويتك بنجاح!', 'تم التصويت');
    } catch (error) {
      toast.error('حدث خطأ أثناء التصويت', 'خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const getPercentage = (type, optionId) => {
    if (!votes || !votes[type]) return 0;
    const total = Object.values(votes[type]).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    return Math.round((votes[type][optionId] || 0) / total * 100);
  };

  const getVoteCount = (type, optionId) => {
    if (!votes || !votes[type]) return 0;
    return votes[type][optionId] || 0;
  };

  const getTotalVotes = (type) => {
    if (!votes || !votes[type]) return 0;
    return Object.values(votes[type]).reduce((sum, count) => sum + count, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-48 mx-auto"></div>
            <div className="bg-white rounded-2xl p-6 h-64"></div>
            <div className="bg-white rounded-2xl p-6 h-48"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">التصويت</h1>
          <p className="text-gray-600">شارك برأيك في تحديد موعد المحاضرة القادمة</p>
        </div>

        {/* Schedule Vote */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🗓️</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">موعد المحاضرة القادمة</h2>
              <p className="text-gray-600 text-sm">اختر الموعد المناسب لك</p>
            </div>
          </div>

          <div className="space-y-3">
            {scheduleOptions.map((option) => {
              const isSelected = myVotes.schedule === option.id;
              const percentage = getPercentage('schedule', option.id);
              const count = getVoteCount('schedule', option.id);

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote('schedule', option.id)}
                  disabled={submitting}
                  className={`w-full relative overflow-hidden rounded-xl border-2 p-4 text-right transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Progress bar background */}
                  <div
                    className={`absolute inset-y-0 right-0 transition-all duration-500 ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />

                  {/* Content */}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          اختيارك
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">{count} صوت</span>
                      <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center text-gray-500 text-sm">
            إجمالي الأصوات: {getTotalVotes('schedule')}
          </div>
        </div>

        {/* Attendance Vote */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🙋</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">هل ستحضر المحاضرة القادمة؟</h2>
              <p className="text-gray-600 text-sm">ساعدنا في تحديد عدد الحضور المتوقع</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {attendanceOptions.map((option) => {
              const isSelected = myVotes.attendance === option.id;
              const percentage = getPercentage('attendance', option.id);
              const count = getVoteCount('attendance', option.id);

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote('attendance', option.id)}
                  disabled={submitting}
                  className={`relative overflow-hidden rounded-xl border-2 p-6 text-center transition-all ${
                    isSelected
                      ? option.id === 'yes'
                        ? 'border-green-600 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="relative">
                    <span className="text-4xl block mb-3">{option.icon}</span>
                    <span className={`font-bold text-lg block mb-2 ${
                      isSelected
                        ? option.id === 'yes' ? 'text-green-700' : 'text-red-600'
                        : 'text-gray-800'
                    }`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        option.id === 'yes'
                          ? 'bg-green-600 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        اختيارك
                      </span>
                    )}
                    <div className="mt-3 text-gray-500 text-sm">
                      {count} صوت ({percentage}%)
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center text-gray-500 text-sm">
            إجمالي الأصوات: {getTotalVotes('attendance')}
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-blue-700 text-sm">
            💡 يمكنك تغيير تصويتك في أي وقت قبل انتهاء فترة التصويت
          </p>
        </div>
      </div>
    </div>
  );
}
