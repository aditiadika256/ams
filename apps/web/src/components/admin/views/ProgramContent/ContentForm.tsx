'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ComponentContentStatus, ComponentHandlerTemplate, ProgramComponentContent, ProgramComponentContentPayload } from '@/types/sales';

interface ContentFormProps {
  handler: Exclude<ComponentHandlerTemplate, 'NATIVE'>;
  initial?: ProgramComponentContent | null;
  loading: boolean;
  uploadProgress: number | null;
  canPublish: boolean;
  canUpload: boolean;
  onUpload: (file: File) => Promise<number>;
  onCancel: () => void;
  onSubmit: (payload: ProgramComponentContentPayload) => Promise<void>;
}

const bodyHandlers: ComponentHandlerTemplate[] = ['INFORMATION', 'EMBEDDED_PAGE'];
const urlHandlers: ComponentHandlerTemplate[] = ['EXTERNAL_LINK', 'VIDEO', 'IFRAME'];
const fileHandlers: ComponentHandlerTemplate[] = ['FILE_DOWNLOAD', 'VIDEO'];

export function ContentForm({ handler, initial, loading, uploadProgress, canPublish, canUpload, onUpload, onCancel, onSubmit }: ContentFormProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [mediaAssetId, setMediaAssetId] = useState<number | null>(null);
  const [mediaName, setMediaName] = useState('');
  const [status, setStatus] = useState<ComponentContentStatus>('DRAFT');
  const [sortOrder, setSortOrder] = useState('0');
  const [reason, setReason] = useState('');
  const [formSchema, setFormSchema] = useState('[\n  { "key": "nama", "label": "Nama", "type": "text", "required": true }\n]');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setSlug(initial?.slug ?? '');
    setSummary(initial?.summary ?? '');
    setBody(initial?.body ?? '');
    setExternalUrl(initial?.external_url ?? '');
    setMediaAssetId(initial?.media_asset?.id ?? null);
    setMediaName(initial?.media_asset?.original_name ?? '');
    setStatus(initial?.status ?? 'DRAFT');
    setSortOrder(String(initial?.sort_order ?? 0));
    setReason('');
    setFormSchema(JSON.stringify(initial?.payload?.fields ?? [{ key: 'nama', label: 'Nama', type: 'text', required: true }], null, 2));
    setSchemaError(null);
  }, [initial]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let payload: Record<string, unknown> | null = initial?.payload ?? null;
    if (handler === 'FORM') {
      try {
        const fields = JSON.parse(formSchema) as unknown;
        if (!Array.isArray(fields)) throw new Error('invalid');
        payload = { fields };
        setSchemaError(null);
      } catch {
        setSchemaError('Field form harus berupa JSON array yang valid.');
        return;
      }
    }

    await onSubmit({
      title: title.trim(),
      slug: slug.trim() || undefined,
      summary: summary.trim() || null,
      body: body.trim() || null,
      external_url: externalUrl.trim() || null,
      media_asset_id: mediaAssetId,
      payload,
      status,
      sort_order: Number(sortOrder),
      reason: reason.trim(),
    });
  };

  const upload = async (file?: File) => {
    if (!file) return;
    const id = await onUpload(file);
    setMediaAssetId(id);
    setMediaName(file.name);
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="content-title">Judul</Label><Input id="content-title" required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} /></div>
        <div className="grid gap-2"><Label htmlFor="content-slug">Slug (opsional)</Label><Input id="content-slug" maxLength={190} value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="Dibuat otomatis dari judul" /></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="content-summary">Ringkasan (opsional)</Label><textarea id="content-summary" maxLength={5000} value={summary} onChange={(event) => setSummary(event.target.value)} className="min-h-20 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-950" /></div>

      {bodyHandlers.includes(handler) && <div className="grid gap-2"><Label htmlFor="content-body">Isi</Label><textarea id="content-body" maxLength={100000} value={body} onChange={(event) => setBody(event.target.value)} className="min-h-48 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-950" /><p className="text-xs text-zinc-500">Disimpan sebagai teks aman; HTML mentah tidak dirender.</p></div>}

      {urlHandlers.includes(handler) && <div className="grid gap-2"><Label htmlFor="content-url">URL HTTPS {handler === 'VIDEO' ? '(opsional bila memakai file)' : ''}</Label><Input id="content-url" type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://" /><p className="text-xs text-zinc-500">Iframe hanya menerima host yang masuk allowlist server.</p></div>}

      {fileHandlers.includes(handler) && <div className="grid gap-2"><Label htmlFor="content-file">File privat {handler === 'VIDEO' ? '(opsional bila memakai URL)' : ''}</Label>{canUpload ? <><label htmlFor="content-file" className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-300 px-4 text-center text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"><span><FileUp className="mx-auto mb-2 size-5 text-primary" />{mediaName || 'Pilih file untuk diunggah'}{uploadProgress !== null && <span className="mt-1 block text-xs text-zinc-500">Mengunggah {uploadProgress}%</span>}</span></label><input id="content-file" type="file" className="sr-only" disabled={loading} onChange={(event) => void upload(event.target.files?.[0])} /></> : <p className="rounded-xl border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 dark:border-zinc-700">Anda tidak memiliki izin untuk mengunggah file baru.</p>}</div>}

      {handler === 'FORM' && <div className="grid gap-2"><Label htmlFor="content-form-schema">Fields form</Label><textarea id="content-form-schema" value={formSchema} spellCheck={false} onChange={(event) => setFormSchema(event.target.value)} className="min-h-52 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-900" aria-invalid={Boolean(schemaError)} />{schemaError ? <p role="alert" className="text-sm text-red-600">{schemaError}</p> : <p className="text-xs text-zinc-500">Type: text, textarea, email, number, select, checkbox, atau date. Select memerlukan options.</p>}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="content-status">Status</Label>{canPublish ? <Select value={status} onValueChange={(value) => setStatus(value as ComponentContentStatus)}><SelectTrigger id="content-status" className="min-h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="PUBLISHED">Published</SelectItem></SelectContent></Select> : <Input id="content-status" value="Draft" disabled />}{!canPublish && <p className="text-xs text-zinc-500">Anda dapat menyimpan draft, tetapi tidak memiliki izin publikasi.</p>}<p className="text-xs text-zinc-500">Draft boleh belum lengkap. Publish menjalankan validasi handler.</p></div>
        <div className="grid gap-2"><Label htmlFor="content-order">Urutan</Label><Input id="content-order" type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="content-reason">Alasan perubahan</Label><Input id="content-reason" required minLength={5} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Contoh: Menambahkan panduan onboarding" /></div>
      <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end dark:border-zinc-800"><Button type="button" variant="ghost" className="min-h-11" onClick={onCancel}>Batal</Button><Button type="submit" className="min-h-11" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan isi'}</Button></div>
    </form>
  );
}
