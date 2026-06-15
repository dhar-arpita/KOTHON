import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Login না করলে এই component-এ ঢুকতে দেবে না
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;

  return children;
};

// Already logged in থাকলে login page-এ যেতে দেবে না
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (user)    return <Navigate to="/" replace />;

  return children;
};
