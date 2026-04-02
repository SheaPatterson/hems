import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthGuard';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children?: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();
  const location = useLocation();

  if (isAuthLoading || isRoleLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authenticating HQ Access...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    if (location.pathname.startsWith('/admin')) {
        return <Navigate to="/dashboard" replace />;
    }
    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminGuard;