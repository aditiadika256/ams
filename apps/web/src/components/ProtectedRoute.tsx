'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

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

  useEffect(() => {
    // If we have token but no user data, fetch user
    if (token && !isAuthenticated && !isLoading) {
      fetchUser();
    }

    // If not authenticated and not loading, redirect to login
    if (!isLoading && !token && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check permissions if authenticated
    if (isAuthenticated && !isLoading) {
      if (permissions && !hasPermission(permissions)) {
        router.push('/dashboard?error=unauthorized'); // Redirect to dashboard or a 403 page
        return;
      }

      if (roles && !hasRole(roles)) {
        router.push('/dashboard?error=unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, token, router, redirectTo, fetchUser, permissions, roles, hasPermission, hasRole]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

