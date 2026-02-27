
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign-in; Clerk will handle the sign-in UI
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
