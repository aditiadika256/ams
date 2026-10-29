'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Trophy,
  Download,
  Search,
  RefreshCw,
  Medal,
  Award,
  Users,
  Target,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api';

interface ScoreboardItem {
  rank: number;
  attempt_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  raw_score: number;
  scaled_score: number;
  status: string;
  started_at: string;
  submitted_at?: string | null;
  duration_seconds?: number | null;
}

export default function MonitorAssessmentResultsView() {
  const [packages, setPackages] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardItem[]>([]);
  const [statistics, setStatistics] = useState({
    total_participants: 0,
    average_score: 0,
    highest_score: 0,
    lowest_score: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchPackages = async () => {
    try {
      const res = await apiService.assessment.getBlueprints({ per_page: 50 });
      if (res?.data && res.data.length > 0) {
        setPackages(res.data);
        if (!selectedPackageId) {
          setSelectedPackageId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch packages', err);
    }
  };

  const fetchResults = useCallback(async () => {
    if (!selectedPackageId) return;
    setIsLoading(true);
    try {
      const res = await apiService.assessment.getAssessmentResults(selectedPackageId, {
        search: search.trim() || undefined,
        page: currentPage,
        per_page: 25,
      });
      if (res?.data) {
        setScoreboard(res.data.scoreboard || []);
        if (res.data.statistics) {
          setStatistics(res.data.statistics);
        }
      }
      const anyRes = res as any;
      if (anyRes?.meta) {
        setLastPage(anyRes.meta.last_page);
      }
    } catch (err) {
      console.error('Failed to fetch assessment scoreboard', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPackageId, search, currentPage]);

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedPackageId) {
      fetchResults();
    }
  }, [selectedPackageId, fetchResults]);

  const handleExportCsv = () => {
    if (scoreboard.length === 0) {
      alert('Tidak ada data scoreboard untuk diekspor.');
      return;
    }

    const headers = ['Peringkat', 'Nama Siswa', 'Email', 'Skor Mentah', 'Skor Terstandar (IRT)', 'Status', 'Durasi (detik)', 'Waktu Selesai'];
    const rows = scoreboard.map((s) => [
      s.rank,
      `"${s.student_name}"`,
      s.student_email,
      s.raw_score,
      s.scaled_score,
      s.status,
      s.duration_seconds ?? '-',
      s.submitted_at ?? '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scoreboard_package_${selectedPackageId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '-';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Trophy className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Rekapitulasi Nilai & Scoreboard
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                  Papan Peringkat
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Peringkat ujian nasional & cabang, konversi skor IRT, berita acara, dan ekspor data CSV
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchResults}
            disabled={isLoading}
            className="text-xs h-9 bg-card/60 backdrop-blur-md border-border/40 hover:bg-card/90"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Segarkan
          </Button>

          <Button
            size="sm"
            onClick={handleExportCsv}
            disabled={scoreboard.length === 0}
            className="text-xs h-9 bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
          >
            <Download className="size-3.5 mr-1.5" /> Ekspor CSV / Excel
          </Button>
        </div>
      </div>

      {/* Package Selector & Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Selector Card */}
        <div className="p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md flex flex-col justify-between">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Paket Blueprint Ujian</div>
          <select
            value={selectedPackageId ?? ''}
            onChange={(e) => {
              setSelectedPackageId(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full h-9 px-3 rounded-lg text-xs bg-background/50 border border-border/50 text-foreground focus:outline-none focus:border-primary/60 font-medium"
          >
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
          <div className="text-[10px] text-muted-foreground mt-2">
            Pilih paket ujian untuk melihat papan peringkat
          </div>
        </div>

        {/* Metric: Total Participants */}
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Total Peserta</div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{statistics.total_participants}</div>
            <div className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">Siswa telah submit ujian</div>
          </div>
          <Users className="size-8 text-blue-400/40" />
        </div>

        {/* Metric: Average Score */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Rata-rata Nilai</div>
            <div className="text-2xl font-extrabold text-primary mt-1">{statistics.average_score}</div>
            <div className="text-[10px] text-primary/80">Mean score seluruh peserta</div>
          </div>
          <TrendingUp className="size-8 text-primary/40" />
        </div>

        {/* Metric: Highest Score */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Nilai Tertinggi</div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{statistics.highest_score}</div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Peringkat 1 Nasional</div>
          </div>
          <Medal className="size-8 text-amber-400/40" />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan nama atau email siswa..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9 h-9 text-xs bg-card/40 backdrop-blur-md border-border/40 focus:border-primary/60"
        />
      </div>

      {/* Scoreboard Table */}
      <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/40">
              <tr>
                <th className="px-4 py-3 text-center">Rank</th>
                <th className="px-4 py-3">Nama Peserta</th>
                <th className="px-4 py-3">Skor Mentah (Raw)</th>
                <th className="px-4 py-3">Skor Standar (IRT)</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Waktu Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Memuat data papan peringkat…
                  </td>
                </tr>
              ) : scoreboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Belum ada data pengerjaan ujian pada paket ini.
                  </td>
                </tr>
              ) : (
                scoreboard.map((item) => (
                  <tr
                    key={item.attempt_id}
                    className={`hover:bg-card/50 transition-colors ${
                      item.rank === 1
                        ? 'bg-amber-500/10'
                        : item.rank === 2
                        ? 'bg-slate-500/10'
                        : item.rank === 3
                        ? 'bg-amber-700/10'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {item.rank === 1 ? (
                        <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-400 text-black font-extrabold text-[11px] shadow-sm">
                          1
                        </span>
                      ) : item.rank === 2 ? (
                        <span className="inline-flex items-center justify-center size-6 rounded-full bg-slate-300 text-black font-extrabold text-[11px] shadow-sm">
                          2
                        </span>
                      ) : item.rank === 3 ? (
                        <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-700 text-white font-extrabold text-[11px] shadow-sm">
                          3
                        </span>
                      ) : (
                        <span className="font-semibold text-muted-foreground">#{item.rank}</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{item.student_name}</div>
                      <div className="text-[11px] text-muted-foreground">{item.student_email}</div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {item.raw_score}
                    </td>

                    <td className="px-4 py-3 font-mono font-extrabold text-primary text-sm">
                      {item.scaled_score}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDuration(item.duration_seconds)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {item.submitted_at
                        ? new Date(item.submitted_at).toLocaleString([], {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border/30 bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Halaman {currentPage} dari {lastPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage === lastPage}
                className="h-7 px-2 text-xs"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
