'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useLearningStore, MentorSchedule } from '@/store/useLearningStore';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, Video, FileText, CheckCircle2, ChevronRight, X, MapPin } from 'lucide-react';
import { ScheduleManagerModal } from './ScheduleManagerModal';

export default function MentorDashboard() {
  const { user } = useAuthStore();
  const { mentors, fetchMentors, mentorSchedules, fetchMentorSchedules } = useLearningStore();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MentorSchedule | null>(null);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // Find the mentor mapping for the current user
  const currentMentor = mentors.find(m => m.user_id === user?.id);

  useEffect(() => {
    if (currentMentor?.id) {
      fetchMentorSchedules(currentMentor.id);
    }
  }, [currentMentor?.id, fetchMentorSchedules]);

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

  const openNewSchedule = () => {
    setSelectedSchedule(null);
    setIsScheduleModalOpen(true);
  };

  const openEditSchedule = (s: MentorSchedule) => {
    setSelectedSchedule(s);
    setIsScheduleModalOpen(true);
  };

  // Filter schedules
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySchedules = mentorSchedules.filter(s => s.start_time.startsWith(todayStr))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Dummy filtering for the week (just returning all for now, in a real app we'd filter by week range)
  const weekSchedules = mentorSchedules.filter(s => !s.start_time.startsWith(todayStr))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

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
          <AnimatedButton variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10" onClick={openNewSchedule}>
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
              <GlassCardTitle className="text-sm font-medium">Total Sesi Bulan Ini</GlassCardTitle>
              <div className="p-2 rounded-full bg-purple-500/20 text-purple-500">
                <Users className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">{mentorSchedules.length}</div>
              <p className="text-xs text-muted-foreground">Sesi Jadwal Aktif</p>
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
              <div className="text-2xl font-bold">~</div>
              <p className="text-xs text-muted-foreground">Jam Total</p>
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
                  <TabsTrigger value="week" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Lainnya ({weekSchedules.length})</TabsTrigger>
                  <TabsTrigger value="requests" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Permintaan Baru</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {todaySchedules.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border border-dashed border-white/20 rounded-xl bg-white/5">
                      <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p>Tidak ada sesi mengajar hari ini.</p>
                    </div>
                  ) : todaySchedules.map((session, i) => (
                    <div key={session.id || i} onClick={() => openEditSchedule(session)} className="cursor-pointer flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-gradient-to-r from-zinc-900/50 to-transparent hover:bg-white/10 transition-colors backdrop-blur-sm relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 transition-transform group-hover:scale-y-110" style={{ backgroundColor: session.color_hex || '#3b82f6' }} />
                      <div className="flex gap-4 items-center pl-2">
                        <div className="flex flex-col items-center justify-center h-12 w-16 bg-white/5 rounded-lg text-foreground text-xs font-medium p-1 border" style={{ borderColor: `${session.color_hex}40` || '#3b82f640' }}>
                          <span className="font-bold text-sm">{new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{session.subject}</h4>
                            {session.status === 'done' && <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-[10px] h-5 py-0">Selesai</Badge>}
                            {session.status === 'rescheduled' && <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 text-[10px] h-5 py-0">Reschedule</Badge>}
                            {session.status === 'cancelled' && <Badge variant="secondary" className="bg-red-500/20 text-red-400 text-[10px] h-5 py-0">Batal/Tdk Les</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Users className="h-3 w-3" /> {session.title || 'Tanpa Nama'} <span className="text-white/20">•</span> <MapPin className="h-3 w-3" /> {session.location || '-'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="week" className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {weekSchedules.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border border-dashed border-white/20 rounded-xl bg-white/5">
                      <p>Tidak ada sesi mengajar lainnya yang dijadwalkan.</p>
                    </div>
                  ) : weekSchedules.map((session, i) => (
                    <div key={session.id || i} onClick={() => openEditSchedule(session)} className="cursor-pointer flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-gradient-to-r from-zinc-900/50 to-transparent hover:bg-white/10 transition-colors backdrop-blur-sm relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 transition-transform group-hover:scale-y-110" style={{ backgroundColor: session.color_hex || '#3b82f6' }} />
                      <div className="flex gap-4 items-center pl-2">
                        <div className="flex flex-col items-center justify-center h-12 w-16 bg-white/5 rounded-lg text-foreground text-xs font-medium p-1 border" style={{ borderColor: `${session.color_hex}40` || '#3b82f640' }}>
                          <span className="font-bold text-[11px] truncate">{new Date(session.start_time).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">{session.subject}</h4>
                            {session.status !== 'scheduled' && (
                              <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-[10px] h-5 py-0 backdrop-blur-md">
                                {session.status}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 truncate">
                            <Users className="h-3 w-3 shrink-0" /> <span className="truncate max-w-[100px] sm:max-w-none">{session.title}</span> <span className="text-white/20 shrink-0">•</span> <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate max-w-[100px] sm:max-w-none">{session.location || '-'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </div>
                  ))}
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

      {currentMentor && (
        <ScheduleManagerModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          mentorId={currentMentor.id}
          existingSchedule={selectedSchedule}
        />
      )}
    </motion.div>
  );
}
