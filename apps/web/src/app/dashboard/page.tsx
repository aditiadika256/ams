
'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/loaders';

function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <ProtectedRoute>
      <div className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Button onClick={handleLogout} variant="destructive" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" variant="white" className="mr-2" /> : 'Logout'}
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengguna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-medium">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Roles</span>
                <span className="font-medium">{user?.roles?.join(', ') || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permissions</span>
                <span className="font-medium">{user?.permissions?.join(', ') || '-'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selamat Datang!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Anda telah berhasil masuk ke Arkanin - Edutech Platform. Fitur-fitur lainnya akan segera ditambahkan di sini.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DashboardPage;
