'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LineChart,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Sparkles,
  Sliders,
  Flame,
  HelpCircle,
  FileSpreadsheet,
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

interface ItemAnalysisData {
  question_id: number;
  section_id: number;
  section_name: string;
  stem: string;
  difficulty_level: string;
  difficulty_b: number;
  discrimination_a: number;
  pseudo_guessing_c: number;
  fit_status: 'fit' | 'unfit' | 'dropped';
  is_dropped: boolean;
  sample_size: number;
  distractor_efficiency: Array<{
    key: string;
    count: number;
    percentage: number;
  }>;
  analyzed_at?: string;
}

export default function MonitorAnalysisView() {
  const [packages, setPackages] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [items, setItems] = useState<ItemAnalysisData[]>([]);
  const [summary, setSummary] = useState({
    total_items: 0,
    fit_count: 0,
    unfit_count: 0,
    dropped_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [search, setSearch] = useState('');
  const [fitFilter, setFitFilter] = useState('all');

  // Drop Modal
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ItemAnalysisData | null>(null);
  const [dropReason, setDropReason] = useState('');
  const [isSubmittingDrop, setIsSubmittingDrop] = useState(false);

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
      console.error('Failed to fetch blueprint packages', err);
    }
  };

  const fetchAnalysis = useCallback(async () => {
    if (!selectedPackageId) return;
    setIsLoading(true);
    try {
      const res = await apiService.assessment.getItemAnalysis(selectedPackageId);
      if (res?.data) {
        setItems(res.data.items || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch item analysis', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPackageId]);

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedPackageId) {
      fetchAnalysis();
    }
  }, [selectedPackageId, fetchAnalysis]);

  const handleRunIrtCalculation = async () => {
    if (!selectedPackageId) return;
    setIsCalculating(true);
    try {
      await apiService.assessment.calculateItemAnalysis(selectedPackageId);
      await fetchAnalysis();
      alert('Kalkulasi Item Response Theory (IRT 2PL) berhasil dijalankan!');
    } catch (err: any) {
      alert(err.message || 'Gagal menghitung parameter IRT');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDropQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId || !selectedQuestion) return;
    setIsSubmittingDrop(true);
    try {
      await apiService.assessment.dropItemQuestion(selectedPackageId, {
        question_id: selectedQuestion.question_id,
        reason: dropReason,
      });
      setIsDropModalOpen(false);
      setDropReason('');
      await fetchAnalysis();
      alert('Soal berhasil dianulir dan nilai seluruh siswa telah direevaluasi otomatis!');
    } catch (err: any) {
      alert(err.message || 'Gagal menganulir butir soal');
    } finally {
      setIsSubmittingDrop(false);
    }
  };

  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.stem.toLowerCase().includes(search.toLowerCase()) ||
      it.section_name.toLowerCase().includes(search.toLowerCase());
    const matchFit =
      fitFilter === 'all'
        ? true
        : fitFilter === 'dropped'
        ? it.is_dropped
        : it.fit_status === fitFilter && !it.is_dropped;
    return matchSearch && matchFit;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <BrainCircuit className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Analisis Butir Soal & IRT Engine
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                  Psychometrics 2PL
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Evaluasi tingkat kesukaran (b), daya pembeda (a), distraktor, dan fitur pembatalan butir (Drop Question)
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalysis}
            disabled={isLoading}
            className="text-xs h-9 bg-card/60 backdrop-blur-md border-border/40 hover:bg-card/90"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Segarkan
          </Button>

          <Button
            size="sm"
            onClick={handleRunIrtCalculation}
            disabled={isCalculating || !selectedPackageId}
            className="text-xs h-9 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Sparkles className="size-3.5 mr-1.5" />
            {isCalculating ? 'Mengkalkulasi…' : 'Jalankan Engine IRT 2PL'}
          </Button>
        </div>
      </div>

      {/* Package Selector & KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Selector Card */}
        <div className="p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md flex flex-col justify-between">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Paket Blueprint Terpilih</div>
          <select
            value={selectedPackageId ?? ''}
            onChange={(e) => setSelectedPackageId(Number(e.target.value))}
            className="w-full h-9 px-3 rounded-lg text-xs bg-background/50 border border-border/50 text-foreground focus:outline-none focus:border-primary/60 font-medium"
          >
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
          <div className="text-[10px] text-muted-foreground mt-2">
            Pilih paket untuk melihat matriks psikometrik
          </div>
        </div>

        {/* Metric: Fit Items */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Butir Soal Valid (Fit)</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{summary.fit_count}</div>
            <div className="text-[10px] text-emerald-500/80">Daya pembeda & kesukaran ideal</div>
          </div>
          <CheckCircle2 className="size-8 text-emerald-400/40" />
        </div>

        {/* Metric: Unfit Items */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Perlu Revisi (Unfit)</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{summary.unfit_count}</div>
            <div className="text-[10px] text-amber-500/80">Daya pembeda lemah (a &lt; 0.25)</div>
          </div>
          <AlertTriangle className="size-8 text-amber-400/40" />
        </div>

        {/* Metric: Dropped Items */}
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Soal Dianulir (Dropped)</div>
            <div className="text-2xl font-extrabold text-red-400 mt-1">{summary.dropped_count}</div>
            <div className="text-[10px] text-red-500/80">Dikecualikan dari skor total siswa</div>
          </div>
          <XCircle className="size-8 text-red-400/40" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari teks soal atau sub-tes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card/40 backdrop-blur-md border-border/40 focus:border-primary/60"
          />
        </div>

        <select
          value={fitFilter}
          onChange={(e) => setFitFilter(e.target.value)}
          className="h-9 px-3 rounded-lg text-xs bg-card/40 backdrop-blur-md border border-border/40 text-foreground focus:outline-none focus:border-primary/60 min-w-[150px]"
        >
          <option value="all">Semua Status Butir</option>
          <option value="fit">Valid (Fit)</option>
          <option value="unfit">Perlu Revisi (Unfit)</option>
          <option value="dropped">Dianulir (Dropped)</option>
        </select>
      </div>

      {/* Item Analysis Table */}
      <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/40">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Sub-tes / Teks Pertanyaan</th>
                <th className="px-4 py-3">Kesukaran (b)</th>
                <th className="px-4 py-3">Pembeda (a)</th>
                <th className="px-4 py-3">Tebakan (c)</th>
                <th className="px-4 py-3">Efisiensi Pengecoh (Distractor)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Memuat matriks analisis butir soal…
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Tidak ada butir soal yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr
                    key={item.question_id}
                    className={`hover:bg-card/50 transition-colors ${
                      item.is_dropped ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-semibold text-primary/90 text-[11px] mb-0.5">
                        {item.section_name}
                      </div>
                      <div className="line-clamp-2 text-foreground font-medium">
                        {item.stem || 'Soal tanpa judul'}
                      </div>
                    </td>

                    {/* Difficulty (b) */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-mono font-bold ${
                          item.difficulty_b > 1.2
                            ? 'text-red-400'
                            : item.difficulty_b < -1.0
                            ? 'text-emerald-400'
                            : 'text-foreground'
                        }`}
                      >
                        {item.difficulty_b > 0 ? `+${item.difficulty_b}` : item.difficulty_b}
                      </span>
                    </td>

                    {/* Discrimination (a) */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-mono font-bold ${
                          item.discrimination_a >= 0.35
                            ? 'text-emerald-400'
                            : item.discrimination_a < 0.2
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {item.discrimination_a}
                      </span>
                    </td>

                    {/* Guessing (c) */}
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {item.pseudo_guessing_c}
                    </td>

                    {/* Distractor Efficiency Bar */}
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        {item.distractor_efficiency?.map((opt) => (
                          <span
                            key={opt.key}
                            className={`px-1.5 py-0.5 rounded ${
                              opt.percentage > 40
                                ? 'bg-primary/20 text-primary font-bold'
                                : opt.percentage < 5
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-muted/40 text-muted-foreground'
                            }`}
                            title={`${opt.key}: ${opt.percentage}% (${opt.count} siswa)`}
                          >
                            {opt.key}:{opt.percentage}%
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.is_dropped ? (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px]">
                          DROPPED
                        </Badge>
                      ) : item.fit_status === 'fit' ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                          FIT (VALID)
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                          UNFIT
                        </Badge>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {!item.is_dropped ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedQuestion(item);
                            setDropReason('Daya pembeda tidak signifikan dan opsi pengecoh membingungkan peserta.');
                            setIsDropModalOpen(true);
                          }}
                          className="h-7 px-2 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30"
                        >
                          Anulir Soal
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Telah Dianulir</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Drop Question Confirmation */}
      <Dialog open={isDropModalOpen} onOpenChange={setIsDropModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-red-400">
              <AlertTriangle className="size-4" /> Anulir Butir Soal (Drop & Recalculate)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleDropQuestion} className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs space-y-1">
              <div className="font-semibold text-red-300">Konsekuensi Pembatalan Butir Soal:</div>
              <ul className="list-disc list-inside text-muted-foreground text-[11px] space-y-0.5">
                <li>Soal akan diabaikan dari perhitungan nilai paket ujian ini.</li>
                <li>Seluruh nilai peserta akan dihitung ulang secara otomatis.</li>
                <li>Butir soal <strong>tidak dihapus</strong> dari Bank Soal induk.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alasan Pembatalan / Berita Acara</Label>
              <Input
                value={dropReason}
                onChange={(e) => setDropReason(e.target.value)}
                placeholder="Tuliskan catatan teknis anulir soal..."
                className="h-9 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDropModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingDrop}
                variant="destructive"
                className="text-xs"
              >
                {isSubmittingDrop ? 'Memproses…' : 'Konfirmasi Anulir Soal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
