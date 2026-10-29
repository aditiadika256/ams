'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CreditCard,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { apiService } from '@/lib/api';

interface TrackerItem {
  id: number;
  term_number: number;
  title: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  paid_at?: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'bypassed';
  bypassed_by?: string | null;
  bypass_reason?: string | null;
}

interface EnrollmentItem {
  access_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  program_id: number;
  program_title: string;
  program_price: number;
  overall_payment_status: 'FULL_PAID' | 'PARTIAL_ACTIVE' | 'OVERDUE_LOCKED' | 'REGULAR_ACCESS';
  access_status: string;
  starts_at?: string | null;
  trackers: TrackerItem[];
}

export default function EnrollmentsView() {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Bypass Modal
  const [isBypassModalOpen, setIsBypassModalOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<TrackerItem | null>(null);
  const [bypassReason, setBypassReason] = useState('');
  const [isSubmittingBypass, setIsSubmittingBypass] = useState(false);

  // Pay Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.installments.getTrackers({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        per_page: 30,
      });
      if (res?.data) {
        setEnrollments(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch enrollments and installment trackers', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleBypassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTracker) return;
    setIsSubmittingBypass(true);
    try {
      await apiService.installments.bypass(selectedTracker.id, {
        reason: bypassReason,
      });
      setIsBypassModalOpen(false);
      setBypassReason('');
      await fetchEnrollments();
      alert('Dispensasi manual berhasil diberikan. Modul kurikulum siswa telah dibuka!');
    } catch (err: any) {
      alert(err.message || 'Gagal memberikan dispensasi manual');
    } finally {
      setIsSubmittingBypass(false);
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTracker) return;
    setIsSubmittingPay(true);
    try {
      await apiService.installments.markPaid(selectedTracker.id, {
        amount_paid: payAmount,
      });
      setIsPayModalOpen(false);
      await fetchEnrollments();
      alert('Pembayaran cicilan berhasil dicatat!');
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pembayaran');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const getOverallStatusBadge = (status: string) => {
    switch (status) {
      case 'FULL_PAID':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
            <CheckCircle2 className="size-3 mr-1" /> LUNAS PENUH
          </Badge>
        );
      case 'PARTIAL_ACTIVE':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px]">
            <Clock className="size-3 mr-1" /> CICILAN AKTIF
          </Badge>
        );
      case 'OVERDUE_LOCKED':
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] animate-pulse">
            <Lock className="size-3 mr-1" /> JATUH TEMPO (TERKUNCI)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            REGULER
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <CreditCard className="size-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Enrollment Manager & Installment Tracker
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-[10px]">
                  Drip Lock Engine
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pelacak pembayaran cicilan, penyekatan akses bertingkat, dan dispensasi manual admin
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchEnrollments}
          disabled={isLoading}
          className="w-full sm:w-auto min-h-11 sm:min-h-9 text-xs bg-card/85 backdrop-blur-xl border-border/60 hover:bg-muted"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Segarkan
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama siswa atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <select
          value={statusFilter}
          aria-label="Filter status cicilan"
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl text-xs bg-background/70 border border-input/60 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 w-full sm:w-auto min-w-[170px]"
        >
          <option value="all">Semua Status Cicilan</option>
          <option value="paid">Lunas (Paid)</option>
          <option value="pending">Tertunda (Pending)</option>
          <option value="overdue">Jatuh Tempo (Overdue)</option>
          <option value="bypassed">Dispensasi (Bypassed)</option>
        </select>
      </div>

      {/* Enrollments Table */}
      <div className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60 font-semibold">
              <tr>
                <th className="px-4 py-3.5">Siswa Peserta</th>
                <th className="px-4 py-3.5">Program Belajar</th>
                <th className="px-4 py-3.5">Status Akses</th>
                <th className="px-4 py-3.5">Status Pembayaran</th>
                <th className="px-4 py-3.5">Jadwal Termin Cicilan</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Memuat data enrollment siswa…
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Tidak ada data pendaftaran siswa yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                enrollments.map((en) => (
                  <tr key={en.access_id} className="hover:bg-muted/40 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{en.user_name}</div>
                      <div className="text-[11px] text-muted-foreground">{en.user_email}</div>
                    </td>

                    {/* Program */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{en.program_title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Rp {en.program_price.toLocaleString('id-ID')}
                      </div>
                    </td>

                    {/* Access Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px]">
                        {en.access_status}
                      </Badge>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getOverallStatusBadge(en.overall_payment_status)}
                    </td>

                    {/* Trackers list */}
                    <td className="px-4 py-3.5 min-w-[260px]">
                      {en.trackers.length === 0 ? (
                        <span className="text-[11px] text-muted-foreground italic">Pembayaran Penuh Langsung</span>
                      ) : (
                        <div className="space-y-1.5">
                          {en.trackers.map((tr) => (
                            <div
                              key={tr.id}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-muted/40 border border-border/50 text-[11px]"
                            >
                              <div className="flex items-center gap-1.5">
                                {tr.status === 'paid' ? (
                                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : tr.status === 'bypassed' ? (
                                  <Unlock className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                ) : tr.status === 'overdue' ? (
                                  <Lock className="size-3.5 text-destructive dark:text-red-400 shrink-0" />
                                ) : (
                                  <Clock className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                )}
                                <span className="font-medium text-foreground">{tr.title}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  Rp {tr.amount.toLocaleString('id-ID')}
                                </span>
                                {tr.status !== 'paid' && tr.status !== 'bypassed' && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTracker(tr);
                                        setPayAmount(tr.amount);
                                        setIsPayModalOpen(true);
                                      }}
                                      className="h-6 px-2 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                                      title="Catat Bayar"
                                    >
                                      Bayar
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTracker(tr);
                                        setBypassReason('Dispensasi khusus dari Administrator Cabang');
                                        setIsBypassModalOpen(true);
                                      }}
                                      className="h-6 px-2 text-[10px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                                      title="Manual Bypass"
                                    >
                                      Bypass
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {en.overall_payment_status === 'OVERDUE_LOCKED' && (
                        <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[9px]">
                          Akses Terkunci
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Manual Bypass */}
      <Dialog open={isBypassModalOpen} onOpenChange={setIsBypassModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Unlock className="size-4" /> Dispensasi Manual (Manual Bypass)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleBypassSubmit} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
              <div className="font-semibold text-blue-700 dark:text-blue-300">Konsekuensi Tindakan Bypass:</div>
              <p className="text-muted-foreground text-[11px]">
                Modul silabus yang terkunci akan otomatis dibuka untuk siswa tanpa menunggu konfirmasi transfer bank. Tindakan ini dicatat ke dalam audit trail.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Alasan Pemberian Dispensasi</Label>
              <Input
                value={bypassReason}
                onChange={(e) => setBypassReason(e.target.value)}
                placeholder="Tuliskan catatan persetujuan kepala cabang..."
                className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <DialogFooter className="pt-2 flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsBypassModalOpen(false)}
                className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmittingBypass} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium">
                {isSubmittingBypass ? 'Memproses…' : 'Buka Akses Siswa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Mark Paid */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> Catat Pelunasan Termin
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePaySubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Nominal yang Dibayarkan (Rp)</Label>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="h-10 text-xs font-mono bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <DialogFooter className="pt-2 flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPayModalOpen(false)}
                className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmittingPay} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                {isSubmittingPay ? 'Menyimpan…' : 'Simpan Pembayaran'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
