import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './index.css';

function AppLayout({ children }) {
  const { isAuthenticated, user } = useAuthContext();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">D</span>
          <div>
            <div>Droos</div>
            <div className="text-xs font-normal text-slate-400">React + Laravel</div>
          </div>
        </div>
        <div className="text-sm text-slate-300">
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
