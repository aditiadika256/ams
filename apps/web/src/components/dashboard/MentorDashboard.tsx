'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLearningStore } from '@/store/useLearningStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, Video, FileText, CheckCircle2 } from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuthStore();
  // In a real implementation, we would fetch mentor-specific data here
  // const { schedules } = useLearningStore(); 

  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Halo, Mentor {user?.name?.split(' ')[0]}! 👨‍🏫</h1>
          <p className="text-muted-foreground mt-1">
            Berikut adalah ringkasan aktivitas mengajar Anda hari ini.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
             <Calendar className="mr-2 h-4 w-4" /> Atur Jadwal
           </Button>
           <Button>
             <Video className="mr-2 h-4 w-4" /> Mulai Sesi
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jam Mengajar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Jam bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Tugas siswa perlu dinilai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">Dari 5.0</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Schedule Area */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Jadwal Mengajar</CardTitle>
            <CardDescription>Sesi mentoring yang akan datang</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="today">Hari Ini</TabsTrigger>
                <TabsTrigger value="week">Minggu Ini</TabsTrigger>
                <TabsTrigger value="requests">Permintaan Baru</TabsTrigger>
              </TabsList>
              
              <TabsContent value="today" className="space-y-4">
                 {[
                   { time: '09:00 - 10:30', student: 'Ahmad Rizki', topic: 'React Fundamentals', type: 'Private Mentoring' },
                   { time: '13:00 - 14:30', student: 'Group A (5 Siswa)', topic: 'Backend Development with Laravel', type: 'Group Session' },
                 ].map((session, i) => (
                   <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex gap-4 items-center">
                         <div className="flex flex-col items-center justify-center h-12 w-16 bg-primary/10 rounded text-primary text-xs font-medium p-1">
                            <span className="font-bold text-sm">{session.time.split(' - ')[0]}</span>
                            <span>WIB</span>
                         </div>
                         <div>
                            <h4 className="font-semibold">{session.topic}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                               <Users className="h-3 w-3" /> {session.student}
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Badge variant="secondary">{session.type}</Badge>
                         <Button size="sm">Join</Button>
                      </div>
                   </div>
                 ))}
                 
                 {/* Empty State Mock */}
                 {/* <div className="text-center py-10 text-muted-foreground">Tidak ada jadwal lagi hari ini.</div> */}
              </TabsContent>
              
              <TabsContent value="week">
                <div className="text-center py-10 text-muted-foreground">Menampilkan jadwal minggu ini...</div>
              </TabsContent>
              <TabsContent value="requests">
                <div className="text-center py-10 text-muted-foreground">Tidak ada permintaan mentoring baru.</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Sidebar / Notifications */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-start">
               <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
               <div className="space-y-1">
                 <p className="text-sm font-medium">Tugas Baru Dikumpulkan</p>
                 <p className="text-xs text-muted-foreground">Siti Aminah mengumpulkan tugas "React Component".</p>
                 <span className="text-[10px] text-muted-foreground">10 menit lalu</span>
               </div>
            </div>
            <div className="flex gap-3 items-start">
               <div className="h-2 w-2 mt-2 rounded-full bg-green-500 shrink-0" />
               <div className="space-y-1">
                 <p className="text-sm font-medium">Jadwal Dikonfirmasi</p>
                 <p className="text-xs text-muted-foreground">Sesi dengan Budi Santoso besok jam 10:00.</p>
                 <span className="text-[10px] text-muted-foreground">1 jam lalu</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
