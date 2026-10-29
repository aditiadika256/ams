'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert,
  KeyRound,
  RefreshCw,
  Search,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  UserX,
  Send,
  Eye,
  CheckCircle,
  Copy,
  Check,
  Flame,
  Radio,
  SlidersHorizontal,
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

interface LiveAttemptItem {
  id: number;
  session_id: number;
  started_at: string;
  submitted_at?: string | null;
  score_total?: number | null;
  proctor_status: 'active' | 'idle' | 'warned' | 'disqualified' | 'completed' | 'paused';
  session?: {
    package?: {
      id: number;
      name: string;
      visual_mode: string;
      duration_minutes: number;
    };
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
  proctor_logs?: Array<{
    id: number;
    event_type: string;
    severity: string;
    details?: any;
    created_at: string;
  }>;
}

interface ActiveTokenItem {
  id: number;
  package_id: number;
  token_code: string;
  expires_at: string;
  package?: {
    id: number;
    name: string;
  };
}

export default function MonitorProctoringView() {
  const [attempts, setAttempts] = useState<LiveAttemptItem[]>([]);
  const [packages, setPackages] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTokens, setActiveTokens] = useState<ActiveTokenItem[]>([]);
  const [copiedToken, setCopiedToken] = useState(false);

  // Token Modal
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenPkgId, setTokenPkgId] = useState<number | null>(null);
  const [ttlMinutes, setTtlMinutes] = useState(30);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [latestGeneratedToken, setLatestGeneratedToken] = useState<string | null>(null);

  // Action Modal
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<LiveAttemptItem | null>(null);
  const [actionType, setActionType] = useState<'warn' | 'pause' | 'resume' | 'reset' | 'disqualify' | 'force_submit'>('warn');
  const [actionReason, setActionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchAttempts = useCallback(async () => {
    try {
      const params: any = { per_page: 30 };
      if (selectedPackageId !== 'all') params.package_id = Number(selectedPackageId);
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiService.assessment.getLiveAttempts(params);
      if (res?.data) {
        setAttempts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch live attempts', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPackageId, statusFilter, search]);

  const fetchTokens = async () => {
    try {
      const res = await apiService.assessment.getActiveProctorTokens();
      if (res?.data) {
        setActiveTokens(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch active tokens', err);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await apiService.assessment.getBlueprints({ per_page: 50 });
      if (res?.data) {
        setPackages(res.data);
        if (res.data.length > 0 && !tokenPkgId) {
          setTokenPkgId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch blueprints', err);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchTokens();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchAttempts();

    // Auto-polling every 8 seconds for real-time monitoring
    const interval = setInterval(fetchAttempts, 8000);
    return () => clearInterval(interval);
  }, [fetchAttempts]);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenPkgId) return;
    setIsGeneratingToken(true);
    try {
      const res = await apiService.assessment.generateProctorToken({
        package_id: tokenPkgId,
        ttl_minutes: ttlMinutes,
      });
      if (res?.data?.token_code) {
        setLatestGeneratedToken(res.data.token_code);
        fetchTokens();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal membuat token');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttempt) return;
    setIsSubmittingAction(true);
    try {
      await apiService.assessment.attemptProctorAction(selectedAttempt.id, {
        action: actionType,
        reason: actionReason,
      });
      setIsActionModalOpen(false);
      setActionReason('');
      fetchAttempts();
    } catch (err: any) {
      alert(err.message || 'Gagal mengeksekusi aksi pengawas');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const openActionModal = (
    attempt: LiveAttemptItem,
    action: 'warn' | 'pause' | 'resume' | 'reset' | 'disqualify' | 'force_submit'
  ) => {
    setSelectedAttempt(attempt);
    setActionType(action);
    setActionReason(
      action === 'warn'
        ? 'Peringatan: Terdeteksi aktivitas mencurigakan atau berpindah jendela browser.'
        : action === 'disqualify'
        ? 'Diskualifikasi: Pelanggaran integritas ujian terkonfirmasi.'
        : ''
    );
    setIsActionModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] animate-pulse">
            <Radio className="size-3 mr-1" /> AKTIF
          </Badge>
        );
      case 'warned':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
            <AlertTriangle className="size-3 mr-1" /> DIPERINGATKAN
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px]">
            <Pause className="size-3 mr-1" /> DIJEDA
          </Badge>
        );
      case 'disqualified':
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px]">
            <UserX className="size-3 mr-1" /> DIDISKUALIFIKASI
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-muted text-muted-foreground border-border/60 text-[10px]">
            <CheckCircle className="size-3 mr-1" /> SELESAI
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status.toUpperCase()}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Live Proctoring Control Center
                <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-[10px]">
                  Layer 4 CBT
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Pengawasan ujian real-time, penerbitan token dinamis, dan mitigasi kecurangan peserta
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              fetchAttempts();
              fetchTokens();
            }}
            className="text-xs h-9 bg-card/60 backdrop-blur-md border-border/40 hover:bg-card/90"
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Segarkan
          </Button>

          <Button
            size="sm"
            onClick={() => setIsTokenModalOpen(true)}
            className="text-xs h-9 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <KeyRound className="size-3.5 mr-1.5" /> Buat Token Dinamis
          </Button>
        </div>
      </div>

      {/* Active Tokens Showcase Bar */}
      {activeTokens.length > 0 && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <KeyRound className="size-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-primary">Token Sesi Ujian Aktif:</div>
              <div className="text-[11px] text-muted-foreground">Bagikan kode ini ke peserta ujian CBT</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTokens.map((tok) => (
              <div
                key={tok.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 border border-primary/30 text-xs shadow-sm"
              >
                <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                  {tok.package?.name || 'Paket Ujian'}:
                </span>
                <span className="font-mono font-bold text-sm tracking-wider text-primary">
                  {tok.token_code}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tok.token_code)}
                  className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  title="Salin Token"
                >
                  {copiedToken ? <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card/40 backdrop-blur-md border-border/40 focus:border-primary/60"
          />
        </div>

        <select
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          className="h-9 px-3 rounded-lg text-xs bg-card/40 backdrop-blur-md border border-border/40 text-foreground focus:outline-none focus:border-primary/60 min-w-[200px]"
        >
          <option value="all">Semua Paket Blueprint</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg text-xs bg-card/40 backdrop-blur-md border border-border/40 text-foreground focus:outline-none focus:border-primary/60 min-w-[140px]"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="warned">Diperingatkan</option>
          <option value="paused">Dijeda</option>
          <option value="disqualified">Didiskualifikasi</option>
          <option value="completed">Selesai</option>
        </select>
      </div>

      {/* Grid of Live Students */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
          Memuat data pengawasan ujian...
        </div>
      ) : attempts.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border/60 bg-card/20 backdrop-blur-md">
          <ShieldAlert className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <div className="text-sm font-semibold text-foreground">Tidak Ada Sesi Ujian Aktif</div>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Belum ada siswa yang sedang menjalankan sesi ujian untuk kriteria pencarian ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {attempts.map((att) => (
            <div
              key={att.id}
              className="p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="font-semibold text-xs text-foreground truncate max-w-[170px]">
                    {att.session?.user?.name || 'Siswa'}
                  </div>
                  {getStatusBadge(att.proctor_status)}
                </div>

                <div className="text-[11px] text-muted-foreground truncate mb-1">
                  {att.session?.user?.email}
                </div>

                <div className="text-[10px] text-primary/80 font-medium truncate mb-2">
                  {att.session?.package?.name || 'Paket Ujian'}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2">
                  <span>Mulai: {new Date(att.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {att.proctor_logs && att.proctor_logs.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="size-3" /> {att.proctor_logs.length} Log
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 border-t border-border/30 pt-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openActionModal(att, 'warn')}
                  className="h-7 px-2 text-[10px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/30 flex-1"
                >
                  <AlertTriangle className="size-3 mr-1" /> Peringatkan
                </Button>

                {att.proctor_status === 'paused' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openActionModal(att, 'resume')}
                    className="h-7 px-2 text-[10px] bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-blue-500/30"
                  >
                    <Play className="size-3" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openActionModal(att, 'pause')}
                    className="h-7 px-2 text-[10px] bg-card hover:bg-card/80 border-border/40"
                  >
                    <Pause className="size-3" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openActionModal(att, 'reset')}
                  className="h-7 px-2 text-[10px] bg-card hover:bg-card/80 border-border/40"
                  title="Reset Sesi"
                >
                  <RotateCcw className="size-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openActionModal(att, 'disqualify')}
                  className="h-7 px-2 text-[10px] bg-destructive/15 hover:bg-destructive/25 text-destructive border-destructive/30"
                  title="Diskualifikasi"
                >
                  <UserX className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Generate Token */}
      <Dialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <KeyRound className="size-4 text-primary" /> Terbitkan Token Sesi Ujian Dinamis
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleGenerateToken} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Pilih Paket Blueprint Ujian</Label>
              <select
                value={tokenPkgId ?? ''}
                onChange={(e) => setTokenPkgId(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg text-xs bg-background/50 border border-border/50 text-foreground focus:outline-none focus:border-primary/60"
                required
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Masa Berlaku Token (Menit)</Label>
              <Input
                type="number"
                min={5}
                max={180}
                value={ttlMinutes}
                onChange={(e) => setTtlMinutes(Number(e.target.value))}
                className="h-9 text-xs"
                required
              />
            </div>

            {latestGeneratedToken && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
                <div className="text-[11px] text-muted-foreground mb-1">Kode Token Berhasil Dibuat:</div>
                <div className="text-3xl font-mono font-extrabold tracking-widest text-primary">
                  {latestGeneratedToken}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Masa aktif 30 menit • Tersimpan di Redis Cache
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsTokenModalOpen(false);
                  setLatestGeneratedToken(null);
                }}
                className="text-xs"
              >
                Tutup
              </Button>
              <Button type="submit" disabled={isGeneratingToken} className="text-xs">
                {isGeneratingToken ? 'Membuat…' : 'Generate Token Baru'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Proctor Action */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary" /> Eksekusi Tindakan Pengawas
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleExecuteAction} className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-card/50 border border-border/40 text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">Siswa:</span>{' '}
                <span className="font-semibold text-foreground">{selectedAttempt?.session?.user?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{' '}
                <span>{selectedAttempt?.session?.user?.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tindakan:</span>{' '}
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary">
                  {actionType}
                </Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alasan / Catatan Berita Acara</Label>
              <Input
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Tulis alasan tindakan pengawas..."
                className="h-9 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsActionModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingAction}
                variant={actionType === 'disqualify' ? 'destructive' : 'default'}
                className="text-xs"
              >
                {isSubmittingAction ? 'Memproses…' : 'Konfirmasi Tindakan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
