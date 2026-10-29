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
        <div className="grid gap-2">
          <Label htmlFor="content-title" className="text-foreground">Judul</Label>
          <Input id="content-title" required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="content-slug" className="text-foreground">Slug (opsional)</Label>
          <Input id="content-slug" maxLength={190} value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="Dibuat otomatis dari judul" className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="content-summary" className="text-foreground">Ringkasan (opsional)</Label>
        <textarea id="content-summary" maxLength={5000} value={summary} onChange={(event) => setSummary(event.target.value)} className="min-h-20 rounded-xl border border-input/60 bg-background/70 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40" />
      </div>

      {bodyHandlers.includes(handler) && (
        <div className="grid gap-2">
          <Label htmlFor="content-body" className="text-foreground">Isi</Label>
          <textarea id="content-body" maxLength={100000} value={body} onChange={(event) => setBody(event.target.value)} className="min-h-48 rounded-xl border border-input/60 bg-background/70 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40" />
          <p className="text-xs text-muted-foreground">Disimpan sebagai teks aman; HTML mentah tidak dirender.</p>
        </div>
      )}

      {urlHandlers.includes(handler) && (
        <div className="grid gap-2">
          <Label htmlFor="content-url" className="text-foreground">URL HTTPS {handler === 'VIDEO' ? '(opsional bila memakai file)' : ''}</Label>
          <Input id="content-url" type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://" className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Iframe hanya menerima host yang masuk allowlist server.</p>
        </div>
      )}

      {fileHandlers.includes(handler) && (
        <div className="grid gap-2">
          <Label htmlFor="content-file" className="text-foreground">File privat {handler === 'VIDEO' ? '(opsional bila memakai URL)' : ''}</Label>
          {canUpload ? (
            <>
              <label htmlFor="content-file" className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/40 px-4 text-center text-sm text-foreground hover:bg-muted/40 transition-colors">
                <span>
                  <FileUp className="mx-auto mb-2 size-5 text-primary" />
                  {mediaName || 'Pilih file untuk diunggah'}
                  {uploadProgress !== null && <span className="mt-1 block text-xs text-muted-foreground">Mengunggah {uploadProgress}%</span>}
                </span>
              </label>
              <input id="content-file" type="file" className="sr-only" disabled={loading} onChange={(event) => void upload(event.target.files?.[0])} />
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-border/80 p-3 text-sm text-muted-foreground">Anda tidak memiliki izin untuk mengunggah file baru.</p>
          )}
        </div>
      )}

      {handler === 'FORM' && (
        <div className="grid gap-2">
          <Label htmlFor="content-form-schema" className="text-foreground">Fields form</Label>
          <textarea id="content-form-schema" value={formSchema} spellCheck={false} onChange={(event) => setFormSchema(event.target.value)} className="min-h-52 rounded-xl border border-input/60 bg-muted/40 px-3 py-3 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40" aria-invalid={Boolean(schemaError)} />
          {schemaError ? <p role="alert" className="text-sm text-destructive">{schemaError}</p> : <p className="text-xs text-muted-foreground">Type: text, textarea, email, number, select, checkbox, atau date. Select memerlukan options.</p>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="content-status" className="text-foreground">Status</Label>
          {canPublish ? (
            <Select value={status} onValueChange={(value) => setStatus(value as ComponentContentStatus)}>
              <SelectTrigger id="content-status" className="min-h-10 bg-background/70 border-input/60 text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card/95 border-border/60">
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input id="content-status" value="Draft" disabled className="h-10 bg-muted text-muted-foreground" />
          )}
          {!canPublish && <p className="text-xs text-muted-foreground">Anda dapat menyimpan draft, tetapi tidak memiliki izin publikasi.</p>}
          <p className="text-xs text-muted-foreground">Draft boleh belum lengkap. Publish menjalankan validasi handler.</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="content-order" className="text-foreground">Urutan</Label>
          <Input id="content-order" type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="h-10 bg-background/70 border-input/60 text-foreground" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="content-reason" className="text-foreground">Alasan perubahan</Label>
        <Input id="content-reason" required minLength={5} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Contoh: Menambahkan panduan onboarding" className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs" onClick={onCancel}>Batal</Button>
        <Button type="submit" className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan isi'}</Button>
      </div>
    </form>
  );
}
