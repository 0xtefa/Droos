import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';

export default function ProtectedRoute() {
  const { isAuthenticated, initialized } = useAuthContext();
  const location = useLocation();

  if (!initialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
