'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Edit3, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import type { ProgramTag } from '@/types/sales';

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value) return ((value as { data?: T[] }).data ?? []);
  return [];
}

export default function TagsView() {
  const [tags, setTags] = useState<ProgramTag[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<ProgramTag | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [active, setActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.admin.tags.list({ include_archived: true });
      setTags(unwrapArray<ProgramTag>(response.data));
    } catch (error) {
      alertActions.error('Tag gagal dimuat', getErrorMessage(error, 'Daftar tag tidak tersedia.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id-ID');
    return query ? tags.filter((tag) => `${tag.name} ${tag.code}`.toLocaleLowerCase('id-ID').includes(query)) : tags;
  }, [search, tags]);

  const openForm = (tag?: ProgramTag) => {
    setSelected(tag ?? null);
    setCode(tag?.code ?? '');
    setName(tag?.name ?? '');
    setDescription(tag?.description ?? '');
    setSortOrder(String(tag?.sort_order ?? 0));
    setActive(tag?.is_active ?? true);
    setDialogOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (selected) {
        await apiClient.admin.tags.update(selected.id, {
          name: name.trim(),
          description: description.trim() || null,
          sort_order: Number(sortOrder),
          is_active: active,
        });
      } else {
        await apiClient.admin.tags.create({
          code: code.trim().toLowerCase(),
          name: name.trim(),
          description: description.trim() || null,
          sort_order: Number(sortOrder),
          is_active: active,
        });
      }
      await load();
      setDialogOpen(false);
      alertActions.success('Tag tersimpan', `${name.trim()} siap digunakan pada Program.`);
    } catch (error) {
      alertActions.error('Tag gagal disimpan', getErrorMessage(error, 'Periksa kembali data tag.'));
      setLoading(false);
    }
  };

  const archive = async (tag: ProgramTag) => {
    if (!window.confirm(`Arsipkan tag ${tag.name}?`)) return;
    try {
      await apiClient.admin.tags.remove(tag.id);
      await load();
      alertActions.success('Tag diarsipkan', `${tag.name} tidak lagi tersedia untuk Program baru.`);
    } catch (error) {
      alertActions.error('Tag gagal diarsipkan', getErrorMessage(error, 'Tag masih digunakan atau tidak dapat diarsipkan.'));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Program taxonomy</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Tags</h1>
          <p className="mt-2 text-sm text-muted-foreground">Kelola klasifikasi reusable untuk katalog dan pencarian Program.</p>
        </div>
        <Button className="min-h-11 font-semibold" onClick={() => openForm()}>
          <Plus className="mr-2 size-4" />Tambah tag
        </Button>
      </header>

      <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-none">
        <CardHeader className="gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg text-foreground">Daftar tag</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari tag"
              className="min-h-11 pl-9 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && tags.length === 0 ? (
            <div className="grid gap-3 p-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-muted/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-56 place-items-center text-center">
              <div>
                <Tag className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="font-medium text-foreground">Belum ada tag</p>
                <p className="mt-1 text-sm text-muted-foreground">Buat tag agar Program lebih mudah dikelompokkan.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((tag) => (
                <article key={tag.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-foreground">{tag.name}</h2>
                      <Badge variant="outline" className="text-xs">{tag.code}</Badge>
                      {tag.archived_at ? (
                        <Badge variant="secondary">Archived</Badge>
                      ) : !tag.is_active ? (
                        <Badge variant="secondary">Inactive</Badge>
                      ) : (
                        <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{tag.description || 'Tanpa deskripsi'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="min-h-11 border-border/70 hover:bg-accent" disabled={Boolean(tag.archived_at)} onClick={() => openForm(tag)}>
                      <Edit3 className="mr-2 size-4" />Edit
                    </Button>
                    <Button variant="ghost" size="icon" className="min-h-11 min-w-11 text-destructive hover:bg-destructive/10" disabled={Boolean(tag.archived_at)} onClick={() => void archive(tag)} aria-label={`Arsipkan ${tag.name}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !loading && setDialogOpen(open)}>
        <DialogContent className="border border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selected ? `Edit ${selected.name}` : 'Tambah tag'}</DialogTitle>
            <DialogDescription className="sr-only">Form master tag katalog program</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="tag-code">Kode</Label>
              <Input
                id="tag-code"
                required
                pattern="[a-z0-9_\-]+"
                disabled={Boolean(selected)}
                value={code}
                onChange={(event) => setCode(event.target.value.toLowerCase())}
                className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Kode bersifat permanen setelah tag dibuat.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Nama</Label>
              <Input
                id="tag-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-description">Deskripsi</Label>
              <textarea
                id="tag-description"
                maxLength={2000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-24 rounded-xl border border-input/60 bg-background/70 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-order">Urutan</Label>
              <Input
                id="tag-order"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="bg-background/70 border-input/60 text-foreground"
              />
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="size-4 accent-primary"
              />
              Tag aktif
            </label>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border/60 pt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="w-full sm:w-auto min-h-11 sm:min-h-10"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-h-11 sm:min-h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {loading ? 'Menyimpan…' : 'Simpan tag'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
