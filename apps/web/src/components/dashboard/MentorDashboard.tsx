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
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';

export default function MentorDashboard() {
  const { user } = useAuthStore();
  const { mentors, fetchMentors, mentorSchedules, fetchMentorSchedules } = useLearningStore();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MentorSchedule | null>(null);
  const [scheduleViewMode, setScheduleViewMode] = useState<ViewMode>('list');

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

  // Week schedules (upcoming other schedules)
  const weekSchedules = mentorSchedules.filter(s => !s.start_time.startsWith(todayStr))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Real stats computation
  const teachingHours = mentorSchedules
    .filter(s => s.status === 'done')
    .reduce((sum, s) => {
      const diffMs = new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return sum + (isNaN(diffHours) ? 0 : diffHours);
    }, 0);

  const uniqueStudentsCount = new Set(
    mentorSchedules
      .map(s => s.guest_email)
      .filter(email => !!email)
  ).size;

  const completedSessionsCount = mentorSchedules.filter(s => s.status === 'done').length;

  // Dynamic notifications
  const nextSession = mentorSchedules
    .filter(s => s.status === 'scheduled' && new Date(s.start_time).getTime() > Date.now())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

  const notificationsList: any[] = [];
  if (nextSession) {
    notificationsList.push({
      id: 'next-session',
      title: 'Sesi Mengajar Berikutnya',
      description: `Sesi ${nextSession.subject || ''} dengan ${nextSession.title} di ${nextSession.location || '-'}`,
      time: new Date(nextSession.start_time).toLocaleDateString('id-ID', { weekday: 'long', hour: '2-digit', minute: '2-digit' }),
      color: 'bg-primary'
    });
  }

  const recentSchedules = [...mentorSchedules]
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
    .slice(0, 2);

  recentSchedules.forEach((s, idx) => {
    if (s.id !== nextSession?.id) {
      notificationsList.push({
        id: `recent-${s.id || idx}`,
        title: `Jadwal: ${s.status === 'cancelled' ? 'Dibatalkan' : s.status === 'rescheduled' ? 'Dijadwal Ulang' : 'Aktif'}`,
        description: `Sesi ${s.subject || ''} untuk ${s.title}`,
        time: 'Baru diperbarui',
        color: s.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
      });
    }
  });

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
            Halo, Mentor {user?.name?.split(' ')[0]}! 👨‍🏫
          </h1>
          <p className="text-muted-foreground mt-1">
            Berikut adalah ringkasan aktivitas mengajar Anda hari ini.
          </p>
        </div>
        <div className="flex gap-2">
          <AnimatedButton variant="outline" className="bg-background border-border hover:bg-accent" onClick={openNewSchedule}>
            <Calendar className="mr-2 h-4 w-4" /> Atur Jadwal
          </AnimatedButton>
          <AnimatedButton variant="outline">
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
              <div className="p-2 rounded-full bg-primary/20 text-primary">
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
              <div className="p-2 rounded-full bg-primary/20 text-primary">
                <Clock className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">{teachingHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Total jam sesi selesai</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard gradient className="hover:bg-white/10 transition-colors">
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Siswa Bimbingan</GlassCardTitle>
              <div className="p-2 rounded-full bg-primary/20 text-primary">
                <FileText className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">{uniqueStudentsCount}</div>
              <p className="text-xs text-muted-foreground">Siswa unik terdaftar sesi</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard gradient className="hover:bg-white/10 transition-colors">
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <GlassCardTitle className="text-sm font-medium">Sesi Selesai</GlassCardTitle>
              <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="text-2xl font-bold">{completedSessionsCount}</div>
              <p className="text-xs text-muted-foreground">Sesi mengajar diselesaikan</p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Schedule Area */}
        <motion.div variants={item} className="md:col-span-5">
          <GlassCard className="h-full">
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <GlassCardTitle>Jadwal Mengajar</GlassCardTitle>
                <GlassCardDescription>Sesi mentoring yang akan datang</GlassCardDescription>
              </div>
              <ViewToggle view={scheduleViewMode} onViewChange={setScheduleViewMode} className="scale-90 shrink-0" />
            </GlassCardHeader>
            <GlassCardContent className="pt-4">
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="mb-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1">
                  <TabsTrigger value="today" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Hari Ini</TabsTrigger>
                  <TabsTrigger value="week" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Lainnya ({weekSchedules.length})</TabsTrigger>
                  <TabsTrigger value="requests" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Permintaan Baru</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {todaySchedules.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                      <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p>Tidak ada sesi mengajar hari ini.</p>
                    </div>
                  ) : (
                    <div className={scheduleViewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2" : "space-y-4 pb-2"}>
                      {todaySchedules.map((session, i) => (
                        scheduleViewMode === 'grid' ? (
                          <div key={session.id || i} onClick={() => openEditSchedule(session)} className="cursor-pointer flex flex-col p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative overflow-hidden group h-full">
                            <div className="absolute left-0 right-0 top-0 h-1 transition-transform group-hover:scale-x-110" style={{ backgroundColor: session.color_hex || '#3b82f6' }} />
                            <div className="flex justify-between items-start mb-3 pt-1">
                              <span className="font-bold text-xs bg-background py-1 px-2.5 rounded-lg border text-muted-foreground" style={{ borderColor: `${session.color_hex}40` || '#3b82f640' }}>
                                {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {session.status === 'done' && <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-[10px] h-5 py-0">Selesai</Badge>}
                              {session.status === 'rescheduled' && <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] h-5 py-0">Reschedule</Badge>}
                              {session.status === 'cancelled' && <Badge variant="secondary" className="bg-red-500/20 text-red-400 text-[10px] h-5 py-0">Batal/Tdk Les</Badge>}
                              {session.status === 'scheduled' && <Badge variant="outline" className="text-[10px] h-5 py-0">Scheduled</Badge>}
                            </div>
                            <h4 className="font-semibold text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">{session.subject}</h4>
                            <div className="space-y-2 mt-auto text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{session.title || 'Tanpa Nama'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{session.location || '-'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={session.id || i} onClick={() => openEditSchedule(session)} className="cursor-pointer flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 transition-transform group-hover:scale-y-110" style={{ backgroundColor: session.color_hex || '#3b82f6' }} />
                            <div className="flex gap-4 items-center pl-2">
                              <div className="flex flex-col items-center justify-center h-12 w-16 bg-background rounded-lg text-foreground text-xs font-medium p-1 border" style={{ borderColor: `${session.color_hex}40` || '#3b82f640' }}>
                                <span className="font-bold text-sm">{new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-foreground">{session.subject}</h4>
                                  {session.status === 'done' && <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-[10px] h-5 py-0">Selesai</Badge>}
                                  {session.status === 'rescheduled' && <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] h-5 py-0">Reschedule</Badge>}
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
                        )
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="week" className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {weekSchedules.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                      <p>Tidak ada sesi mengajar lainnya yang dijadwalkan.</p>
                    </div>
                  ) : (
                    <div className={scheduleViewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2" : "space-y-4 pb-2"}>
                      {weekSchedules.map((session, i) => (
                        scheduleViewMode === 'grid' ? (
                          <div key={session.id || i} onClick={() => openEditSchedule(session)} className="cursor-pointer flex flex-col p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative overflow-hidden group h-full">
                            <div className="absolute left-0 right-0 top-0 h-1 transition-transform group-hover:scale-x-110" style={{ backgroundColor: session.color_hex || '#3b82f6' }} />
                            <div className="flex justify-between items-start mb-3 pt-1">
                              <span className="font-bold text-[10px] bg-background py-1 px-2 rounded-lg border text-muted-foreground" style={{ borderColor: `${session.color_hex}40` || '#3b82f640' }}>
                                {new Date(session.start_time).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} • {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {session.status !== 'scheduled' && (
                                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-[10px] h-5 py-0 backdrop-blur-md">
                                  {session.status}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">{session.subject}</h4>
                            <div className="space-y-2 mt-auto text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{session.title || 'Tanpa Nama'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{session.location || '-'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={session.id || i} onClick={() => openEditSchedule(session)} className="cursor-pointer flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 transition-transform group-hover:scale-y-110" style={{ backgroundColor: session.color_hex || '#3b82f6' }} />
                            <div className="flex gap-4 items-center pl-2">
                              <div className="flex flex-col items-center justify-center h-12 w-16 bg-background rounded-lg text-foreground text-xs font-medium p-1 border" style={{ borderColor: `${session.color_hex}40` || '#3b82f640' }}>
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
                        )
                      ))}
                    </div>
                  )}
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
              {notificationsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Tidak ada notifikasi aktivitas baru
                </div>
              ) : (
                notificationsList.map((notif) => (
                  <div key={notif.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className={`h-2 w-2 mt-2 rounded-full shrink-0 ${notif.color}`} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.description}</p>
                      <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                    </div>
                  </div>
                ))
              )}
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
