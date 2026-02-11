'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassCardDescription } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, PlayCircle, Trophy, Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { orders, fetchOrders, isLoading } = useSalesStore();
  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    console.log('[StudentDashboard] Fetching orders...');
    fetchOrders({ status: 'paid' });
    fetchedRef.current = true;
  }, []);  // Empty deps - run only once

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
            Halo, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Siap untuk melanjutkan pembelajaran hari ini?
          </p>
        </div>
        <AnimatedButton asChild className="hidden md:flex shadow-lg shadow-primary/20">
          <Link href="/programs">Jelajahi Program Baru</Link>
        </AnimatedButton>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div variants={item}>
          <GlassCard className="hover:bg-white/10 transition-colors" gradient>
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Program Aktif</GlassCardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 text-blue-500">
                <BookOpen className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">{enrolledPrograms.length}</div>
              <p className="text-xs text-muted-foreground">Kelas yang sedang diikuti</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
        
        <motion.div variants={item}>
          <GlassCard className="hover:bg-white/10 transition-colors" gradient>
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Sertifikat</GlassCardTitle>
              <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-500">
                <Trophy className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Sertifikat berhasil diraih</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="hover:bg-white/10 transition-colors" gradient>
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Jam Belajar</GlassCardTitle>
              <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                <Clock className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">12.5</div>
              <p className="text-xs text-muted-foreground">Total jam belajar bulan ini</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* My Learning Section */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Pembelajaran Saya</h2>
          <AnimatedButton variant="outline" size="sm" asChild className="text-xs">
            <Link href="/learning/my-courses">Lihat Semua</Link>
          </AnimatedButton>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-xl bg-white/5" />
            ))}
          </div>
        ) : enrolledPrograms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledPrograms.map((program, index) => (
              <GlassCard key={index} className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="h-32 w-full bg-linear-to-r from-blue-500/80 to-cyan-500/80 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
                  <BookOpen className="h-12 w-12 text-white/70 relative z-10" />
                </div>
                <GlassCardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="mb-2 bg-white/10 border-white/20 backdrop-blur-sm">Course</Badge>
                    <span className="text-xs text-muted-foreground">{program.lastAccessed}</span>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-1 mb-2">{program.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{program.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${program.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-linear-to-r from-blue-500 to-cyan-500" 
                      />
                    </div>
                  </div>
                  
                  <AnimatedButton className="w-full mt-4" size="sm" asChild variant="glass">
                    <Link href={`/programs/${program.id}`}>
                      <PlayCircle className="mr-2 h-4 w-4" /> Lanjut Belajar
                    </Link>
                  </AnimatedButton>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="border-dashed border-white/20">
            <GlassCardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4 ring-1 ring-primary/20">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Belum ada program aktif</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Anda belum mendaftar di program manapun. Mulai perjalanan belajar Anda hari ini!
              </p>
              <AnimatedButton asChild>
                <Link href="/programs">Cari Program</Link>
              </AnimatedButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </motion.div>

      {/* Upcoming Schedule / Recommended (Placeholder) */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle className="text-lg">Jadwal Mendatang</GlassCardTitle>
              <GlassCardDescription>Sesi mentoring dan ujian Anda</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
               <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 opacity-50" />
                  </div>
                  Tidak ada jadwal dalam waktu dekat
               </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full">
             <GlassCardHeader>
              <GlassCardTitle className="text-lg">Rekomendasi Untuk Anda</GlassCardTitle>
              <GlassCardDescription>Program populer yang mungkin Anda suka</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
               {/* Static Recommendations */}
               <div className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">JS</div>
                  <div className="flex-1">
                     <h4 className="font-medium text-sm">JavaScript Mastery</h4>
                     <p className="text-xs text-muted-foreground">Intermediate • 12 Minggu</p>
                  </div>
                  <AnimatedButton variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <PlayCircle className="h-4 w-4" />
                  </AnimatedButton>
               </div>
               <div className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">R</div>
                  <div className="flex-1">
                     <h4 className="font-medium text-sm">React Frontend Expert</h4>
                     <p className="text-xs text-muted-foreground">Advanced • 16 Minggu</p>
                  </div>
                  <AnimatedButton variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <PlayCircle className="h-4 w-4" />
                  </AnimatedButton>
               </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
