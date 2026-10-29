'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Archive, ChevronDown, ChevronRight, Edit3, FileText, FileUp, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import type { ComponentHandlerTemplate, ProgramLesson, ProgramModule } from '@/types/sales';

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value) return ((value as { data?: T[] }).data ?? []);
  return [];
}

const materialKinds: Array<Exclude<ComponentHandlerTemplate, 'FORM' | 'IFRAME' | 'NATIVE'>> = ['INFORMATION', 'EMBEDDED_PAGE', 'EXTERNAL_LINK', 'FILE_DOWNLOAD', 'VIDEO'];
type ModuleDialog = { mode: 'create' | 'edit'; module?: ProgramModule } | null;
type LessonDialog = { mode: 'create' | 'edit'; moduleId: number; lesson?: ProgramLesson } | null;
type DeleteTarget = { type: 'module'; item: ProgramModule } | { type: 'lesson'; item: ProgramLesson } | null;

interface MaterialEditorProps { programId: number; canManage: boolean; canPublish: boolean; canUpload: boolean }

export function MaterialEditor({ programId, canManage, canPublish, canUpload }: MaterialEditorProps) {
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleDialog, setModuleDialog] = useState<ModuleDialog>(null);
  const [lessonDialog, setLessonDialog] = useState<LessonDialog>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.learning.curriculum.list(programId);
      setModules(unwrapArray<ProgramModule>(response.data));
    } catch (error) {
      alertActions.error('Materi gagal dimuat', getErrorMessage(error, 'Kurikulum tidak tersedia.'));
    } finally { setLoading(false); }
  }, [programId]);

  useEffect(() => { void load(); }, [load]);

  const remove = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deleteTarget) return;
    setLoading(true);
    try {
      if (deleteTarget.type === 'module') await apiClient.learning.curriculum.modules.remove(deleteTarget.item.id, deleteReason);
      else await apiClient.learning.curriculum.lessons.remove(deleteTarget.item.id, deleteReason);
      setDeleteTarget(null); setDeleteReason(''); await load();
      alertActions.success('Materi diarsipkan', 'Perubahan berhasil disimpan.');
    } catch (error) {
      alertActions.error('Materi gagal diarsipkan', getErrorMessage(error, 'Item masih digunakan atau tidak dapat dihapus.'));
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border/60 bg-card/85 backdrop-blur-xl rounded-2xl shadow-sm">
      <CardHeader className="gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg text-foreground">Material & kurikulum</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Susun modul, teks, link, video, dan file privat per lesson.</p>
        </div>
        {canManage && (
          <Button className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium" onClick={() => setModuleDialog({ mode: 'create' })}>
            <Plus className="mr-2 size-4" />Tambah modul
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {loading && modules.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Memuat kurikulum...</div>
        ) : modules.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <FileText className="mx-auto mb-3 size-8 text-muted-foreground/60" />
              <p className="font-semibold text-foreground">Belum ada modul</p>
              <p className="mt-1 text-sm text-muted-foreground">Mulai dari modul draft, lalu tambahkan lesson.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {modules.map((module) => {
              const isOpen = expanded.includes(module.id);
              return (
                <section key={module.id} className="p-4 sm:px-6 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-h-10 min-w-10 text-muted-foreground hover:text-foreground"
                      onClick={() => setExpanded((current) => isOpen ? current.filter((id) => id !== module.id) : [...current, module.id])}
                      aria-label={isOpen ? 'Tutup modul' : 'Buka modul'}
                    >
                      {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </Button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{module.title}</h3>
                        <Badge variant={module.is_published ? 'default' : 'secondary'} className={module.is_published ? 'bg-primary text-primary-foreground text-[10px]' : 'text-[10px]'}>
                          {module.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{module.lessons?.length ?? 0} lesson</p>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="min-h-9 min-w-9 text-muted-foreground hover:text-foreground" onClick={() => setModuleDialog({ mode: 'edit', module })} aria-label={`Edit ${module.title}`}>
                          <Edit3 className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="min-h-9 min-w-9 text-muted-foreground hover:text-destructive" onClick={() => { setDeleteTarget({ type: 'module', item: module }); setDeleteReason(''); }} aria-label={`Arsipkan ${module.title}`}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <div className="ml-0 mt-4 grid gap-2.5 sm:ml-12">
                      {(module.lessons ?? []).map((lesson) => (
                        <article key={lesson.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-3 hover:border-primary/40 transition-colors">
                          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                            <FileText className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium text-foreground">{lesson.title}</p>
                              <Badge variant="outline" className="text-[10px]">{lesson.content_kind}</Badge>
                              <Badge variant={lesson.is_published ? 'default' : 'secondary'} className={lesson.is_published ? 'bg-primary text-primary-foreground text-[10px]' : 'text-[10px]'}>
                                {lesson.is_published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{lesson.duration_minutes} menit</p>
                          </div>
                          {canManage && (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="min-h-9 min-w-9 text-muted-foreground hover:text-foreground" onClick={() => setLessonDialog({ mode: 'edit', moduleId: module.id, lesson })} aria-label={`Edit ${lesson.title}`}>
                                <Edit3 className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="min-h-9 min-w-9 text-muted-foreground hover:text-destructive" onClick={() => { setDeleteTarget({ type: 'lesson', item: lesson }); setDeleteReason(''); }} aria-label={`Arsipkan ${lesson.title}`}>
                                <Archive className="size-4" />
                              </Button>
                            </div>
                          )}
                        </article>
                      ))}
                      {canManage && (
                        <Button variant="outline" className="min-h-10 border-dashed text-xs w-full sm:w-auto" onClick={() => setLessonDialog({ mode: 'create', moduleId: module.id })}>
                          <Plus className="mr-2 size-4" />Tambah lesson
                        </Button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </CardContent>
      <ModuleFormDialog state={moduleDialog} loading={loading} nextOrder={modules.length + 1} onClose={() => setModuleDialog(null)} onSaved={load} programId={programId} canPublish={canPublish} />
      <LessonFormDialog state={lessonDialog} loading={loading} programId={programId} nextOrder={(modules.find((item) => item.id === lessonDialog?.moduleId)?.lessons.length ?? 0) + 1} onClose={() => setLessonDialog(null)} onSaved={load} canPublish={canPublish} canUpload={canUpload} />
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !loading && !open && setDeleteTarget(null)}>
        <DialogContent className="border border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Arsipkan {deleteTarget?.type === 'module' ? 'modul' : 'lesson'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={remove} className="grid gap-5">
            <p className="text-sm text-muted-foreground">Histori aktivitas peserta tetap dipertahankan.</p>
            <div className="grid gap-2">
              <Label htmlFor="material-delete-reason" className="text-foreground">Alasan</Label>
              <Input id="material-delete-reason" required minLength={5} maxLength={1000} value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs">Batal</Button>
              <Button variant="destructive" disabled={loading} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium">{loading ? 'Memproses...' : 'Arsipkan'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ModuleFormDialog({ state, loading, nextOrder, programId, onClose, onSaved, canPublish }: { state: ModuleDialog; loading: boolean; nextOrder: number; programId: number; onClose: () => void; onSaved: () => Promise<void>; canPublish: boolean }) {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [published, setPublished] = useState(false); const [reason, setReason] = useState('');
  useEffect(() => { setTitle(state?.module?.title ?? ''); setDescription(state?.module?.description ?? ''); setPublished(state?.module?.is_published ?? false); setReason(''); }, [state]);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { const payload = { title: title.trim(), description: description.trim() || null, order: state?.module?.order ?? nextOrder, is_published: canPublish && published, reason: reason.trim() }; if (state?.module) await apiClient.learning.curriculum.modules.update(state.module.id, payload); else await apiClient.learning.curriculum.modules.create(programId, payload); await onSaved(); onClose(); alertActions.success('Modul tersimpan', 'Struktur materi berhasil diperbarui.'); } catch (error) { alertActions.error('Modul gagal disimpan', getErrorMessage(error, 'Periksa data modul.')); } };
  if (state?.module?.is_published && !canPublish) return <PublishedContentNotice type="modul" onClose={onClose} />;
  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="border border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{state?.module ? 'Edit modul' : 'Tambah modul'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="module-title" className="text-foreground">Judul</Label>
            <Input id="module-title" required value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="module-description" className="text-foreground">Deskripsi (opsional)</Label>
            <textarea id="module-description" value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 rounded-xl border border-input/60 bg-background/70 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40" />
          </div>
          {canPublish && (
            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="size-4 accent-primary" />
              Publikasikan modul
            </label>
          )}
          {!canPublish && <p className="text-sm text-muted-foreground">Anda dapat menyimpan draft, tetapi tidak memiliki izin publikasi.</p>}
          <div className="grid gap-2">
            <Label htmlFor="module-reason" className="text-foreground">Alasan</Label>
            <Input id="module-reason" required minLength={5} value={reason} onChange={(event) => setReason(event.target.value)} className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs">Batal</Button>
            <Button disabled={loading} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium">Simpan modul</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LessonFormDialog({ state, loading, programId, nextOrder, onClose, onSaved, canPublish, canUpload }: { state: LessonDialog; loading: boolean; programId: number; nextOrder: number; onClose: () => void; onSaved: () => Promise<void>; canPublish: boolean; canUpload: boolean }) {
  const [title, setTitle] = useState(''); const [kind, setKind] = useState<(typeof materialKinds)[number]>('INFORMATION'); const [body, setBody] = useState(''); const [url, setUrl] = useState(''); const [mediaId, setMediaId] = useState<number | null>(null); const [mediaName, setMediaName] = useState(''); const [duration, setDuration] = useState('0'); const [published, setPublished] = useState(false); const [preview, setPreview] = useState(false); const [reason, setReason] = useState(''); const [progress, setProgress] = useState<number | null>(null);
  useEffect(() => { setTitle(state?.lesson?.title ?? ''); setKind(state?.lesson?.content_kind ?? 'INFORMATION'); setBody(state?.lesson?.content_body ?? ''); setUrl(state?.lesson?.external_url ?? ''); setMediaId(state?.lesson?.media_asset?.id ?? null); setMediaName(state?.lesson?.media_asset?.original_name ?? ''); setDuration(String(state?.lesson?.duration_minutes ?? 0)); setPublished(state?.lesson?.is_published ?? false); setPreview(state?.lesson?.is_preview ?? false); setReason(''); setProgress(null); }, [state]);
  const upload = async (file?: File) => { if (!file || !canUpload) return; setProgress(0); try { const response = await apiClient.admin.mediaAssets.upload(programId, file, 'Mengunggah file materi Program', setProgress); if (!response.data) throw new Error('Respons unggah tidak memuat media asset.'); setMediaId(response.data.id); setMediaName(file.name); } catch (error) { alertActions.error('Unggah gagal', getErrorMessage(error, 'File tidak dapat diunggah.')); } finally { setProgress(null); } };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!state) return; try { const payload = { title: title.trim(), content_kind: kind, content_body: body.trim() || null, external_url: url.trim() || null, media_asset_id: mediaId, duration_minutes: Number(duration), order: state.lesson?.order ?? nextOrder, is_published: canPublish && published, is_preview: preview, reason: reason.trim() }; if (state.lesson) await apiClient.learning.curriculum.lessons.update(state.lesson.id, payload); else await apiClient.learning.curriculum.lessons.create(state.moduleId, payload); await onSaved(); onClose(); alertActions.success('Lesson tersimpan', canPublish && published ? 'Lesson sudah tersedia di Workspace.' : 'Lesson tersimpan sebagai draft.'); } catch (error) { alertActions.error('Lesson gagal disimpan', getErrorMessage(error, 'Periksa kelengkapan sesuai jenis materi.')); } };
  const usesBody = kind === 'INFORMATION' || kind === 'EMBEDDED_PAGE'; const usesUrl = kind === 'EXTERNAL_LINK' || kind === 'VIDEO'; const usesFile = kind === 'FILE_DOWNLOAD' || kind === 'VIDEO';
  if (state?.lesson?.is_published && !canPublish) return <PublishedContentNotice type="lesson" onClose={onClose} />;
  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto border border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{state?.lesson ? 'Edit lesson' : 'Tambah lesson'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="lesson-title" className="text-foreground">Judul</Label>
            <Input id="lesson-title" required value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lesson-kind" className="text-foreground">Jenis isi</Label>
            <Select value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
              <SelectTrigger id="lesson-kind" className="h-10 bg-background/70 border-input/60 text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card/95 border-border/60">
                {materialKinds.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {usesBody && (
            <div className="grid gap-2">
              <Label htmlFor="lesson-body" className="text-foreground">Isi</Label>
              <textarea id="lesson-body" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-48 rounded-xl border border-input/60 bg-background/70 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40" />
            </div>
          )}
          {usesUrl && (
            <div className="grid gap-2">
              <Label htmlFor="lesson-url" className="text-foreground">URL HTTPS {kind === 'VIDEO' ? '(opsional bila memakai file)' : ''}</Label>
              <Input id="lesson-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
            </div>
          )}
          {usesFile && canUpload && (
            <div className="grid gap-2">
              <Label htmlFor="lesson-file" className="text-foreground">File privat {kind === 'VIDEO' ? '(opsional bila memakai URL)' : ''}</Label>
              <label htmlFor="lesson-file" className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/40 hover:bg-muted/40 px-4 text-center text-sm text-foreground transition-colors">
                <span>
                  <FileUp className="mx-auto mb-2 size-5 text-primary" />
                  {mediaName || 'Pilih file'}
                  {progress !== null && <span className="mt-1 block text-xs text-muted-foreground">Mengunggah {progress}%</span>}
                </span>
              </label>
              <input id="lesson-file" type="file" className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} />
            </div>
          )}
          {usesFile && !canUpload && <p className="text-sm text-muted-foreground">Anda tidak memiliki izin untuk mengunggah file privat.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="lesson-duration" className="text-foreground">Durasi (menit)</Label>
              <Input id="lesson-duration" type="number" min="0" value={duration} onChange={(event) => setDuration(event.target.value)} className="h-10 text-xs bg-background/70 border-input/60 text-foreground" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-reason" className="text-foreground">Alasan</Label>
              <Input id="lesson-reason" required minLength={5} value={reason} onChange={(event) => setReason(event.target.value)} className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {canPublish && (
              <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="size-4 accent-primary" />
                Published
              </label>
            )}
            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={preview} onChange={(event) => setPreview(event.target.checked)} className="size-4 accent-primary" />
              Preview publik
            </label>
          </div>
          {!canPublish && <p className="text-sm text-muted-foreground">Lesson baru akan disimpan sebagai draft.</p>}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs">Batal</Button>
            <Button disabled={loading} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium">Simpan lesson</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PublishedContentNotice({ type, onClose }: { type: 'modul' | 'lesson'; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{type === 'modul' ? 'Modul sudah terbit' : 'Lesson sudah terbit'}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Anda memerlukan izin publikasi untuk mengubah konten yang telah tersedia bagi peserta.</p>
        <div className="flex justify-end">
          <Button type="button" onClick={onClose} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs">Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
