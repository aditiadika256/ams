'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Coins, Trophy, Sparkles, ArrowUpRight, ArrowDownLeft, 
  ShoppingBag, CheckCircle2, Award, Calendar, BookOpen, 
  RefreshCw, TrendingUp, Users, ShieldAlert 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

interface PointTransaction {
  id: number;
  type: 'earn' | 'spend' | 'expire';
  amount: number;
  balance_after: number;
  source_type: string | null;
  description: string;
  created_at: string;
}

interface LeaderboardUser {
  user_id: number;
  name: string;
  avatar_url?: string | null;
  total_earned: number;
  balance: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export default function PointsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [balance, setBalance] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const meRes = await apiClient.points.me();
        setBalance(meRes.data.balance);
        setTotalEarned(meRes.data.total_earned);
        setTotalSpent(meRes.data.total_spent);
        const txItems = meRes.data.transactions?.data || meRes.data.transactions || [];
        setTransactions(Array.isArray(txItems) ? txItems : []);
      }

      const leadRes = await apiClient.points.leaderboard();
      setLeaderboard(Array.isArray(leadRes.data) ? leadRes.data : []);
    } catch (err) {
      console.error('Failed to load points data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  if (authLoading || (loading && transactions.length === 0 && leaderboard.length === 0)) {
    return (
      <div className="py-24">
        <PageLoader text="Memuat data gamifikasi & poin..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-zinc-900 to-indigo-950 p-8 text-white shadow-2xl md:p-12">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="size-3.5" /> Gamifikasi & Reward Arkanin
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Pusat Poin & Prestasi Belajar
            </h1>
            <p className="text-sm text-zinc-300 sm:text-base leading-relaxed">
              Kumpulkan poin prestasi dari ketekunan Anda belajar. Lulus TryOut CBT, hadir tepat waktu di sesi kelas, dan belanja program bimbingan untuk raih reward nyata di Store!
            </p>
          </div>

          {/* User Stat Cards */}
          {isAuthenticated ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:w-[480px]">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="text-xs text-zinc-400">Saldo Poin Aktif</span>
                <p className="mt-1 flex items-center gap-1.5 text-2xl font-black text-amber-400">
                  <Coins className="size-5" />
                  {balance.toLocaleString('id-ID')}
                </p>
                <span className="text-[11px] text-zinc-400">Siap ditukarkan</span>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="text-xs text-zinc-400">Total Diperoleh</span>
                <p className="mt-1 flex items-center gap-1 text-2xl font-black text-emerald-400">
                  <TrendingUp className="size-5" />
                  {totalEarned.toLocaleString('id-ID')}
                </p>
                <span className="text-[11px] text-zinc-400">Sepanjang masa</span>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="text-xs text-zinc-400">Telah Dibelanjakan</span>
                <p className="mt-1 flex items-center gap-1 text-2xl font-black text-indigo-400">
                  <ShoppingBag className="size-5" />
                  {totalSpent.toLocaleString('id-ID')}
                </p>
                <span className="text-[11px] text-zinc-400">Di Reward Store</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <p className="text-sm font-semibold">Ingin tahu saldo poin dan peringkat Anda?</p>
              <Button asChild className="rounded-xl bg-amber-500 font-bold text-zinc-950 hover:bg-amber-400">
                <Link href="/auth/login?redirect=/points">Masuk ke Akun Anda</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick action footer */}
        {isAuthenticated && (
          <div className="relative z-10 mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
            <Button asChild className="rounded-xl bg-amber-500 font-bold text-zinc-950 hover:bg-amber-400 shadow-md">
              <Link href="/store">
                <ShoppingBag className="mr-2 size-4" /> Belanja di Reward Store &rarr;
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link href="/store/orders">
                Riwayat Pesanan Merchandise
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Point Earning Rules Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <CardHeader className="p-5 pb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-2">
              <Award className="size-5" />
            </div>
            <CardTitle className="text-base font-bold">Kelulusan CBT TryOut</CardTitle>
            <CardDescription className="text-xs">
              Mencapai passing grade (skor &ge; 60) pada simulasi CBT.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold">
              +50 Poin / Ujian
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <CardHeader className="p-5 pb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 mb-2">
              <Calendar className="size-5" />
            </div>
            <CardTitle className="text-base font-bold">Presensi Hadir Kelas</CardTitle>
            <CardDescription className="text-xs">
              Hadir tepat waktu dan diverifikasi oleh mentor pengajar sesi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <Badge className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold">
              +10 Poin / Sesi
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <CardHeader className="p-5 pb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-2">
              <BookOpen className="size-5" />
            </div>
            <CardTitle className="text-base font-bold">Cashback Pembelian</CardTitle>
            <CardDescription className="text-xs">
              Cashback otomatis 5% dari setiap pembelian paket program baru.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">
              5% Cashback Poin
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Mutation History */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Riwayat Mutasi Poin
              </h2>
              <p className="text-xs text-zinc-500">
                Aktivitas perolehan dan penukaran poin akun Anda
              </p>
            </div>
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={fetchData} className="h-8 text-xs">
                <RefreshCw className="mr-1.5 size-3.5" /> Segarkan
              </Button>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
              <p className="text-sm text-zinc-500">Silakan login untuk melihat mutasi poin Anda.</p>
              <Button asChild size="sm" className="mt-3">
                <Link href="/auth/login?redirect=/points">Masuk Sekarang</Link>
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
              <Coins className="mx-auto size-10 text-zinc-400" />
              <h4 className="mt-2 text-sm font-semibold">Belum Ada Transaksi Poin</h4>
              <p className="mt-1 text-xs text-zinc-500">
                Selesaikan simulasi ujian atau hadiri kelas bimbingan untuk mendapatkan poin pertama Anda!
              </p>
            </div>
          ) : (
            <Card className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
              {transactions.map((tx) => {
                const isEarn = tx.type === 'earn';
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-9 items-center justify-center rounded-xl ${
                          isEarn
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isEarn ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                          {tx.description}
                        </p>
                        <span className="text-xs text-zinc-400">
                          {formatDate(tx.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black text-sm ${
                          isEarn ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isEarn ? '+' : '-'}{tx.amount.toLocaleString('id-ID')} Poin
                      </span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Sisa: {tx.balance_after.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>

        {/* Right Column: Leaderboard */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                <Trophy className="size-5 text-amber-500" /> Leaderboard Siswa
              </h2>
              <p className="text-xs text-zinc-500">
                Peringkat pengumpul poin prestasi terbanyak
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Top 20
            </Badge>
          </div>

          <Card className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Belum ada data leaderboard siswa.
              </div>
            ) : (
              leaderboard.map((leader, index) => {
                const rank = index + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;

                return (
                  <div
                    key={leader.user_id}
                    className={`flex items-center justify-between p-3.5 transition-colors ${
                      isTop1
                        ? 'bg-amber-500/10 dark:bg-amber-500/5'
                        : isTop2
                        ? 'bg-zinc-100/70 dark:bg-zinc-800/40'
                        : isTop3
                        ? 'bg-amber-700/5'
                        : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank indicator */}
                      <div className="flex size-7 items-center justify-center font-black text-xs">
                        {isTop1 ? (
                          <span className="text-lg">🥇</span>
                        ) : isTop2 ? (
                          <span className="text-lg">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-lg">🥉</span>
                        ) : (
                          <span className="text-zinc-400">#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="size-8 border border-white/50 dark:border-zinc-800">
                        <AvatarImage src={leader.avatar_url || undefined} />
                        <AvatarFallback className="text-[11px] font-bold">
                          {getInitials(leader.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name */}
                      <div>
                        <p className="font-semibold text-xs text-zinc-900 dark:text-white line-clamp-1">
                          {leader.name}
                        </p>
                        <span className="text-[10px] text-zinc-400">
                          Siswa Teladan
                        </span>
                      </div>
                    </div>

                    {/* Total Points */}
                    <div className="text-right">
                      <span className="flex items-center justify-end gap-1 font-extrabold text-xs text-amber-500">
                        <Coins className="size-3.5" />
                        {leader.total_earned.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-zinc-400">poin diraih</span>
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
