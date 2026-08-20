
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/loaders';
import MentorDashboard from '@/components/dashboard/MentorDashboard';

function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  useEffect(() => {
    if (user?.roles?.some(role => ['superadmin', 'admin', 'manajer_cabang', 'direktur'].includes(role))) {
      router.replace('/admin');
    } else if (user && !user.roles?.some(role => role.startsWith('mentor'))) {
      router.replace('/workspace');
    }
  }, [user, router]);

  // Render content based on role
  const renderDashboardContent = () => {
    if (!user) return null;

    // Check for admin roles first (though useEffect should handle redirect, this prevents flash)
    if (user.roles?.some(role => ['superadmin', 'admin', 'manajer_cabang', 'direktur'].includes(role))) {
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <Spinner className="mb-4 mx-auto" />
            <p>Redirecting to Admin Panel...</p>
          </div>
        </div>
      );
    }

    // Mentor View
    if (user.roles?.some(role => role.startsWith('mentor'))) {
      return <MentorDashboard />;
    }

    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center"><Spinner className="mx-auto mb-4" /><p>Membuka Workspace…</p></div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header with Logout (Only visible if not handled inside sub-dashboards or if we want global logout here) */}
        {/* We can keep a minimal header or rely on TopBar. Since TopBar exists, we don't need a huge header here. */}
        {/* However, the original code had a logout button. Let's keep it consistent or remove it if TopBar handles it. */}
        {/* TopBar DOES handle logout. So we can remove the explicit logout button here for a cleaner look. */}
        
        {renderDashboardContent()}
      </div>
    </ProtectedRoute>
  );
}

export default DashboardPage;
