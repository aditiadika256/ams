'use client';

import { useEffect, useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Flame,
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
import { Switch } from '@/components/ui/switch';
import { apiService } from '@/lib/api';

export interface BlueprintSectionDraft {
  subject: string;
  sort_order: number;
  transition_mode: 'direct_continuous' | 'intermission_break';
  break_duration_seconds: number;
  section_timer_minutes?: number | null;
  num_questions: number;
}

export interface BlueprintItem {
  id: number;
  name: string;
  visual_mode: 'standard' | 'cpns' | 'utbk' | 'akm' | 'osn' | 'omi';
  scoring_mode: 'same_weight' | 'custom_weight' | 'scale_tkp' | 'irt_2pl';
  negative_marking: boolean;
  level: string;
  duration_minutes: number;
  randomize: boolean;
  sections?: Array<{
    id: number;
    subject: string;
    sort_order: number;
    transition_mode: string;
    break_duration_seconds: number;
    section_timer_minutes?: number | null;
    questions_count?: number;
  }>;
  created_at: string;
}

export default function ComponentAssessmentsView() {
  const [blueprints, setBlueprints] = useState<BlueprintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visualFilter, setVisualFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [visualMode, setVisualMode] = useState<'standard' | 'cpns' | 'utbk' | 'akm' | 'osn' | 'omi'>('cpns');
  const [scoringMode, setScoringMode] = useState<'same_weight' | 'custom_weight' | 'scale_tkp' | 'irt_2pl'>('same_weight');
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(100);
  const [level, setLevel] = useState('cpns');

  // Sections builder inside modal
  const [sections, setSections] = useState<BlueprintSectionDraft[]>([
    {
      subject: 'Tes Wawasan Kebangsaan (TWK)',
      sort_order: 1,
      transition_mode: 'direct_continuous',
      break_duration_seconds: 0,
      section_timer_minutes: 30,
      num_questions: 30,
    },
    {
      subject: 'Tes Intelegensia Umum (TIU)',
      sort_order: 2,
      transition_mode: 'direct_continuous',
      break_duration_seconds: 0,
      section_timer_minutes: 35,
      num_questions: 35,
    },
    {
      subject: 'Tes Karakteristik Pribadi (TKP)',
      sort_order: 3,
      transition_mode: 'direct_continuous',
      break_duration_seconds: 0,
      section_timer_minutes: 45,
      num_questions: 45,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBlueprints = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.assessment.getBlueprints({
        search: search.trim() || undefined,
        visual_mode: visualFilter !== 'all' ? visualFilter : undefined,
      });
      if (res && res.data) {
        setBlueprints(res.data);
      }
    } catch {
      setBlueprints([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlueprints();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, visualFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setVisualMode('cpns');
    setScoringMode('same_weight');
    setNegativeMarking(false);
    setDurationMinutes(100);
    setLevel('cpns');
    setSections([
      {
        subject: 'Tes Wawasan Kebangsaan (TWK)',
        sort_order: 1,
        transition_mode: 'direct_continuous',
        break_duration_seconds: 0,
        section_timer_minutes: 30,
        num_questions: 30,
      },
      {
        subject: 'Tes Intelegensia Umum (TIU)',
        sort_order: 2,
        transition_mode: 'direct_continuous',
        break_duration_seconds: 0,
        section_timer_minutes: 35,
        num_questions: 35,
      },
      {
        subject: 'Tes Karakteristik Pribadi (TKP)',
        sort_order: 3,
        transition_mode: 'direct_continuous',
        break_duration_seconds: 0,
        section_timer_minutes: 45,
        num_questions: 45,
      },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bp: BlueprintItem) => {
    setEditingId(bp.id);
    setName(bp.name);
    setVisualMode(bp.visual_mode);
    setScoringMode(bp.scoring_mode);
    setNegativeMarking(bp.negative_marking);
    setDurationMinutes(bp.duration_minutes);
    setLevel(bp.level);

    if (bp.sections && bp.sections.length > 0) {
      setSections(
        bp.sections.map((s, idx) => ({
          subject: s.subject,
          sort_order: s.sort_order || idx + 1,
          transition_mode: (s.transition_mode as any) || 'direct_continuous',
          break_duration_seconds: s.break_duration_seconds || 0,
          section_timer_minutes: s.section_timer_minutes || null,
          num_questions: s.questions_count || 10,
        }))
      );
    }
    setIsModalOpen(true);
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        subject: `Sub-Tes Baru ${prev.length + 1}`,
        sort_order: prev.length + 1,
        transition_mode: 'direct_continuous',
        break_duration_seconds: 0,
        section_timer_minutes: 20,
        num_questions: 20,
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setSections(copy.map((s, i) => ({ ...s, sort_order: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        visual_mode: visualMode,
        scoring_mode: scoringMode,
        negative_marking: negativeMarking,
        duration_minutes: Number(durationMinutes),
        level,
        sections: sections.map((s, idx) => ({
          subject: s.subject.trim(),
          sort_order: idx + 1,
          transition_mode: s.transition_mode,
          break_duration_seconds: Number(s.break_duration_seconds),
          section_timer_minutes: s.section_timer_minutes ? Number(s.section_timer_minutes) : null,
          num_questions: Number(s.num_questions),
        })),
      };

      if (editingId) {
        await apiService.assessment.updateBlueprint(editingId, payload);
      } else {
        await apiService.assessment.createBlueprint(payload);
      }
      setIsModalOpen(false);
      fetchBlueprints();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus paket blueprint ini?')) return;
    try {
      await apiService.assessment.deleteBlueprint(id);
      fetchBlueprints();
    } catch (err) {
      console.error(err);
    }
  };

  const getVisualBadge = (mode: string) => {
    switch (mode) {
      case 'cpns':
        return <Badge variant="default" className="bg-emerald-600 text-[10px] uppercase font-mono">CPNS (BKN)</Badge>;
      case 'utbk':
        return <Badge variant="default" className="bg-blue-600 text-[10px] uppercase font-mono">UTBK / SNBT</Badge>;
      case 'akm':
        return <Badge variant="default" className="bg-purple-600 text-[10px] uppercase font-mono">AKM Literasi</Badge>;
      case 'osn':
        return <Badge variant="default" className="bg-amber-600 text-[10px] uppercase font-mono">Olimpiade OSN</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase font-mono">Standard</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" />
              Layer 2 CBT: Component Blueprint Builder
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Boxes className="size-7 text-primary" />
            Assessment Blueprint Builder
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Perakitan paket soal modular dengan visual mode spesifik (CPNS/UTBK/AKM), timer teknis multi-seksi berjeda (*intermission break*), dan aturan penskoran IRT / Skala TKP.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shrink-0 shadow-sm">
          <Plus className="size-4" />
          Rancang Paket Blueprint
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
          <Input
            placeholder="Cari nama paket blueprint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-zinc-500 shrink-0">Visual Mode:</span>
          <select
            value={visualFilter}
            aria-label="Filter visual mode ujian"
            onChange={(e) => setVisualFilter(e.target.value)}
            className="h-9 rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-medium text-zinc-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
          >
            <option value="all">Semua Tampilan</option>
            <option value="cpns">CPNS (BKN Style)</option>
            <option value="utbk">UTBK / SNBT</option>
            <option value="akm">AKM Asesmen</option>
            <option value="osn">OSN / Kompetisi</option>
            <option value="standard">Standard CBT</option>
          </select>
        </div>
      </div>

      {/* Blueprint Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-52 rounded-2xl border border-zinc-200/60 bg-white/40 p-5 animate-pulse dark:border-zinc-800/60 dark:bg-zinc-900/40"
            />
          ))}
        </div>
      ) : blueprints.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <div className="mx-auto size-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 dark:bg-zinc-900">
            <Boxes className="size-7" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Belum Ada Blueprint Ujian
          </h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Buat master blueprint paket soal pertama Anda dengan aturan penskoran dan sub-tes multi-seksi.
          </p>
          <Button onClick={handleOpenCreate} variant="outline" className="mt-4 gap-2 text-xs">
            <Plus className="size-3.5" /> Rancang Blueprint Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blueprints.map((bp) => (
            <div
              key={bp.id}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:shadow-md hover:border-primary/40 dark:border-zinc-800/80 dark:bg-zinc-950/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  {getVisualBadge(bp.visual_mode)}
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500 font-medium">
                    <Clock className="size-3" /> {bp.duration_minutes} Menit
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-1">
                  {bp.name}
                </h3>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                  <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[11px]">
                    Scoring: {bp.scoring_mode}
                  </span>
                  {bp.negative_marking && (
                    <span className="rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[11px] font-medium">
                      Nilai Minus (+4, -1)
                    </span>
                  )}
                </div>

                {/* Sub-sections summary */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Struktur Seksi ({bp.sections?.length ?? 0}):
                  </span>
                  <div className="space-y-1">
                    {bp.sections?.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50/60 dark:bg-zinc-900/40 px-2.5 py-1 rounded-lg"
                      >
                        <span className="truncate">{s.subject}</span>
                        <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                          {s.questions_count ?? 0} soal
                        </span>
                      </div>
                    ))}
                    {(bp.sections?.length ?? 0) > 3 && (
                      <span className="text-[10px] text-primary block pl-1">
                        + {(bp.sections?.length ?? 0) - 3} seksi lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">ID #{bp.id}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(bp)}
                    className="h-8 w-8 p-0 text-zinc-500 hover:text-primary"
                    aria-label={`Ubah blueprint ${bp.name}`}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(bp.id)}
                    className="h-8 w-8 p-0 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400"
                    aria-label={`Hapus blueprint ${bp.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blueprint Builder Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Boxes className="size-5 text-primary" />
              {editingId ? 'Edit Master Blueprint Ujian' : 'Rancang Blueprint Ujian Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* General Configurations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bp-name" className="text-xs">
                  Nama Paket Blueprint <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="bp-name"
                  required
                  placeholder="Contoh: Paket Tryout SKD Kedinasan & CPNS 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-visual" className="text-xs">
                  Visual Mode (Antarmuka Siswa)
                </Label>
                <select
                  id="bp-visual"
                  aria-label="Pilih visual mode antarmuka ujian"
                  value={visualMode}
                  onChange={(e) => setVisualMode(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-medium text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
                >
                  <option value="cpns">CPNS (Sistem CAT BKN)</option>
                  <option value="utbk">UTBK / SNBT (Sub-tes Terjeda)</option>
                  <option value="akm">AKM Literasi & Numerasi</option>
                  <option value="osn">OSN / Olimpiade Sains</option>
                  <option value="standard">Standard CBT Sederhana</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-scoring" className="text-xs">
                  Rumus Penskoran (Scoring Engine)
                </Label>
                <select
                  id="bp-scoring"
                  aria-label="Pilih rumus penskoran ujian"
                  value={scoringMode}
                  onChange={(e) => setScoringMode(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-medium text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
                >
                  <option value="same_weight">Same Weight (Bobot Rata)</option>
                  <option value="scale_tkp">Skala 1–5 (TKP CPNS)</option>
                  <option value="custom_weight">Custom Weight (Per Butir Soal)</option>
                  <option value="irt_2pl">IRT 2-Parameter Logistic (Psikometrik)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-duration" className="text-xs">
                  Total Durasi Ujian (Menit)
                </Label>
                <Input
                  id="bp-duration"
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 p-3 bg-zinc-50/50 dark:border-zinc-800/80 dark:bg-zinc-900/40 mt-auto">
                <div>
                  <span className="text-xs font-medium block">Negative Marking</span>
                  <span className="text-[10px] text-zinc-400">Penalti nilai (-1 salah, +4 benar)</span>
                </div>
                <Switch checked={negativeMarking} onCheckedChange={setNegativeMarking} />
              </div>
            </div>

            {/* Multi-Section Drag-and-Drop / Builder */}
            <div className="space-y-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Layers className="size-4 text-primary" />
                    Struktur Sub-Tes / Seksi Soal
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Susun urutan seksi soal dan tentukan apakah antar seksi memiliki jeda istirahat (*intermission break*).
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddSection} className="text-xs gap-1.5">
                  <Plus className="size-3.5" /> Tambah Sub-Tes
                </Button>
              </div>

              <div className="space-y-2.5">
                {sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/80 p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70"
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      {/* Reorder arrows */}
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          type="button"
                          aria-label="Geser sub-tes ke atas"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, 'up')}
                          className="rounded p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
                        >
                          <ChevronUp className="size-3" />
                        </button>
                        <span className="text-[10px] font-semibold text-zinc-400">{idx + 1}</span>
                        <button
                          type="button"
                          aria-label="Geser sub-tes ke bawah"
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMoveSection(idx, 'down')}
                          className="rounded p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
                        >
                          <ChevronDown className="size-3" />
                        </button>
                      </div>

                      <div className="flex-1 space-y-1">
                        <Input
                          aria-label={`Nama sub-tes #${idx + 1}`}
                          value={sec.subject}
                          placeholder="Nama sub-tes (misal: Tes Wawasan Kebangsaan)"
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[idx].subject = e.target.value;
                            setSections(updated);
                          }}
                          className="h-8 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <select
                        aria-label={`Mode transisi sub-tes #${idx + 1}`}
                        value={sec.transition_mode}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[idx].transition_mode = e.target.value as any;
                          setSections(updated);
                        }}
                        className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-[11px] dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value="direct_continuous">Langsung Lanjut</option>
                        <option value="intermission_break">Jeda Terjadwal</option>
                      </select>

                      <Input
                        type="number"
                        min={1}
                        aria-label={`Jumlah soal sub-tes #${idx + 1}`}
                        title="Jumlah butir soal"
                        placeholder="Soal"
                        value={sec.num_questions}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[idx].num_questions = Number(e.target.value);
                          setSections(updated);
                        }}
                        className="h-8 w-16 text-xs text-center"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={sections.length <= 1}
                        onClick={() => handleRemoveSection(idx)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 disabled:opacity-30"
                        aria-label={`Hapus sub-tes #${idx + 1}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky summary preview */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3.5 text-xs flex flex-wrap items-center justify-between gap-3 text-primary">
              <span className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> Ringkasan Blueprint:
              </span>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span>{sections.length} Sub-tes</span>
                <span>•</span>
                <span>{sections.reduce((acc, s) => acc + (s.num_questions || 0), 0)} Total Butir Soal</span>
                <span>•</span>
                <span>{durationMinutes} Menit</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-xs">
                {isSubmitting ? 'Menyimpan…' : editingId ? 'Perbarui Blueprint' : 'Simpan Blueprint'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
