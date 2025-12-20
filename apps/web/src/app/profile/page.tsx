'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Profile Saya</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar_url} alt={user?.name} />
            <AvatarFallback className="text-xl">
              {user?.name ? getInitials(user.name) : <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user?.name || 'Guest User'}</CardTitle>
            <p className="text-muted-foreground">{user?.email || 'guest@example.com'}</p>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              Role: {user?.roles?.join(', ') || 'User'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Informasi Akun</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">ID Pengguna</span>
                  <span className="font-mono">{user?.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email Terverifikasi</span>
                  <span>{user?.email_verified_at ? 'Ya' : 'Belum'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Bergabung Sejak</span>
                  <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
