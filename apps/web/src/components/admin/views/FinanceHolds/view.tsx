'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Search,
  RefreshCw,
  Plus,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
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

interface WalletHoldItem {
  id: number;
  user_id: number;
  wallet_id: number;
  amount: number | string;
  reason: string;
  release_condition?: string | null;
  status: 'held' | 'released' | 'forfeited';
  released_at?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  wallet?: {
    id: number;
    balance: number | string;
    pending_balance: number | string;
  };
  created_at: string;
}

export default function FinanceHoldsView() {
  const [holds, setHolds] = useState<WalletHoldItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal: Create Hold
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userId, setUserId] = useState<number | string>('');
  const [amount, setAmount] = useState<number>(100000);
  const [reason, setReason] = useState('');
  const [releaseCondition, setReleaseCondition] = useState('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const fetchHolds = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.walletHolds.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        per_page: 25,
      });
      if (res?.data) {
        setHolds(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch wallet holds', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchHolds();
  }, [fetchHolds]);

  const handleCreateHold = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    try {
      await apiService.walletHolds.create({
        user_id: Number(userId),
        amount,
        reason,
        release_condition: releaseCondition,
      });
      setIsCreateModalOpen(false);
      setUserId('');
      setReason('');
      setReleaseCondition('');
      await fetchHolds();
      alert('Penahanan saldo berhasil dieksekusi!');
    } catch (err: any) {
      alert(err.message || 'Gagal menahan saldo pengguna');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleRelease = async (id: number) => {
    if (!confirm('Lepaskan saldo tertahan kembali ke akun pengguna?')) return;
    try {
      await apiService.walletHolds.release(id);
      await fetchHolds();
      alert('Saldo berhasil dilepas kembali ke pengguna!');
    } catch (err: any) {
      alert(err.message || 'Gagal melepas saldo');
    }
  };

  const handleForfeit = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin memotong saldo tertahan secara permanen?')) return;
    try {
      await apiService.walletHolds.forfeit(id);
      await fetchHolds();
      alert('Saldo tertahan berhasil dipotong permanen!');
    } catch (err: any) {
      alert(err.message || 'Gagal memotong saldo');
    }
  };

  const activeHeldTotal = holds
    .filter((h) => h.status === 'held')
    .reduce((acc, h) => acc + Number(h.amount), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Lock className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Manajemen Saldo Tertahan (Wallet Holds)
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                  Dispute & Escrow
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Penguncian saldo jaminan, proteksi klaim garansi refund, dan eksekusi sengketa
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHolds}
            disabled={isLoading}
            className="text-xs h-9 bg-card/60 backdrop-blur-md border-border/40 hover:bg-card/90"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Segarkan
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs h-9 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="size-3.5 mr-1.5" /> Tahan Saldo Baru
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Total Saldo Ditahan</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
              Rp {activeHeldTotal.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-amber-500/80">Pending escrow balance</div>
          </div>
          <Lock className="size-8 text-amber-400/40" />
        </div>

        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Jumlah Kasus Aktif</div>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">
              {holds.filter((h) => h.status === 'held').length}
            </div>
            <div className="text-[10px] text-blue-500/80">Menunggu syarat pelepasan</div>
          </div>
          <Clock className="size-8 text-blue-400/40" />
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Telah Dilepaskan</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {holds.filter((h) => h.status === 'released').length}
            </div>
            <div className="text-[10px] text-emerald-500/80">Selesai tanpa sengketa</div>
          </div>
          <CheckCircle2 className="size-8 text-emerald-400/40" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari alasan atau nama pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card/40 backdrop-blur-md border-border/40 focus:border-primary/60"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg text-xs bg-card/40 backdrop-blur-md border border-border/40 text-foreground focus:outline-none focus:border-primary/60 min-w-[170px]"
        >
          <option value="all">Semua Status</option>
          <option value="held">Tertahan (Held)</option>
          <option value="released">Dilepas (Released)</option>
          <option value="forfeited">Dipotong (Forfeited)</option>
        </select>
      </div>

      {/* Holds Table */}
      <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/40">
              <tr>
                <th className="px-4 py-3">Pengguna</th>
                <th className="px-4 py-3">Nominal Ditahan</th>
                <th className="px-4 py-3">Alasan & Ketentuan Pelepasan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Waktu Penahanan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Memuat data saldo tertahan…
                  </td>
                </tr>
              ) : holds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Tidak ada catatan penahanan saldo yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                holds.map((h) => (
                  <tr key={h.id} className="hover:bg-card/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{h.user?.name || `User #${h.user_id}`}</div>
                      <div className="text-[11px] text-muted-foreground">{h.user?.email}</div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-amber-400">
                      Rp {Number(h.amount).toLocaleString('id-ID')}
                    </td>

                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-semibold text-foreground mb-0.5">{h.reason}</div>
                      {h.release_condition && (
                        <div className="text-[10px] text-muted-foreground italic">
                          Syarat: {h.release_condition}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {h.status === 'held' ? (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                          TERTAHAN
                        </Badge>
                      ) : h.status === 'released' ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                          DILEPAS
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px]">
                          DIPOTONG
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(h.created_at).toLocaleDateString([], {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {h.status === 'held' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRelease(h.id)}
                            className="h-7 px-2 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          >
                            <Unlock className="size-3 mr-1" /> Lepas Saldo
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleForfeit(h.id)}
                            className="h-7 px-2 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30"
                          >
                            <XCircle className="size-3 mr-1" /> Potong Dana
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Hold */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-amber-400">
              <Lock className="size-4" /> Tahan Saldo Pengguna (Hold Balance)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateHold} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">ID Pengguna Target</Label>
              <Input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="misal: 15"
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nominal yang Ditahan (Rp)</Label>
              <Input
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alasan Penahanan Saldo</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="misal: Penahanan saldo jaminan garansi refund"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Syarat Pelepasan Dana (Opsional)</Label>
              <Input
                value={releaseCondition}
                onChange={(e) => setReleaseCondition(e.target.value)}
                placeholder="misal: Masa garansi 14 hari selesai tanpa dispute"
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingCreate}
                className="text-xs bg-amber-600 hover:bg-amber-500 text-white"
              >
                {isSubmittingCreate ? 'Memproses…' : 'Eksekusi Hold Saldo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
