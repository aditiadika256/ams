'use client';

import { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Clock,
  Radio,
  CheckCircle2,
  Edit2,
  Trash2,
  Sparkles,
  FileText,
  Tag,
  SlidersHorizontal,
  Award,
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
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/lib/api';

export interface QuestionItem {
  id: number;
  context_id?: number | null;
  context?: { id: number; title: string; media_type?: string | null } | null;
  stem: string;
  type: string;
  options?: Array<{ key: string; text: string; score?: number }> | null;
  answer_key?: any;
  difficulty: 'easy' | 'medium' | 'hard' | 'hots';
  estimated_seconds: number;
  tags?: string[] | null;
  score_weight: string | number;
  explanation?: string | null;
  status: 'draft' | 'under_review' | 'approved' | 'revision_needed';
  created_at: string;
  updated_at: string;
}

export default function AssessmentQuestionsView() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [contexts, setContexts] = useState<Array<{ id: number; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedContextId, setSelectedContextId] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stem, setStem] = useState('');
  const [contextId, setContextId] = useState<number | ''>('');
  const [type, setType] = useState('single');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'hots'>('medium');
  const [estimatedSeconds, setEstimatedSeconds] = useState(60);
  const [scoreWeight, setScoreWeight] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [status, setStatus] = useState<'draft' | 'under_review' | 'approved'>('draft');

  // Options state
  const [options, setOptions] = useState([
    { key: 'A', text: '', score: 0 },
    { key: 'B', text: '', score: 0 },
    { key: 'C', text: '', score: 0 },
    { key: 'D', text: '', score: 0 },
    { key: 'E', text: '', score: 0 },
  ]);
  const [correctKey, setCorrectKey] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.assessment.getQuestions({
        search: search.trim() || undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        context_id: selectedContextId !== 'all' ? Number(selectedContextId) : undefined,
      });
      if (res && res.data) {
        setQuestions(res.data);
      }
    } catch {
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContexts = async () => {
    try {
      const res = await apiService.assessment.getContexts({ per_page: 100 });
      if (res && res.data) {
        setContexts(res.data);
      }
    } catch {
      setContexts([]);
    }
  };

  useEffect(() => {
    fetchContexts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedDifficulty, selectedType, selectedContextId]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setStem('');
    setContextId('');
    setType('single');
    setDifficulty('medium');
    setEstimatedSeconds(60);
    setScoreWeight(1);
    setExplanation('');
    setStatus('draft');
    setOptions([
      { key: 'A', text: '', score: 0 },
      { key: 'B', text: '', score: 0 },
      { key: 'C', text: '', score: 0 },
      { key: 'D', text: '', score: 0 },
      { key: 'E', text: '', score: 0 },
    ]);
    setCorrectKey('A');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: QuestionItem) => {
    setEditingId(q.id);
    setStem(q.stem);
    setContextId(q.context_id ?? '');
    setType(q.type);
    setDifficulty(q.difficulty);
    setEstimatedSeconds(q.estimated_seconds || 60);
    setScoreWeight(Number(q.score_weight) || 1);
    setExplanation(q.explanation ?? '');
    setStatus(q.status === 'revision_needed' ? 'draft' : q.status);

    if (q.options && Array.isArray(q.options) && q.options.length > 0) {
      setOptions(q.options.map((opt) => ({ key: opt.key, text: opt.text, score: opt.score ?? 0 })));
    } else {
      setOptions([
        { key: 'A', text: '', score: 0 },
        { key: 'B', text: '', score: 0 },
        { key: 'C', text: '', score: 0 },
        { key: 'D', text: '', score: 0 },
        { key: 'E', text: '', score: 0 },
      ]);
    }

    if (q.answer_key) {
      if (typeof q.answer_key === 'string') setCorrectKey(q.answer_key);
      else if (q.answer_key.correct_key) setCorrectKey(q.answer_key.correct_key);
      else if (Array.isArray(q.answer_key)) setCorrectKey(q.answer_key[0] || 'A');
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stem.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        context_id: contextId ? Number(contextId) : null,
        stem: stem.trim(),
        type,
        difficulty,
        estimated_seconds: Number(estimatedSeconds),
        score_weight: Number(scoreWeight),
        explanation: explanation.trim() || null,
        status,
        options: options.map((opt) => ({
          key: opt.key,
          text: opt.text.trim(),
          score: type === 'scale' ? Number(opt.score) : opt.key === correctKey ? 1 : 0,
        })),
        answer_key: type === 'scale' ? null : { correct_key: correctKey },
      };

      if (editingId) {
        await apiService.assessment.updateQuestion(editingId, payload);
      } else {
        await apiService.assessment.createQuestion(payload);
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus butir pertanyaan ini?')) return;
    try {
      await apiService.assessment.deleteQuestion(id);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Mudah</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30">Sedang</Badge>;
      case 'hard':
        return <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30">Sulit</Badge>;
      case 'hots':
        return <Badge variant="outline" className="text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold">HOTS</Badge>;
      default:
        return <Badge variant="outline">{diff}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" />
              Layer 1 CBT: Master Assessment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Radio className="size-7 text-primary" />
            Question Bank (Bank Soal)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Pengelolaan butir soal multi-format (Pilihan Ganda, Skala Likert/TKP 1–5, Esai), kunci jawaban, tagging topik, estimasi durasi, dan pembahasan TeX/LaTeX.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shrink-0 shadow-sm min-h-11 sm:min-h-10 font-semibold">
          <Plus className="size-4" />
          Tambah Soal Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-xl">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari teks soal atau pembahasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            aria-label="Filter tingkat kesulitan"
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="all">Semua Kesulitan</option>
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
            <option value="hots">HOTS</option>
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            aria-label="Filter tipe pertanyaan"
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="all">Semua Format</option>
            <option value="single">Pilihan Ganda Biasa</option>
            <option value="scale">Skala TKP (1–5)</option>
            <option value="multi">Pilihan Ganda Kompleks</option>
            <option value="essay">Esai / Uraian</option>
          </select>

          {/* Context filter */}
          <select
            value={selectedContextId}
            aria-label="Filter wacana induk"
            onChange={(e) => setSelectedContextId(e.target.value)}
            className="h-10 rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring/40 max-w-44 truncate"
          >
            <option value="all">Semua Wacana</option>
            {contexts.map((ctx) => (
              <option key={ctx.id} value={ctx.id}>
                {ctx.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl border border-border/60 bg-card/40 p-5 animate-pulse"
            />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 sm:p-12 text-center bg-card/30">
          <div className="mx-auto size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            <Radio className="size-7" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">
            Belum Ada Butir Soal
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Mulai tambahkan butir soal baru, tentukan kunci jawaban, atau tautkan ke wacana induk stimulus.
          </p>
          <Button onClick={handleOpenCreate} variant="outline" className="mt-4 gap-2 text-xs border-border/70 hover:bg-accent">
            <Plus className="size-3.5" /> Buat Soal Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="group rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md hover:border-primary/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-primary">#{idx + 1}</span>
                    {getDifficultyBadge(q.difficulty)}
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      {q.type}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" /> {q.estimated_seconds} dtk
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Award className="size-3" /> Bobot {q.score_weight}
                    </span>
                    {q.context && (
                      <Badge variant="outline" className="gap-1 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px]">
                        <FileText className="size-2.5" /> Wacana: {q.context.title}
                      </Badge>
                    )}
                  </div>

                  {/* Stem preview */}
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {q.stem}
                  </p>

                  {/* Options summary */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pt-2">
                      {q.options.map((opt) => (
                        <div
                          key={opt.key}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40"
                        >
                          <span className="font-semibold text-foreground">{opt.key}.</span>
                          <span className="truncate">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(q)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    aria-label={`Ubah soal #${q.id}`}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(q.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label={`Hapus soal #${q.id}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              {editingId ? 'Edit Butir Soal' : 'Tambah Butir Soal Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="q-context" className="text-xs">
                  Tautkan ke Wacana Induk
                </Label>
                <select
                  id="q-context"
                  aria-label="Pilih wacana induk untuk butir soal"
                  value={contextId}
                  onChange={(e) => setContextId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-10 rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="">Tanpa Wacana (Mandiri)</option>
                  {contexts.map((ctx) => (
                    <option key={ctx.id} value={ctx.id}>
                      {ctx.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="q-difficulty" className="text-xs">
                  Tingkat Kesulitan
                </Label>
                <select
                  id="q-difficulty"
                  aria-label="Pilih tingkat kesulitan soal"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                  <option value="hots">HOTS (Higher Order)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="q-type" className="text-xs">
                  Format Soal
                </Label>
                <select
                  id="q-type"
                  aria-label="Pilih format pertanyaan"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="single">Pilihan Ganda (PG 1 Kunci)</option>
                  <option value="scale">Skala 1–5 (TKP CPNS)</option>
                  <option value="multi">Pilihan Ganda Kompleks</option>
                  <option value="essay">Esai / Uraian</option>
                </select>
              </div>
            </div>

            {/* Stem question text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="q-stem" className="text-xs">
                  Pertanyaan / Soal <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Mendukung sintaks TeX ($$x^2$$)
                </span>
              </div>
              <Textarea
                id="q-stem"
                required
                rows={4}
                placeholder="Tuliskan pertanyaan soal di sini..."
                value={stem}
                onChange={(e) => setStem(e.target.value)}
                className="text-xs leading-relaxed bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>

            {/* Options Builder */}
            {type !== 'essay' && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <Label className="text-xs font-semibold text-foreground block">
                  Opsi Pilihan Jawaban:
                </Label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={opt.key} className="flex items-center gap-2">
                      <span className="font-semibold text-xs size-7 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 border border-border/60">
                        {opt.key}
                      </span>
                      <Input
                        aria-label={`Teks opsi ${opt.key}`}
                        placeholder={`Teks pilihan ${opt.key}...`}
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[i].text = e.target.value;
                          setOptions(updated);
                        }}
                        className="text-xs h-9 flex-1 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                      />

                      {type === 'scale' ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-muted-foreground">Skor:</span>
                          <Input
                            type="number"
                            aria-label={`Skor opsi ${opt.key}`}
                            min={1}
                            max={5}
                            value={opt.score || 1}
                            onChange={(e) => {
                              const updated = [...options];
                              updated[i].score = Number(e.target.value);
                              setOptions(updated);
                            }}
                            className="text-xs h-9 w-14 text-center bg-background/70 border-input/60 text-foreground"
                          />
                        </div>
                      ) : (
                        <label className="flex items-center gap-1.5 text-xs shrink-0 cursor-pointer">
                          <input
                            type="radio"
                            name="correct_answer"
                            checked={correctKey === opt.key}
                            onChange={() => setCorrectKey(opt.key)}
                            className="size-4 accent-primary"
                          />
                          <span className="text-[11px] text-muted-foreground font-medium">Kunci</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timer and Score Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="q-seconds" className="text-xs">
                  Estimasi Waktu Pengerjaan (Detik)
                </Label>
                <Input
                  id="q-seconds"
                  type="number"
                  min={10}
                  max={1800}
                  value={estimatedSeconds}
                  onChange={(e) => setEstimatedSeconds(Number(e.target.value))}
                  className="text-xs h-10 bg-background/70 border-input/60 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="q-score" className="text-xs">
                  Bobot Skor Dasar
                </Label>
                <Input
                  id="q-score"
                  type="number"
                  step="0.25"
                  min={0}
                  max={100}
                  value={scoreWeight}
                  onChange={(e) => setScoreWeight(Number(e.target.value))}
                  className="text-xs h-10 bg-background/70 border-input/60 text-foreground"
                />
              </div>
            </div>

            {/* Explanation text */}
            <div className="space-y-1.5">
              <Label htmlFor="q-explanation" className="text-xs">
                Pembahasan Jawaban (Opsional)
              </Label>
              <Textarea
                id="q-explanation"
                rows={3}
                placeholder="Penjelasan cara penyelesaian butir soal..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="text-xs leading-relaxed bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs min-h-10"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs min-h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isSubmitting ? 'Menyimpan…' : editingId ? 'Perbarui Soal' : 'Simpan Soal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
