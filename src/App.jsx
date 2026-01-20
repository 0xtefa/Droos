import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';
import ModeratorRoute from './auth/ModeratorRoute';
import { ErrorBoundary, PageErrorBoundary, ToastProvider, PageLoader, PWAUpdateNotification } from './components';
import './index.css';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Voting = lazy(() => import('./pages/Voting'));
const Profile = lazy(() => import('./pages/Profile'));
const LectureDetail = lazy(() => import('./pages/LectureDetail'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminCourseStatistics = lazy(() => import('./pages/admin/AdminCourseStatistics'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));

// Moderator pages
const ModeratorDashboard = lazy(() => import('./pages/moderator/ModeratorDashboard'));

function AppLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuthContext();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/dashboard', label: 'الرئيسية', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { to: '/courses', label: 'الدورات', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { to: '/leaderboard', label: 'لوحة الصدارة', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )},
    { to: '/voting', label: 'التصويت', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
    { to: '/profile', label: 'الملف الشخصي', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  // Admin navigation items
  const adminNavItems = [
    { to: '/admin', label: 'لوحة التحكم', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    )},
    { to: '/admin/courses', label: 'إدارة الكورسات', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )},
    { to: '/admin/users', label: 'إدارة المستخدمين', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { to: '/admin/announcements', label: 'الإعلانات والمواعيد', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    )},
  ];

  // Moderator navigation items
  const moderatorNavItems = [
    { to: '/moderator', label: 'لوحة المتابع', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
  ];

  // Determine which nav items to show based on role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [...navItems, ...adminNavItems];
    }
    if (user?.role === 'moderator') {
      return [...navItems, ...moderatorNavItems];
    }
    return navItems;
  };

  const getRoleBadge = () => {
    if (user?.role === 'admin') return { label: 'مسؤول', color: 'bg-red-100 text-red-700' };
    if (user?.role === 'moderator') return { label: 'متابع', color: 'bg-purple-100 text-purple-700' };
    return { label: 'طالب', color: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div className="min-h-screen bg-gray-100 text-slate-900 flex">
      {/* Mobile Header */}
      {isAuthenticated && (
        <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-blue-600">منصة إجتهد</span>
            <div className="h-8 w-8 overflow-hidden rounded-lg">
              <img src="/images/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
          </div>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      {isAuthenticated && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Right side with dark slate background */}
      {isAuthenticated && (
        <aside className={`fixed right-0 top-0 h-full w-64 bg-slate-800 flex flex-col z-50 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}>
          {/* Logo */}
          <div className="p-4 shrink-0">
            <div className="flex items-center justify-center gap-2">
              <div className="h-9 w-9 overflow-hidden">
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-lg font-bold text-white">منصة إجتهد</div>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto min-h-0">
            {getNavItems().map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  location.pathname === item.to || (item.to !== '/admin' && item.to !== '/moderator' && location.pathname.startsWith(item.to))
                    ? 'bg-white text-slate-800 font-medium'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User info - Bottom */}
          {user && (
            <div className="p-3 shrink-0">
              <div className="flex items-center gap-2 rounded-lg p-2">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={user.role === 'admin' ? '/images/instructor2.png' : user.role === 'moderator' ? '/images/instructor2.png' : '/images/student2.png'}
                      alt={getRoleBadge().label}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="text-right flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{user.name}</div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                    user.role === 'moderator' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {getRoleBadge().label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Logout button */}
          <div className="px-3 pb-4 shrink-0">
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className={`flex-1 ${isAuthenticated ? 'pt-16 md:pt-0 md:mr-64' : ''}`}>
        {/* Header for non-authenticated users */}
        {!isAuthenticated && (
          <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-sky-200 bg-sky-50 shadow-sm">
            <div className="flex items-center gap-3 text-lg font-semibold text-slate-900">
              <div className="h-10 w-10 overflow-hidden rounded-xl bg-white">
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  className="h-full w-full object-contain scale-125"
                />
              </div>
              <div>منصة إجتهد</div>
            </div>
          </header>
        )}
        {children}
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuthContext();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={
          <PageErrorBoundary>
            <Login />
          </PageErrorBoundary>
        } />
        <Route path="/register" element={
          <PageErrorBoundary>
            <Register />
          </PageErrorBoundary>
        } />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={
            <PageErrorBoundary>
              <Dashboard />
            </PageErrorBoundary>
          } />
          <Route path="/courses" element={
            <PageErrorBoundary>
              <Courses />
            </PageErrorBoundary>
          } />
          <Route path="/courses/:courseId" element={
            <PageErrorBoundary>
              <CourseDetail />
            </PageErrorBoundary>
          } />
          <Route path="/lectures/:lectureId" element={
            <PageErrorBoundary>
              <LectureDetail />
            </PageErrorBoundary>
          } />
          <Route path="/quizzes/:quizId" element={
            <PageErrorBoundary>
              <Quiz />
            </PageErrorBoundary>
          } />
          <Route path="/lectures/:lectureId/quiz" element={
            <PageErrorBoundary>
              <Quiz />
            </PageErrorBoundary>
          } />
          <Route path="/leaderboard" element={
            <PageErrorBoundary>
              <Leaderboard />
            </PageErrorBoundary>
          } />
          <Route path="/voting" element={
            <PageErrorBoundary>
              <Voting />
            </PageErrorBoundary>
          } />
          <Route path="/profile" element={
            <PageErrorBoundary>
              <Profile />
            </PageErrorBoundary>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <PageErrorBoundary>
                <AdminDashboard />
              </PageErrorBoundary>
            </AdminRoute>
          } />
          <Route path="/admin/courses" element={
            <AdminRoute>
              <PageErrorBoundary>
                <AdminCourses />
              </PageErrorBoundary>
            </AdminRoute>
          } />
          <Route path="/admin/courses/:courseId/statistics" element={
            <AdminRoute>
              <PageErrorBoundary>
                <AdminCourseStatistics />
              </PageErrorBoundary>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <PageErrorBoundary>
                <AdminUsers />
              </PageErrorBoundary>
            </AdminRoute>
          } />
          <Route path="/admin/announcements" element={
            <AdminRoute>
              <PageErrorBoundary>
                <AdminAnnouncements />
              </PageErrorBoundary>
            </AdminRoute>
          } />

          {/* Moderator Routes */}
          <Route path="/moderator" element={
            <ModeratorRoute>
              <PageErrorBoundary>
                <ModeratorDashboard />
              </PageErrorBoundary>
            </ModeratorRoute>
          } />
        </Route>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppLayout>
              <Router />
            </AppLayout>
            <PWAUpdateNotification />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
