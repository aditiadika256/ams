'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, DollarSign, Users, Award, TrendingUp, 
  ArrowLeft, RefreshCw, Layers, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';

interface BranchMetric {
  id: number;
  name: string;
  code: string;
  total_students: number;
  total_revenue: number;
  total_orders: number;
  total_certificates: number;
}

interface ConsolidationData {
  global: {
    total_revenue: number;
    total_orders: number;
    total_students: number;
    total_branches: number;
    total_certificates: number;
    retention_rate: number;
  };
  branches: BranchMetric[];
  monthly_trend: Array<{
    month: string;
    revenue: number;
    orders_count: number;
  }>;
}

function currency(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function AmsConsolidationPage() {
  const [data, setData] = useState<ConsolidationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConsolidation = async () => {
    setLoading(true);
    try {
      const res = await apiClient.admin.ams.consolidation();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load AMS consolidation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsolidation();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24">
        <PageLoader text="Mengagregasi arus kas global & metrik cabang AMS..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link href="/admin">
              <ArrowLeft className="mr-2 size-4" /> Kembali ke Admin Panel
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              AMS: Konsolidasi Multi-Cabang
            </h1>
            <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-500 font-extrabold text-xs">
              Super Admin Only
            </Badge>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Agregasi arus kas global, metrik retensi siswa, dan kinerja operasional seluruh cabang Arkanin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchConsolidation} className="rounded-xl">
            <RefreshCw className="mr-1.5 size-3.5" /> Segarkan Data
          </Button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs font-semibold text-zinc-400">Total Arus Kas Masuk</span>
            <CardTitle className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {currency(data.global.total_revenue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-xs text-zinc-500">{data.global.total_orders} transaksi lunas terverifikasi</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs font-semibold text-zinc-400">Total Siswa Terdaftar</span>
            <CardTitle className="text-2xl font-black text-primary">
              {data.global.total_students.toLocaleString('id-ID')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-xs text-zinc-500">Tersebar di {data.global.total_branches} cabang aktif</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs font-semibold text-zinc-400">Tingkat Retensi Multi-Program</span>
            <CardTitle className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {data.global.retention_rate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-xs text-zinc-500">Siswa mengambil lebih dari 1 program</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs font-semibold text-zinc-400">Sertifikat Kelulusan Diterbitkan</span>
            <CardTitle className="text-2xl font-black text-amber-500">
              {data.global.total_certificates.toLocaleString('id-ID')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-xs text-zinc-500">Syarat CBT &ge; 60 & Presensi &ge; 80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Branch Breakdown Table */}
      <Card className="overflow-hidden rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
        <CardHeader className="border-b border-zinc-100 p-5 dark:border-zinc-800/60">
          <CardTitle className="text-base font-bold">Kinerja Finansial & Operasional Per Cabang</CardTitle>
          <CardDescription className="text-xs">
            Perbandingan omzet, populasi siswa, dan kelulusan antar cabang secara terisolasi (`branch_id`).
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200/80 bg-zinc-50/75 text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
              <tr>
                <th className="px-6 py-4">Cabang</th>
                <th className="px-6 py-4">Kode Cabang</th>
                <th className="px-6 py-4">Total Siswa</th>
                <th className="px-6 py-4">Transaksi Lunas</th>
                <th className="px-6 py-4">Sertifikat Terbit</th>
                <th className="px-6 py-4 text-right">Total Omzet Cabang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
              {data.branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    Belum ada cabang terdaftar.
                  </td>
                </tr>
              ) : (
                data.branches.map((br) => (
                  <tr key={br.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-zinc-400" />
                        {br.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                      {br.code}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {br.total_students.toLocaleString('id-ID')} siswa
                    </td>
                    <td className="px-6 py-4">
                      {br.total_orders.toLocaleString('id-ID')} order
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {br.total_certificates} sertifikat
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {currency(br.total_revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
