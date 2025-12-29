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
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'Courses' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">D</span>
          <div>
            <div>Droos</div>
            <div className="text-xs font-normal text-slate-400">React + Laravel</div>
          </div>
        </div>

        {isAuthenticated && (
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-1 hover:bg-slate-800 ${location.pathname.startsWith(item.to) ? 'bg-slate-800 text-indigo-200' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:border-indigo-400 hover:text-indigo-100"
            >
              Sign out
            </button>
          </nav>
        )}

        <div className="text-xs text-slate-400">
          {isAuthenticated ? `Signed in as ${user?.email}` : 'Not signed in'}
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
