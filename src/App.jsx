import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Quiz from './pages/Quiz';
import './index.css';

function AppLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuthContext();
  const location = useLocation();

  const navItems = [
    { to: '/courses', label: 'الدورات' },
    { to: '/dashboard', label: 'الصفحة الرئيسية' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-sky-200 bg-sky-50 shadow-sm">
        <div className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="h-10 w-10 overflow-hidden rounded-xl bg-white">
            <img
              src="src/images/logo.png"
              alt="Logo"
              className="h-full w-full object-contain scale-125"
            />
          </div>
          <div>
            <div>ليالي الأربعاء</div>
          </div>
        </div>

        {isAuthenticated && (
          <nav className="flex flex-row-reverse flex-wrap items-center gap-2 text-sm text-slate-700">
            <button
              onClick={logout}
              className="rounded-lg bg-sky-600 px-3 py-1 text-white shadow-sm transition-colors hover:bg-sky-700"
            >
              تسجيل الخروج
            </button>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg border px-3 py-1 transition-colors ${location.pathname.startsWith(item.to) ? 'border-sky-200 bg-sky-100 text-sky-800' : 'border-transparent text-slate-700 hover:border-sky-200 hover:bg-white hover:text-slate-900'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="text-xs text-slate-500">
          {isAuthenticated ? `مسجل دخولًا باسم ${user?.email}` : 'غير مسجل الدخول'}
        </div>
      </header>
      {children}
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuthContext();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/quizzes/:quizId" element={<Quiz />} />
        <Route path="/lectures/:lectureId/quiz" element={<Quiz />} />
      </Route>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Router />
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
