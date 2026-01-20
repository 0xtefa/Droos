import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, initialized } = useAuthContext();

  // Wait for auth to initialize
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</h1>
          <p className="text-gray-500 mb-6">
            عذراً، هذه الصفحة متاحة فقط للمسؤولين.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            أنت مسجل دخول كـ: <span className="font-medium text-gray-600">{user?.name}</span>
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  return children;
}
