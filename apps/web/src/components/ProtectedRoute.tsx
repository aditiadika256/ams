'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

import { PageLoader } from '@/components/ui/loaders';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  permissions?: string | string[];
  roles?: string | string[];
}

export default function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
  permissions,
  roles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchUser, token, hasPermission, hasRole } = useAuthStore();
  const checkCompleted = useRef(false);

  useEffect(() => {
    // If already checked, don't check again
    if (checkCompleted.current) return;

    // If we have token but no user data, fetch user
    if (token && !isAuthenticated && !isLoading) {
      console.log('[ProtectedRoute] Fetching user data...');
      // Mark as completed immediately to prevent repeated fetchUser calls
      checkCompleted.current = true;
      fetchUser();
      return;
    }

    // If not authenticated and not loading, redirect to login
    if (!isLoading && !token && !isAuthenticated) {
      console.log('[ProtectedRoute] Not authenticated, redirecting to login');
      router.push(redirectTo);
      checkCompleted.current = true;
      return;
    }

    // Check permissions if authenticated
    if (isAuthenticated && !isLoading) {
      if (permissions && !hasPermission(permissions)) {
        console.log('[ProtectedRoute] Missing permissions, redirecting');
        router.push('/dashboard?error=unauthorized');
        checkCompleted.current = true;
        return;
      }

      if (roles && !hasRole(roles)) {
        console.log('[ProtectedRoute] Missing roles, redirecting');
        router.push('/dashboard?error=unauthorized');
        checkCompleted.current = true;
        return;
      }

      checkCompleted.current = true;
    }
  }, [isAuthenticated, isLoading, token]);  // Only these deps that are state values

  // Show loading state
  if (isLoading) {
    return <PageLoader />;
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

