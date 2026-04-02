import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthGuard';

interface ProtectedPageProps {
  children: React.ReactNode;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // If AuthGuard is loading, Layout handles the spinner, and children (which includes this component)
  // are blocked from rendering until loading is complete.
  // However, we must ensure we don't try to redirect before we know the user status.
  if (isLoading) {
    return null; 
  }

  if (!user) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedPage;