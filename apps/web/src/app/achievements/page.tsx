'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Award,
  Medal,
  Star,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Flame,
  Zap,
  BookOpen,
  Target,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  category: 'cbt' | 'streak' | 'mentor' | 'special';
  icon: string;
  color: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
  unlockedAt?: string;
}

const BADGES: BadgeItem[] = [
  {
    id: 'snbt-master',
    title: 'Master SNBT 700+',
    description: 'Mencapai skor rata-rata di atas 700 pada Simulasi UTBK Nasional Arkanin.',
    category: 'cbt',
    icon: '🏆',
    color: 'from-amber-500 to-yellow-400',
    unlocked: true,
    unlockedAt: '12 Sep 2026',
  },
  {
    id: 'math-whiz',
    title: 'Penalaran Matematika 100%',
    description: 'Menyelesaikan subtes Penalaran Matematika tanpa kesalahan.',
    category: 'cbt',
    icon: '⚡',
    color: 'from-blue-500 to-cyan-400',
    unlocked: true,
    unlockedAt: '28 Agu 2026',
  },
  {
    id: 'streak-30',
    title: '30-Day Study Streak',
    description: 'Mengerjakan latihan soal atau modul secara berurutan selama 30 hari berturut-turut.',
    category: 'streak',
    icon: '🔥',
    color: 'from-orange-500 to-rose-500',
    unlocked: true,
    unlockedAt: '05 Okt 2026',
  },
  {
    id: 'speed-demon',
    title: 'Speed Solver',
    description: 'Menyelesaikan 20 soal penalaran umum dalam waktu kurang dari 15 menit.',
    category: 'cbt',
    icon: '⏱️',
    color: 'from-purple-500 to-indigo-500',
    unlocked: false,
    progress: 16,
    total: 20,
  },
  {
    id: 'mentor-choice',
    title: 'Murid Teladan Mentor',
    description: 'Mendapatkan apresiasi bintang 5 dari mentor saat sesi bimbingan 1-on-1.',
    category: 'mentor',
    icon: '⭐',
    color: 'from-emerald-500 to-teal-400',
    unlocked: true,
    unlockedAt: '18 Sep 2026',
  },
  {
    id: 'tryout-veteran',
    title: 'Veteran Tryout Arkanin',
    description: 'Menyelesaikan minimal 10 paket Tryout Akbar Arkanin.',
    category: 'cbt',
    icon: '🎖️',
    color: 'from-pink-500 to-rose-400',
    unlocked: false,
    progress: 7,
    total: 10,
  },
];

const CERTIFICATES = [
  {
    id: 'CERT-ARK-2026-091',
    title: 'Sertifikat Kelulusan Bootcamp SNBT TPS & Literasi',
    program: 'Program Intensif SNBT 2026',
    date: '20 September 2026',
    grade: 'Predikat: Sangat Memuaskan (A)',
    issuer: 'Arkanin Education Center',
  },
  {
    id: 'CERT-CBT-2026-042',
    title: 'Sertifikat Hasil Tryout Akbar Nasional Seri 4',
    program: 'Simulasi Nasional CBT Arkanin',
    date: '15 Agustus 2026',
    grade: 'Peringkat 14 / 2.450 Peserta Nasional',
    issuer: 'Lembaga Asesmen Arkanin',
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Farhan Maulana', branch: 'Cabang Jakarta Selatan', score: 768, xp: '4.850 XP', isMe: false },
  { rank: 2, name: 'Siti Nurhaliza', branch: 'Cabang Bandung Dago', score: 754, xp: '4.620 XP', isMe: false },
  { rank: 3, name: 'Raditya Pratama', branch: 'Cabang Surabaya Gubeng', score: 742, xp: '4.390 XP', isMe: false },
  { rank: 4, name: 'Anda (Siswa)', branch: 'Cabang Jakarta Selatan', score: 728, xp: '3.940 XP', isMe: true },
  { rank: 5, name: 'Aisyah Putri', branch: 'Cabang Yogyakarta UGM', score: 715, xp: '3.810 XP', isMe: false },
];

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates' | 'leaderboard'>('badges');

  const unlockedCount = BADGES.filter((b) => b.unlocked).length;

  return (
    <div className="container min-h-screen max-w-5xl mx-auto px-4 py-6 md:py-10 pb-28 md:pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl size-9 md:hidden">
            <Link href="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="size-6 text-amber-500" />
              Pencapaian & Prestasi
            </h1>
            <p className="text-xs text-muted-foreground">
              Lencana kompetensi, sertifikat resmi, dan peringkat belajar Anda
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild className="rounded-xl text-xs gap-1.5 hidden sm:flex">
          <Link href="/profile">
            <Award className="size-3.5 text-primary" />
            Profil Pengguna
          </Link>
        </Button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="border-border/60 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Lencana Terbuka</span>
              <Medal className="size-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {unlockedCount} <span className="text-xs font-normal text-muted-foreground">/ {BADGES.length}</span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
              {Math.round((unlockedCount / BADGES.length) * 100)}% Terbuka
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Sertifikat</span>
              <Award className="size-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {CERTIFICATES.length}
            </div>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
              Terverifikasi Resmi
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Peringkat Cabang</span>
              <Trophy className="size-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              #4
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              Top 5% Siswa
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Study Streak</span>
              <Flame className="size-4 text-orange-500" />
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              30 <span className="text-xs font-normal text-muted-foreground">Hari</span>
            </div>
            <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 font-semibold">
              Konsistensi Tinggi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-12 p-1 bg-muted/60 rounded-2xl mb-6">
          <TabsTrigger value="badges" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <Medal className="size-3.5 sm:size-4" />
            <span className="truncate">Lencana CBT</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <Award className="size-3.5 sm:size-4" />
            <span className="truncate">Sertifikat</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <Trophy className="size-3.5 sm:size-4" />
            <span className="truncate">Leaderboard</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Lencana & Badge */}
        <TabsContent value="badges" className="outline-none focus:outline-none space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {BADGES.map((badge) => (
              <Card
                key={badge.id}
                className={`border-border/60 transition-all ${
                  badge.unlocked
                    ? 'hover:border-primary/40 hover:shadow-md'
                    : 'opacity-70 bg-muted/20 border-dashed'
                }`}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`size-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-gradient-to-br ${
                          badge.unlocked ? badge.color : 'from-muted to-muted/80'
                        }`}
                      >
                        {badge.icon}
                      </div>
                      {badge.unlocked ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-bold gap-1">
                          <CheckCircle2 className="size-3" /> Terbuka
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/80 gap-1">
                          <Lock className="size-3" /> Terkunci
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-foreground mb-1">{badge.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40">
                    {badge.unlocked ? (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Sparkles className="size-3 text-amber-500" />
                        Dicapai pada {badge.unlockedAt}
                      </span>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Progres</span>
                          <span className="font-bold">{badge.progress} / {badge.total}</span>
                        </div>
                        <Progress
                          value={badge.total ? ((badge.progress || 0) / badge.total) * 100 : 0}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Sertifikat Kelulusan */}
        <TabsContent value="certificates" className="outline-none focus:outline-none space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CERTIFICATES.map((cert) => (
              <Card key={cert.id} className="border-border/60 shadow-sm hover:border-primary/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                      ID: {cert.id}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{cert.date}</span>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-2">
                    {cert.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {cert.program} • {cert.issuer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2.5 bg-muted/40 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{cert.grade}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="default" size="sm" className="flex-1 rounded-xl text-xs gap-1.5 shadow-sm">
                      <Download className="size-3.5" />
                      Unduh PDF
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                      <Share2 className="size-3.5" />
                      Bagikan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Leaderboard */}
        <TabsContent value="leaderboard" className="outline-none focus:outline-none">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Trophy className="size-5 text-amber-500" />
                Papan Peringkat Tryout & Belajar Cabang
              </CardTitle>
              <CardDescription className="text-xs">
                Peringkat mingguan diperbarui otomatis berdasarkan rata-rata skor tryout CBT dan keaktifan modul.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/40">
                {LEADERBOARD.map((item) => (
                  <div
                    key={item.rank}
                    className={`flex items-center justify-between py-3 px-2 rounded-xl transition-colors ${
                      item.isMe ? 'bg-primary/10 border border-primary/30 my-1' : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center font-black text-xs ${
                          item.rank === 1
                            ? 'bg-amber-500 text-white'
                            : item.rank === 2
                            ? 'bg-slate-400 text-white'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {item.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-bold ${item.isMe ? 'text-primary' : 'text-foreground'}`}>
                            {item.name}
                          </span>
                          {item.isMe && (
                            <Badge variant="outline" className="text-[10px] bg-primary/20 text-primary border-primary/30">
                              Anda
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">{item.branch}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-foreground">{item.score} Poin</div>
                      <span className="text-[11px] text-muted-foreground font-mono">{item.xp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
