'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, PlayCircle, Trophy, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { orders, fetchOrders, isLoading } = useSalesStore();

  useEffect(() => {
    fetchOrders({ status: 'paid' });
  }, [fetchOrders]);

  // Mocking "Enrolled Programs" from paid orders
  // In a real app, we might have a dedicated endpoint for user enrollments
  const enrolledPrograms = orders
    .filter(order => order.status === 'paid')
    .flatMap(order => order.items || []) // Assuming items exist, otherwise we need to fetch details
    .map((item: any) => ({
      id: item.program_id,
      name: item.program_name || `Program #${item.program_id}`,
      progress: Math.floor(Math.random() * 100), // Mock progress
      lastAccessed: new Date().toLocaleDateString('id-ID'),
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Halo, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Siap untuk melanjutkan pembelajaran hari ini?
          </p>
        </div>
        <Button asChild className="hidden md:flex">
          <Link href="/programs">Jelajahi Program Baru</Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Program Aktif</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledPrograms.length}</div>
            <p className="text-xs text-muted-foreground">Kelas yang sedang diikuti</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sertifikat</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Sertifikat berhasil diraih</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jam Belajar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5</div>
            <p className="text-xs text-muted-foreground">Total jam belajar bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* My Learning Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Pembelajaran Saya</h2>
          <Button variant="link" asChild>
            <Link href="/learning/my-courses">Lihat Semua</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
            ))}
          </div>
        ) : enrolledPrograms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledPrograms.map((program, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-0">
                  <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/50" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="mb-2">Course</Badge>
                    <span className="text-xs text-muted-foreground">{program.lastAccessed}</span>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-1 mb-2">{program.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{program.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${program.progress}%` }} 
                      />
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" size="sm" asChild>
                    <Link href={`/programs/${program.id}`}>
                      <PlayCircle className="mr-2 h-4 w-4" /> Lanjut Belajar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Belum ada program aktif</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Anda belum mendaftar di program manapun. Mulai perjalanan belajar Anda hari ini!
              </p>
              <Button asChild>
                <Link href="/programs">Cari Program</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Schedule / Recommended (Placeholder) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jadwal Mendatang</CardTitle>
            <CardDescription>Sesi mentoring dan ujian Anda</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-center py-8 text-muted-foreground text-sm">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Tidak ada jadwal dalam waktu dekat
             </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
            <CardTitle className="text-lg">Rekomendasi Untuk Anda</CardTitle>
            <CardDescription>Program populer yang mungkin Anda suka</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* Static Recommendations */}
             <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded bg-orange-100 flex items-center justify-center text-orange-600 font-bold">JS</div>
                <div className="flex-1">
                   <h4 className="font-medium text-sm">JavaScript Mastery</h4>
                   <p className="text-xs text-muted-foreground">Intermediate • 12 Minggu</p>
                </div>
                <Button variant="ghost" size="sm">Lihat</Button>
             </div>
             <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold">R</div>
                <div className="flex-1">
                   <h4 className="font-medium text-sm">React Frontend Expert</h4>
                   <p className="text-xs text-muted-foreground">Advanced • 16 Minggu</p>
                </div>
                <Button variant="ghost" size="sm">Lihat</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
