'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Archive, Edit3, FileText, MoreHorizontal, Plus, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import type { ComponentHandlerTemplate, ProgramComponent, ProgramComponentContent, ProgramComponentContentPayload } from '@/types/sales';
import { ContentForm } from './ContentForm';

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value) return ((value as { data?: T[] }).data ?? []);
  return [];
}

interface GenericContentEditorProps { programId: number; component: ProgramComponent; canManage: boolean; canPublish: boolean; canUpload: boolean }

export function GenericContentEditor({ programId, component, canManage, canPublish, canUpload }: GenericContentEditorProps) {
  const [contents, setContents] = useState<ProgramComponentContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<ProgramComponentContent | null>(null);
  const [archiving, setArchiving] = useState<ProgramComponentContent | null>(null);
  const [reason, setReason] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const componentId = component.id as number;
  const handler = component.handler_template as Exclude<ComponentHandlerTemplate, 'NATIVE'>;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.admin.programContents.list(programId, componentId, { include_archived: true });
      setContents(unwrapArray<ProgramComponentContent>(response.data));
    } catch (error) {
      alertActions.error('Isi component gagal dimuat', getErrorMessage(error, 'Coba muat ulang halaman.'));
    } finally { setLoading(false); }
  }, [componentId, programId]);

  useEffect(() => { void load(); }, [load]);

  const save = async (payload: ProgramComponentContentPayload) => {
    setLoading(true);
    try {
      if (selected) await apiClient.admin.programContents.update(programId, componentId, selected.id, payload);
      else await apiClient.admin.programContents.create(programId, componentId, payload);
      await load();
      setDialogOpen(false);
      setSelected(null);
      alertActions.success('Isi tersimpan', payload.status === 'PUBLISHED' ? 'Isi tersedia untuk peserta yang berhak.' : 'Draft berhasil disimpan.');
    } catch (error) {
      alertActions.error('Isi gagal disimpan', getErrorMessage(error, 'Periksa field sesuai template handler.'));
      setLoading(false);
    }
  };

  const upload = async (file: File) => {
    setUploadProgress(0);
    try {
      const response = await apiClient.admin.mediaAssets.upload(programId, file, 'Mengunggah file untuk isi component', setUploadProgress);
      if (!response.data) throw new Error('Respons unggah tidak memuat media asset.');
      return response.data.id;
    } catch (error) {
      alertActions.error('Unggah gagal', getErrorMessage(error, 'File tidak dapat diunggah.'));
      throw error;
    } finally { setUploadProgress(null); }
  };

  const changeArchive = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!archiving) return;
    setLoading(true);
    try {
      if (archiving.deleted_at) await apiClient.admin.programContents.restore(programId, componentId, archiving.id, reason);
      else await apiClient.admin.programContents.archive(programId, componentId, archiving.id, reason);
      setArchiving(null); setReason(''); await load();
      alertActions.success('Isi diperbarui', 'Status arsip berhasil diperbarui.');
    } catch (error) {
      alertActions.error('Aksi gagal', getErrorMessage(error, 'Isi tidak dapat diproses.'));
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border/60 bg-card/85 backdrop-blur-xl rounded-2xl shadow-sm">
      <CardHeader className="gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg text-foreground">Isi {component.label || component.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Template {handler}. Item baru dimulai sebagai draft bila belum siap.</p>
        </div>
        {canManage && (
          <Button className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium" onClick={() => { setSelected(null); setDialogOpen(true); }}>
            <Plus className="mr-2 size-4" />Tambah isi
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {loading && contents.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Memuat isi...</div>
        ) : contents.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <FileText className="mx-auto mb-3 size-8 text-muted-foreground/60" />
              <p className="font-semibold text-foreground">Belum ada isi</p>
              <p className="mt-1 text-sm text-muted-foreground">Buat draft pertama untuk component ini.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {contents.map((content) => (
              <article key={content.id} className="flex items-center gap-4 p-4 sm:px-6 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-foreground">{content.title}</h3>
                    <Badge variant={content.status === 'PUBLISHED' ? 'default' : 'secondary'} className={content.status === 'PUBLISHED' ? 'bg-primary text-primary-foreground text-[10px]' : 'text-[10px]'}>
                      {content.deleted_at ? 'ARCHIVED' : content.status}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{content.summary || content.slug}</p>
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="min-h-10 min-w-10 text-muted-foreground hover:text-foreground" aria-label={`Aksi ${content.title}`}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card/95 border-border/60">
                      {!content.deleted_at && (content.status !== 'PUBLISHED' || canPublish) && (
                        <DropdownMenuItem onClick={() => { setSelected(content); setDialogOpen(true); }}>
                          <Edit3 className="mr-2 size-4" />Edit
                        </DropdownMenuItem>
                      )}
                      {!content.deleted_at ? (
                        <DropdownMenuItem onClick={() => { setArchiving(content); setReason(''); }}>
                          <Archive className="mr-2 size-4" />Arsipkan
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => { setArchiving(content); setReason(''); }}>
                          <RefreshCcw className="mr-2 size-4" />Pulihkan
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </article>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(open) => !loading && setDialogOpen(open)}>
        <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto border border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selected ? `Edit ${selected.title}` : `Tambah isi ${component.label || component.name}`}</DialogTitle>
          </DialogHeader>
          <ContentForm handler={handler} initial={selected} loading={loading} uploadProgress={uploadProgress} canPublish={canPublish} canUpload={canUpload} onUpload={upload} onCancel={() => setDialogOpen(false)} onSubmit={save} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(archiving)} onOpenChange={(open) => !loading && !open && setArchiving(null)}>
        <DialogContent className="border border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{archiving?.deleted_at ? 'Pulihkan isi' : 'Arsipkan isi'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={changeArchive} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="content-archive-reason" className="text-foreground">Alasan</Label>
              <Input id="content-archive-reason" required minLength={5} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setArchiving(null)} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs">Batal</Button>
              <Button disabled={loading} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium">{loading ? 'Memproses...' : 'Konfirmasi'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
