'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useLearningStore } from '@/store/useLearningStore';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, Video, FileText, CheckCircle2 } from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuthStore();
  // In a real implementation, we would fetch mentor-specific data here
  // const { schedules } = useLearningStore(); 

  const [date, setDate] = useState<Date | undefined>(new Date());

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Halo, Mentor {user?.name?.split(' ')[0]}! 👨‍🏫
          </h1>
          <p className="text-muted-foreground mt-1">
            Berikut adalah ringkasan aktivitas mengajar Anda hari ini.
          </p>
        </div>
        <div className="flex gap-2">
           <AnimatedButton variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
             <Calendar className="mr-2 h-4 w-4" /> Atur Jadwal
           </AnimatedButton>
           <AnimatedButton variant="glass">
             <Video className="mr-2 h-4 w-4" /> Mulai Sesi
           </AnimatedButton>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div variants={item}>
          <GlassCard gradient className="hover:bg-white/10 transition-colors">
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Total Siswa</GlassCardTitle>
              <div className="p-2 rounded-full bg-purple-500/20 text-purple-500">
                <Users className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 bulan ini</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
        
        <motion.div variants={item}>
          <GlassCard gradient className="hover:bg-white/10 transition-colors">
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Jam Mengajar</GlassCardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 text-blue-500">
                <Clock className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">Jam bulan ini</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard gradient className="hover:bg-white/10 transition-colors">
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Review Pending</GlassCardTitle>
              <div className="p-2 rounded-full bg-orange-500/20 text-orange-500">
                <FileText className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Tugas siswa perlu dinilai</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard gradient className="hover:bg-white/10 transition-colors">
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Rating</GlassCardTitle>
              <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">4.9</div>
              <p className="text-xs text-muted-foreground">Dari 5.0</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Schedule Area */}
        <motion.div variants={item} className="md:col-span-5">
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Jadwal Mengajar</GlassCardTitle>
              <GlassCardDescription>Sesi mentoring yang akan datang</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="mb-4 bg-white/5 border border-white/10 backdrop-blur-sm p-1">
                  <TabsTrigger value="today" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Hari Ini</TabsTrigger>
                  <TabsTrigger value="week" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Minggu Ini</TabsTrigger>
                  <TabsTrigger value="requests" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Permintaan Baru</TabsTrigger>
                </TabsList>
                
                <TabsContent value="today" className="space-y-4">
                   {[
                     { time: '09:00 - 10:30', student: 'Ahmad Rizki', topic: 'React Fundamentals', type: 'Private Mentoring' },
                     { time: '13:00 - 14:30', student: 'Group A (5 Siswa)', topic: 'Backend Development with Laravel', type: 'Group Session' },
                   ].map((session, i) => (
                     <div key={i} className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
                        <div className="flex gap-4 items-center">
                           <div className="flex flex-col items-center justify-center h-12 w-16 bg-primary/10 rounded-lg text-primary text-xs font-medium p-1 border border-primary/20">
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
                           <Badge variant="secondary" className="bg-white/10 hover:bg-white/20">{session.type}</Badge>
                           <AnimatedButton size="sm">Join</AnimatedButton>
                        </div>
                     </div>
                   ))}
                </TabsContent>
                
                <TabsContent value="week">
                  <div className="text-center py-10 text-muted-foreground">Menampilkan jadwal minggu ini...</div>
                </TabsContent>
                <TabsContent value="requests">
                  <div className="text-center py-10 text-muted-foreground">Tidak ada permintaan mentoring baru.</div>
                </TabsContent>
              </Tabs>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Sidebar / Notifications */}
        <motion.div variants={item} className="md:col-span-2">
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Notifikasi</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex gap-3 items-start p-3 rounded-lg hover:bg-white/5 transition-colors">
                 <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                 <div className="space-y-1">
                   <p className="text-sm font-medium">Tugas Baru Dikumpulkan</p>
                   <p className="text-xs text-muted-foreground">Siti Aminah mengumpulkan tugas "React Component".</p>
                   <span className="text-[10px] text-muted-foreground">10 menit lalu</span>
                 </div>
              </div>
              <div className="flex gap-3 items-start p-3 rounded-lg hover:bg-white/5 transition-colors">
                 <div className="h-2 w-2 mt-2 rounded-full bg-green-500 shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                 <div className="space-y-1">
                   <p className="text-sm font-medium">Jadwal Dikonfirmasi</p>
                   <p className="text-xs text-muted-foreground">Sesi dengan Budi Santoso besok jam 10:00.</p>
                   <span className="text-[10px] text-muted-foreground">1 jam lalu</span>
                 </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
