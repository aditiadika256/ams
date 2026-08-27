'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import type { WorkspaceComponentContent, WorkspaceFormField } from '@/types/workspace';

export function WorkspaceForm({ accessId, componentId, content }: { accessId: number; componentId: number; content: WorkspaceComponentContent }) {
  const fields = useMemo(() => content.payload?.fields ?? [], [content.payload]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await apiClient.workspace.submitComponentForm(accessId, componentId, content.id, answers);
      setSubmittedAt(response.data?.submitted_at ?? new Date().toISOString());
      alertActions.success('Form terkirim', 'Jawaban Anda tersimpan untuk enrollment ini.');
    } catch (error) {
      alertActions.error('Form gagal dikirim', getErrorMessage(error, 'Periksa jawaban atau status enrollment Anda.'));
    } finally { setSubmitting(false); }
  };

  if (submittedAt) return <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><div><p className="font-medium">Form sudah dikirim</p><p className="mt-1 text-sm opacity-80">Tersimpan {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(submittedAt))}.</p></div></div>;

  return <form onSubmit={submit} className="grid gap-5">{fields.map((field) => <WorkspaceField key={field.key} field={field} value={answers[field.key]} onChange={(value) => setAnswers((current) => ({ ...current, [field.key]: value }))} />)}<Button type="submit" className="min-h-11 justify-self-start" disabled={submitting || fields.length === 0}>{submitting ? 'Mengirim...' : 'Kirim form'}</Button></form>;
}

function WorkspaceField({ field, value, onChange }: { field: WorkspaceFormField; value: unknown; onChange: (value: unknown) => void }) {
  const id = `workspace-form-${field.key}`;
  if (field.type === 'checkbox') return <label className="flex min-h-11 items-center gap-3 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-700"><input id={id} type="checkbox" required={field.required} checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-primary" />{field.label}</label>;
  if (field.type === 'textarea') return <div className="grid gap-2"><Label htmlFor={id}>{field.label}{field.required && ' *'}</Label><textarea id={id} required={field.required} maxLength={5000} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} className="min-h-28 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-950" /></div>;
  if (field.type === 'select') return <div className="grid gap-2"><Label htmlFor={id}>{field.label}{field.required && ' *'}</Label><select id={id} required={field.required} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-950"><option value="">Pilih jawaban</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
  return <div className="grid gap-2"><Label htmlFor={id}>{field.label}{field.required && ' *'}</Label><Input id={id} required={field.required} type={field.type} value={String(value ?? '')} onChange={(event) => onChange(field.type === 'number' ? event.target.valueAsNumber : event.target.value)} /></div>;
}
