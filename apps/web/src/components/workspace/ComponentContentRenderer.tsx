'use client';

import { useEffect, useState } from 'react';
import { Download, ExternalLink, FileText, LoaderCircle, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import type { WorkspaceComponent, WorkspaceComponentContent, WorkspaceMediaAsset } from '@/types/workspace';
import { WorkspaceForm } from './WorkspaceForm';

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value) return ((value as { data?: T[] }).data ?? []);
  return [];
}

export function ComponentContentRenderer({ accessId, component, onClose }: { accessId: number; component: WorkspaceComponent; onClose: () => void }) {
  const [contents, setContents] = useState<WorkspaceComponentContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void apiClient.workspace.componentContents(accessId, component.id)
      .then((response) => { if (active) setContents(unwrapArray<WorkspaceComponentContent>(response.data)); })
      .catch((error) => { if (active) { setContents([]); alertActions.error('Isi gagal dimuat', getErrorMessage(error, 'Component tidak dapat dibuka.')); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessId, component.id]);

  return <section id={`component-${component.id}`} className="my-10 scroll-mt-24" aria-labelledby={`component-title-${component.id}`}><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{component.handler_template}</p><h2 id={`component-title-${component.id}`} className="mt-2 text-2xl font-semibold">{component.label || component.name}</h2></div><Button type="button" variant="ghost" size="icon" className="min-h-11 min-w-11" onClick={onClose} aria-label="Tutup isi component"><X className="size-4" /></Button></div>{loading ? <div className="grid min-h-40 place-items-center rounded-2xl border border-zinc-200 dark:border-zinc-800"><LoaderCircle className="size-6 animate-spin text-primary motion-reduce:animate-none" /></div> : contents.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500">Belum ada isi terbit untuk component ini.</div> : <div className="grid gap-4">{contents.map((content) => <ContentItem key={content.id} accessId={accessId} component={component} content={content} />)}</div>}</section>;
}

function ContentItem({ accessId, component, content }: { accessId: number; component: WorkspaceComponent; content: WorkspaceComponentContent }) {
  return <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardHeader><CardTitle className="text-lg">{content.title}</CardTitle>{content.summary && <p className="text-sm leading-6 text-zinc-500">{content.summary}</p>}</CardHeader><CardContent className="grid gap-5">
    {(component.handler_template === 'INFORMATION' || component.handler_template === 'EMBEDDED_PAGE') && <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">{content.body}</div>}
    {component.handler_template === 'EXTERNAL_LINK' && content.external_url && <Button asChild className="justify-self-start"><a href={content.external_url} target="_blank" rel="noopener noreferrer">Buka tautan<ExternalLink className="ml-2 size-4" /></a></Button>}
    {component.handler_template === 'FILE_DOWNLOAD' && content.media_asset && <WorkspaceMediaButton asset={content.media_asset} label="Unduh file" />}
    {component.handler_template === 'VIDEO' && content.media_asset && <WorkspaceMediaButton asset={content.media_asset} label="Buka video" />}
    {component.handler_template === 'VIDEO' && !content.media_asset && content.external_url && <Button asChild className="justify-self-start"><a href={content.external_url} target="_blank" rel="noopener noreferrer"><Play className="mr-2 size-4" />Buka video</a></Button>}
    {component.handler_template === 'FORM' && <WorkspaceForm accessId={accessId} componentId={component.id} content={content} />}
    {component.handler_template === 'IFRAME' && content.external_url && <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"><iframe src={content.external_url} title={content.title} sandbox="allow-forms allow-popups allow-scripts" referrerPolicy="no-referrer" loading="lazy" className="h-[520px] w-full bg-white" /></div>}
  </CardContent></Card>;
}

export function WorkspaceMediaButton({ asset, label }: { asset: WorkspaceMediaAsset; label: string }) {
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    try {
      const response = await apiClient.workspace.downloadMedia(asset.download_url);
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.target = '_blank'; anchor.rel = 'noopener'; anchor.download = asset.original_name;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      alertActions.error('File gagal dibuka', getErrorMessage(error, 'Hak akses file tidak valid atau file tidak tersedia.'));
    } finally { setLoading(false); }
  };
  return <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900 sm:flex-row sm:items-center"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-primary dark:bg-zinc-950"><FileText className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{asset.original_name}</p><p className="text-xs text-zinc-500">{asset.mime_type} · {(asset.size_bytes / 1024 / 1024).toFixed(2)} MB</p></div><Button type="button" variant="outline" className="min-h-11" disabled={loading} onClick={() => void open()}><Download className="mr-2 size-4" />{loading ? 'Membuka...' : label}</Button></div>;
}
