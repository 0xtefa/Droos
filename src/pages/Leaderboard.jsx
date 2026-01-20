import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuthContext } from '../auth/AuthProvider';

// Avatar images for students
const avatars = [
  '/src/images/avatars/avatar1.png',
  '/src/images/avatars/avatar2.png',
  '/src/images/avatars/avatar3.png',
  '/src/images/avatars/avatar4.png',
  '/src/images/avatars/avatar5.png',
  '/src/images/avatars/avatar6.png',
  '/src/images/avatars/avatar7.png',
  '/src/images/avatars/avatar8.png',
];

// Badge components
const Badge = ({ type }) => {
  const badges = {
    gold: '🏆',
    book: '📖',
    bulb: '💡',
    star: '⭐',
    medal: '🥇',
  };
  return <span className="text-xl">{badges[type] || '🎯'}</span>;
};

export default function Leaderboard() {
  const { token, initialized } = useAuthContext();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialized) return;
    if (!token) {
      setError('يجب تسجيل الدخول لعرض لوحة المتصدرين');
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/leaderboard');
        if (mounted) {
          setStudents(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (mounted) {
          setError('تعذر تحميل لوحة المتصدرين');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [initialized, token]);

  // Get top 3 for podium
  const top3 = students.slice(0, 3);
  const rest = students.slice(3);

  // Generate badges based on points
  const getBadges = (points, rank) => {
    const badges = [];
    if (rank <= 3) badges.push('gold');
    if (points >= 1000) badges.push('book');
    if (points >= 500) badges.push('bulb');
    return badges;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-right">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">لوحة المتصدرين</h1>

        {/* Podium Section */}
        {top3.length >= 3 && (
          <div className="relative mb-8 pt-12">
            {/* Winners Row */}
            <div className="flex justify-center items-end">

              {/* 3rd Place - Left */}
              <div className="flex flex-col items-center w-32">
                <div className="relative mb-2">
                  <div className="w-20 h-20 rounded-full border-4 border-amber-500 bg-white overflow-hidden shadow-lg">
                    <img
                      src={avatars[2] || '/src/images/student2.png'}
                      alt={top3[2]?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = '/src/images/student2.png'}
                    />
                  </div>
                  {/* Bronze medal */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xl">🥉</div>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{top3[2]?.name}</h3>
                <p className="text-blue-500 font-semibold text-sm">{top3[2]?.points} نقطة</p>
                {/* 3rd place block */}
                <div className="w-28 h-24 bg-gradient-to-b from-indigo-400 to-indigo-500 rounded-t-lg mt-3"></div>
              </div>

              {/* 1st Place - Center */}
              <div className="flex flex-col items-center w-36 -mt-8 mx-1">
                <div className="relative mb-2">
                  {/* Crown */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl">👑</div>
                  <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white overflow-hidden shadow-xl ring-4 ring-yellow-200">
                    <img
                      src={avatars[0] || '/src/images/student2.png'}
                      alt={top3[0]?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = '/src/images/student2.png'}
                    />
                  </div>
                  {/* Gold medal */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xl">🥇</div>
                </div>
                <h3 className="font-bold text-gray-800">{top3[0]?.name}</h3>
                <p className="text-blue-500 font-bold">{top3[0]?.points} نقطة</p>
                {/* 1st place block */}
                <div className="w-32 h-36 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-t-lg mt-3"></div>
              </div>

              {/* 2nd Place - Right */}
              <div className="flex flex-col items-center w-32">
                <div className="relative mb-2">
                  <div className="w-20 h-20 rounded-full border-4 border-gray-300 bg-white overflow-hidden shadow-lg">
                    <img
                      src={avatars[1] || '/src/images/student2.png'}
                      alt={top3[1]?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = '/src/images/student2.png'}
                    />
                  </div>
                  {/* Silver medal */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xl">🥈</div>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{top3[1]?.name}</h3>
                <p className="text-blue-500 font-semibold text-sm">{top3[1]?.points} نقطة</p>
                {/* 2nd place block */}
                <div className="w-28 h-28 bg-gradient-to-b from-indigo-400 to-indigo-500 rounded-t-lg mt-3"></div>
              </div>

            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-right text-gray-600 font-semibold">الترتيب</th>
                <th className="py-4 px-6 text-right text-gray-600 font-semibold">الطالب</th>
                <th className="py-4 px-6 text-center text-gray-600 font-semibold">النقاط</th>
                <th className="py-4 px-6 text-center text-gray-600 font-semibold">الشارات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr
                  key={student.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    index < 3 ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="py-4 px-6 text-right">
                    <span className={`font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-600' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 justify-end">
                      <span className="font-medium text-gray-800">{student.name}</span>
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img
                          src={avatars[index % avatars.length] || '/src/images/student2.png'}
                          alt={student.name}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = '/src/images/student2.png'}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-blue-600 font-semibold">{student.points} نقطة</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-1">
                      {getBadges(student.points, index + 1).map((badge, i) => (
                        <Badge key={i} type={badge} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {students.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              لا توجد بيانات للعرض
            </div>
          )}
        </div>

        {/* Points Info */}
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 text-right">كيف تحسب النقاط؟</h3>
          <div className="space-y-2 text-right text-sm text-gray-600">
            <p>• حضور المحاضرة: <span className="text-blue-600 font-semibold">100 نقطة</span></p>
            <p>• الإجابة الصحيحة في الاختبار: <span className="text-blue-600 font-semibold">50 نقطة</span></p>
            <p>• إكمال دورة كاملة: <span className="text-blue-600 font-semibold">500 نقطة</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
