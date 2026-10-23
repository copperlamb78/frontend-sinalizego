import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/features/auth';
import { Skeleton } from '@/design-system';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function getDefaultRouteForRole(role?: UserRole): string {
  if (
    role === 'COMPANY_OWNER' ||
    role === 'PROVIDER' ||
    role === 'EMPLOYEE' ||
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN'
  ) {
    return '/painel';
  }
  return '/barbearias';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-3">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const enteredUnauthenticated = useRef<boolean>(!isAuthenticated);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && enteredUnauthenticated.current) {
      const timer = window.setTimeout(() => {
        navigate(getDefaultRouteForRole(user.role), { replace: true });
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-3">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isAuthenticated && user && !enteredUnauthenticated.current) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
