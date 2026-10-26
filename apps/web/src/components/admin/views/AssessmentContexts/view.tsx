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
          <Badge variant="outline" className="text-zinc-400 border-zinc-200 dark:border-zinc-800">
            Teks Saja
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section with Glass banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" />
              Layer 1 CBT: Master Assessment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <FileText className="size-7 text-primary" />
            Context Bank (Wacana Induk)
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Pusat stimulus, studi kasus, infografis grafik, atau teks bacaan panjang yang ditautkan ke satu atau beberapa butir soal pada ujian CBT.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shrink-0 shadow-sm">
          <Plus className="size-4" />
          Tambah Wacana Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
          <Input
            placeholder="Cari judul atau isi wacana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-zinc-500 shrink-0">Filter Media:</span>
          <select
            value={mediaFilter}
            aria-label="Filter media wacana"
            onChange={(e) => setMediaFilter(e.target.value)}
            className="h-9 rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-medium text-zinc-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
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
              className="h-44 rounded-2xl border border-zinc-200/60 bg-white/40 p-5 animate-pulse dark:border-zinc-800/60 dark:bg-zinc-900/40"
            />
          ))}
        </div>
      ) : contexts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <div className="mx-auto size-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 dark:bg-zinc-900">
            <FileText className="size-7" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Belum Ada Wacana Terdaftar
          </h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Buat wacana atau stimulus pertama untuk mengelompokkan butir soal berbasis teks bacaan panjang atau studi kasus.
          </p>
          <Button onClick={handleOpenCreate} variant="outline" className="mt-4 gap-2 text-xs">
            <Plus className="size-3.5" /> Buat Wacana Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contexts.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:shadow-md hover:border-primary/40 dark:border-zinc-800/80 dark:bg-zinc-950/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  {getMediaBadge(item.media_type)}
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {item.questions_count ?? 0} Soal Terikat
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {item.body_content}
                </p>

                {item.media_url && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-primary truncate">
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{item.media_url}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">ID #{item.id}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 w-8 p-0 text-zinc-500 hover:text-primary"
                    aria-label={`Ubah wacana ${item.title}`}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400"
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingId ? 'Edit Wacana Induk' : 'Tambah Wacana Induk Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ctx-title" className="text-xs">
                Judul Wacana / Stimulus <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="ctx-title"
                required
                placeholder="Contoh: Wacana 1 - Pertumbuhan Ekonomi Regional"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
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
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-medium text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
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
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ctx-body" className="text-xs">
                  Isi Teks Wacana <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
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
                className="text-xs leading-relaxed"
              />
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
                {isSubmitting ? 'Menyimpan…' : editingId ? 'Perbarui Wacana' : 'Simpan Wacana'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
