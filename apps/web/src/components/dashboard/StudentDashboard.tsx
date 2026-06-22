'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLearningStore } from '@/store/useLearningStore';
import api from '@/lib/api';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassCardDescription } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, PlayCircle, Trophy, Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { orders, fetchOrders, isLoading } = useSalesStore();
  const { studentSchedules, fetchStudentSchedules } = useLearningStore();

  const [learningViewMode, setLearningViewMode] = useState<ViewMode>('grid');
  const [recommendationsViewMode, setRecommendationsViewMode] = useState<ViewMode>('list');

  const [progressData, setProgressData] = useState<{
    total_exams_taken: number;
    average_score: number;
    recent_activity: any[];
  } | null>(null);

  const [recommendations, setRecommendations] = useState<{
    reason: string;
    packages: any[];
  } | null>(null);

  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    console.log('[StudentDashboard] Fetching orders, schedules, and analytics...');
    fetchOrders({ status: 'paid' });
    fetchStudentSchedules();

    api.get('/analytics/user/progress')
      .then(res => setProgressData(res.data.data ?? res.data))
      .catch(err => console.error('Failed to fetch user progress:', err));

    api.get('/analytics/recommendations')
      .then(res => setRecommendations(res.data.data ?? res.data))
      .catch(err => console.error('Failed to fetch recommendations:', err));

    fetchedRef.current = true;
  }, [fetchOrders, fetchStudentSchedules]);

  const enrolledPrograms = orders
    .filter(order => order.status === 'paid')
    .flatMap(order => order.items || []) // Assuming items exist, otherwise we need to fetch details
    .map((item: any) => ({
      id: item.program_id,
      name: item.program_name || `Program #${item.program_id}`,
      progress: 0, // Initial real progress
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Halo, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Siap untuk melanjutkan pembelajaran hari ini?
          </p>
        </div>
        <AnimatedButton asChild className="hidden md:flex shadow-sm">
          <Link href="/programs">Jelajahi Program Baru</Link>
        </AnimatedButton>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div variants={item}>
          <GlassCard className="hover:bg-white/10 transition-colors" gradient>
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Program Aktif</GlassCardTitle>
              <div className="p-2 rounded-full bg-primary/20 text-primary">
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
              <GlassCardTitle className="text-sm font-medium">Tryout Diikuti</GlassCardTitle>
              <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-500">
                <Trophy className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">{progressData?.total_exams_taken ?? 0}</div>
              <p className="text-xs text-muted-foreground">Ujian yang telah diselesaikan</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="hover:bg-white/10 transition-colors" gradient>
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Rata-rata Nilai</GlassCardTitle>
              <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                <Clock className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">{progressData?.average_score ?? 0}</div>
              <p className="text-xs text-muted-foreground">Nilai rata-rata seluruh tryout</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* My Learning Section */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Pembelajaran Saya</h2>
          <div className="flex items-center gap-2">
            <ViewToggle view={learningViewMode} onViewChange={setLearningViewMode} className="scale-90" />
            <AnimatedButton variant="outline" size="sm" asChild className="text-xs">
              <Link href="/learning/my-courses">Lihat Semua</Link>
            </AnimatedButton>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-xl bg-white/5" />
            ))}
          </div>
        ) : enrolledPrograms.length > 0 ? (
          <div className={learningViewMode === 'grid' 
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
            : "flex flex-col gap-3"
          }>
            {enrolledPrograms.map((program, index) => (
              learningViewMode === 'grid' ? (
                <GlassCard key={index} className="overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="h-32 w-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                    <BookOpen className="h-12 w-12 text-zinc-500/70 relative z-10" />
                  </div>
                  <GlassCardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="mb-2 bg-secondary border-border">Course</Badge>
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
                          className="h-full bg-primary" 
                        />
                      </div>
                    </div>
                    
                    <AnimatedButton className="w-full mt-4" size="sm" asChild variant="outline">
                      <Link href={`/programs/${program.id}`}>
                        <PlayCircle className="mr-2 h-4 w-4" /> Lanjut Belajar
                      </Link>
                    </AnimatedButton>
                  </GlassCardContent>
                </GlassCard>
              ) : (
                <GlassCard key={index} className="overflow-hidden hover:shadow-sm hover:translate-x-1 transition-all duration-300 border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-16 w-16 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center rounded-xl shrink-0">
                    <BookOpen className="h-6 w-6 text-zinc-500/70" />
                  </div>
                  <div className="flex-1 min-w-0 py-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <Badge variant="outline" className="bg-secondary border-border py-0 text-[10px]">Course</Badge>
                      <span className="text-[10px] text-muted-foreground">Akses terakhir: {program.lastAccessed}</span>
                    </div>
                    <h3 className="font-semibold text-base truncate">{program.name}</h3>
                    <div className="flex items-center gap-3 mt-2 max-w-md mx-auto sm:mx-0">
                      <div className="flex-1 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${program.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-primary" 
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium">{program.progress}%</span>
                    </div>
                  </div>
                  <AnimatedButton size="sm" asChild variant="outline" className="shrink-0 w-full sm:w-auto">
                    <Link href={`/programs/${program.id}`}>
                      <PlayCircle className="mr-2 h-4 w-4" /> Lanjut Belajar
                    </Link>
                  </AnimatedButton>
                </GlassCard>
              )
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
              <GlassCardDescription>Sesi mentoring Anda yang telah dijadwalkan</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              {studentSchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 opacity-50" />
                  </div>
                  Tidak ada jadwal dalam waktu dekat
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {studentSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: schedule.color_hex || '#3b82f6' }} />
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{schedule.subject || 'Sesi Mentoring'}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(schedule.start_time).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })} • {new Date(schedule.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Mentor: {schedule.mentor?.user?.name || 'Unknown'} • Lokasi: {schedule.location || '-'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase">{schedule.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full">
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <GlassCardTitle className="text-lg">Rekomendasi Untuk Anda</GlassCardTitle>
                <GlassCardDescription>{recommendations?.reason || "Program/Tryout populer yang mungkin Anda suka"}</GlassCardDescription>
              </div>
              <ViewToggle view={recommendationsViewMode} onViewChange={setRecommendationsViewMode} className="scale-90 shrink-0" />
            </GlassCardHeader>
            <GlassCardContent className="pt-4">
              {recommendations?.packages && recommendations.packages.length > 0 ? (
                <div className={recommendationsViewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-4" 
                  : "flex flex-col gap-3"
                }>
                  {recommendations.packages.map((pkg: any) => (
                    <Link href={`/exams`} key={pkg.id}>
                      {recommendationsViewMode === 'grid' ? (
                        <div className="flex flex-col h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                           <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold mb-3 group-hover:scale-105 transition-transform shrink-0">
                             {pkg.name ? pkg.name.substring(0, 2).toUpperCase() : 'EX'}
                           </div>
                           <h4 className="font-semibold text-sm text-foreground truncate mb-1 group-hover:text-primary transition-colors">{pkg.name}</h4>
                           <p className="text-xs text-muted-foreground mb-4">{pkg.sections_count || pkg.sections?.length || 0} Bagian • {pkg.duration_minutes || 90} Mins</p>
                           <AnimatedButton variant="outline" size="sm" className="w-full mt-auto">
                             <PlayCircle className="mr-2 h-4 w-4" /> Mulai
                           </AnimatedButton>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                           <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                             {pkg.name ? pkg.name.substring(0, 2).toUpperCase() : 'EX'}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{pkg.name}</h4>
                              <p className="text-xs text-muted-foreground">{pkg.sections_count || pkg.sections?.length || 0} Bagian • Durasi: {pkg.duration_minutes || 90} Menit</p>
                           </div>
                           <AnimatedButton variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full shrink-0">
                             <PlayCircle className="h-4 w-4" />
                           </AnimatedButton>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Tidak ada rekomendasi program saat ini
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
