'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Image as ImageIcon,
  Headphones,
  Video,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  HelpCircle,
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

export interface AssessmentContextItem {
  id: number;
  title: string;
  body_content: string;
  media_url?: string | null;
  media_type?: 'image' | 'audio' | 'video' | null;
  questions_count?: number;
  created_at: string;
  updated_at: string;
}

export default function AssessmentContextsView() {
  const [contexts, setContexts] = useState<AssessmentContextItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContexts = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.assessment.getContexts({
        search: search.trim() || undefined,
        media_type: mediaFilter !== 'all' ? mediaFilter : undefined,
      });
      if (res && res.data) {
        setContexts(res.data);
      }
    } catch {
      // Fallback empty if database or endpoint is initializing
      setContexts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContexts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, mediaFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setBodyContent('');
    setMediaUrl('');
    setMediaType('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AssessmentContextItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setBodyContent(item.body_content);
    setMediaUrl(item.media_url ?? '');
    setMediaType(item.media_type ?? '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bodyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        body_content: bodyContent.trim(),
        media_url: mediaUrl.trim() || null,
        media_type: mediaType ? mediaType : null,
      };

      if (editingId) {
        await apiService.assessment.updateContext(editingId, payload);
      } else {
        await apiService.assessment.createContext(payload);
      }
      setIsModalOpen(false);
      fetchContexts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan wacana ini?')) return;
    try {
      await apiService.assessment.deleteContext(id);
      fetchContexts();
    } catch (err) {
      console.error(err);
    }
  };

  const getMediaBadge = (type?: string | null) => {
    switch (type) {
      case 'image':
        return (
          <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400">
            <ImageIcon className="size-3" /> Gambar
          </Badge>
        );
      case 'audio':
        return (
          <Badge variant="outline" className="gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400">
            <Headphones className="size-3" /> Audio
          </Badge>
        );
      case 'video':
        return (
          <Badge variant="outline" className="gap-1 border-rose-500/30 text-rose-600 dark:text-rose-400">
            <Video className="size-3" /> Video
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground border-border/60">
            Teks Saja
          </Badge>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section with Glass banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" />
              Layer 1 CBT: Master Assessment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="size-7 text-primary" />
            Context Bank (Wacana Induk)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Pusat stimulus, studi kasus, infografis grafik, atau teks bacaan panjang yang ditautkan ke satu atau beberapa butir soal pada ujian CBT.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shrink-0 shadow-sm min-h-11 sm:min-h-10 font-semibold">
          <Plus className="size-4" />
          Tambah Wacana Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau isi wacana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-muted-foreground shrink-0">Filter Media:</span>
          <select
            value={mediaFilter}
            aria-label="Filter media wacana"
            onChange={(e) => setMediaFilter(e.target.value)}
            className="h-10 w-full sm:w-auto rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="all">Semua Tipe</option>
            <option value="image">Gambar Saja</option>
            <option value="audio">Audio Saja</option>
            <option value="video">Video Saja</option>
          </select>
        </div>
      </div>

      {/* Contexts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl border border-border/60 bg-card/40 p-5 animate-pulse"
            />
          ))}
        </div>
      ) : contexts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 sm:p-12 text-center bg-card/30">
          <div className="mx-auto size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            <FileText className="size-7" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">
            Belum Ada Wacana Terdaftar
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Buat wacana atau stimulus pertama untuk mengelompokkan butir soal berbasis teks bacaan panjang atau studi kasus.
          </p>
          <Button onClick={handleOpenCreate} variant="outline" className="mt-4 gap-2 text-xs border-border/70 hover:bg-accent">
            <Plus className="size-3.5" /> Buat Wacana Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contexts.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md hover:border-primary/50"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  {getMediaBadge(item.media_type)}
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {item.questions_count ?? 0} Soal Terikat
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {item.body_content}
                </p>

                {item.media_url && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-primary truncate">
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{item.media_url}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">ID #{item.id}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    aria-label={`Ubah wacana ${item.title}`}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label={`Hapus wacana ${item.title}`}
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
        <DialogContent className="sm:max-w-xl border border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              {editingId ? 'Edit Wacana Induk' : 'Tambah Wacana Induk Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ctx-title" className="text-xs">
                Judul Wacana / Stimulus <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ctx-title"
                required
                placeholder="Contoh: Wacana 1 - Pertumbuhan Ekonomi Regional"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ctx-media-type" className="text-xs">
                  Tipe Media Pendukung
                </Label>
                <select
                  id="ctx-media-type"
                  aria-label="Pilih tipe media pendukung"
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="">Tidak Ada Media (Teks Saja)</option>
                  <option value="image">Gambar (Infografis/Grafik/Foto)</option>
                  <option value="audio">Audio (Listening Soal)</option>
                  <option value="video">Video (Studi Kasus)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ctx-media-url" className="text-xs">
                  URL Media (CDN / Storage)
                </Label>
                <Input
                  id="ctx-media-url"
                  placeholder="https://..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="text-xs h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ctx-body" className="text-xs">
                  Isi Teks Wacana <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <HelpCircle className="size-3" /> Mendukung Markdown & TeX ($$...$$)
                </span>
              </div>
              <Textarea
                id="ctx-body"
                required
                rows={7}
                placeholder="Tuliskan isi stimulus wacana atau studi kasus di sini. Mendukung penulisan rumus TeX seperti $$x = \frac{a}{b}$$..."
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
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
                {isSubmitting ? 'Menyimpan…' : editingId ? 'Perbarui Wacana' : 'Simpan Wacana'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
