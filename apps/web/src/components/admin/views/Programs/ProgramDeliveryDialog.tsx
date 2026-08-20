'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Edit3, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import type { BatchMode, Program, ProgramBatch, ProgramSession, ProgramSessionPayload } from '@/types/sales';

interface Props { program: Program | null; open: boolean; onOpenChange: (open: boolean) => void }
function unwrap<T>(value: unknown): T[] { return Array.isArray(value) ? value as T[] : []; }
function local(value: string): string { return value.slice(0, 16); }

export function ProgramDeliveryDialog({ program, open, onOpenChange }: Props) {
  const [batches, setBatches] = useState<ProgramBatch[]>([]);
  const [batchId, setBatchId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [selected, setSelected] = useState<ProgramSession | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [mode, setMode] = useState<BatchMode>('ONLINE');
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [capacity, setCapacity] = useState('');

  const loadSessions = useCallback(async (programId: number, selectedBatchId: number) => {
    const response = await apiClient.admin.programs.batches.sessions.list(programId, selectedBatchId);
    setSessions(unwrap<ProgramSession>(response.data));
  }, []);

  useEffect(() => {
    if (!open || !program) return;
    setLoading(true);
    void apiClient.admin.programs.batches.list(program.id).then(async (response) => {
      const loaded = unwrap<ProgramBatch>(response.data);
      setBatches(loaded);
      const first = loaded[0]?.id ?? null;
      setBatchId(first);
      if (first) await loadSessions(program.id, first);
    }).catch((error) => alertActions.error('Delivery gagal dimuat', getErrorMessage(error, 'Batch dan sesi tidak tersedia.'))).finally(() => setLoading(false));
  }, [loadSessions, open, program]);

  const chooseBatch = async (value: string) => {
    if (!program) return;
    const id = Number(value);
    setBatchId(id); setLoading(true);
    try { await loadSessions(program.id, id); } finally { setLoading(false); }
  };
  const openForm = (session?: ProgramSession) => {
    setSelected(session ?? null); setTitle(session?.title ?? ''); setStartsAt(session ? local(session.starts_at) : ''); setEndsAt(session ? local(session.ends_at) : ''); setMode(session?.mode ?? 'ONLINE'); setLocation(session?.location ?? ''); setMeetingUrl(session?.meeting_url ?? ''); setCapacity(session?.capacity ? String(session.capacity) : ''); setEditing(true);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!program || !batchId) return;
    const payload: ProgramSessionPayload = { title: title.trim(), starts_at: startsAt, ends_at: endsAt, timezone: 'Asia/Makassar', mode, location: location.trim() || null, meeting_url: meetingUrl.trim() || null, capacity: capacity ? Number(capacity) : null, ...(selected ? { reason: 'Memperbarui sesi melalui administrasi Program' } : {}) };
    setLoading(true);
    try { selected ? await apiClient.admin.programs.batches.sessions.update(program.id, batchId, selected.id, payload) : await apiClient.admin.programs.batches.sessions.create(program.id, batchId, payload); await loadSessions(program.id, batchId); setEditing(false); alertActions.success('Sesi tersimpan', `${payload.title} berhasil diperbarui.`); }
    catch (error) { alertActions.error('Sesi gagal disimpan', getErrorMessage(error, 'Periksa waktu, mode, dan lokasi sesi.')); }
    finally { setLoading(false); }
  };
  const remove = async (session: ProgramSession) => {
    if (!program || !batchId || !window.confirm(`Hapus sesi draft ${session.title}?`)) return;
    try { await apiClient.admin.programs.batches.sessions.remove(program.id, batchId, session.id); await loadSessions(program.id, batchId); }
    catch (error) { alertActions.error('Sesi gagal dihapus', getErrorMessage(error, 'Hanya sesi draft kosong yang dapat dihapus.')); }
  };
  const schedule = async (session: ProgramSession) => {
    if (!program || !batchId) return;
    try { await apiClient.admin.programs.batches.sessions.transition(program.id, batchId, session.id, 'SCHEDULED', 'Menjadwalkan sesi melalui administrasi Program'); await loadSessions(program.id, batchId); }
    catch (error) { alertActions.error('Sesi gagal dijadwalkan', getErrorMessage(error, 'Status sesi tidak dapat diubah.')); }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92dvh] max-w-4xl overflow-y-auto bg-white dark:bg-zinc-950"><DialogHeader><DialogTitle>Batch & sesi · {program?.name}</DialogTitle></DialogHeader>{batches.length === 0 && !loading ? <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500">Buat Batch melalui editor Program sebelum menambahkan sesi.</div> : <div className="grid gap-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="grid min-w-64 gap-2"><Label>Batch</Label><Select value={batchId ? String(batchId) : undefined} onValueChange={(value) => void chooseBatch(value)}><SelectTrigger><SelectValue placeholder="Pilih Batch" /></SelectTrigger><SelectContent>{batches.map((batch) => <SelectItem key={batch.id} value={String(batch.id)}>{batch.name} · {batch.code}</SelectItem>)}</SelectContent></Select></div><Button onClick={() => openForm()} disabled={!batchId}><Plus className="mr-2 size-4" />Tambah sesi</Button></div>{editing && <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800 md:grid-cols-2"><div className="grid gap-2 md:col-span-2"><Label htmlFor="session-title">Judul sesi</Label><Input id="session-title" required value={title} onChange={(event) => setTitle(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="session-start">Mulai</Label><Input id="session-start" required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="session-end">Selesai</Label><Input id="session-end" required type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></div><div className="grid gap-2"><Label>Mode</Label><Select value={mode} onValueChange={(value) => setMode(value as BatchMode)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ONLINE">Online</SelectItem><SelectItem value="OFFLINE">Offline</SelectItem><SelectItem value="HYBRID">Hybrid</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label htmlFor="session-capacity">Kapasitas</Label><Input id="session-capacity" type="number" min="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="session-location">Lokasi</Label><Input id="session-location" required={mode !== 'ONLINE'} value={location} onChange={(event) => setLocation(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="session-url">Meeting URL</Label><Input id="session-url" type="url" required={mode !== 'OFFLINE'} value={meetingUrl} onChange={(event) => setMeetingUrl(event.target.value)} /></div><div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="ghost" onClick={() => setEditing(false)}>Batal</Button><Button type="submit" disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan sesi'}</Button></div></form>}<div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">{sessions.map((session) => <article key={session.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><CalendarDays className="mt-1 size-5 text-primary" /><div><h3 className="font-semibold">{session.title}</h3><p className="mt-1 text-sm text-zinc-500">{new Date(session.starts_at).toLocaleString('id-ID')} · {session.mode}</p></div></div><div className="flex items-center gap-2"><Badge variant="outline">{session.status}</Badge><Button variant="ghost" size="icon" aria-label={`Edit ${session.title}`} onClick={() => openForm(session)}><Edit3 className="size-4" /></Button>{session.status === 'DRAFT' && <><Button variant="outline" size="sm" onClick={() => void schedule(session)}>Jadwalkan</Button><Button variant="ghost" size="icon" className="text-red-600" aria-label={`Hapus ${session.title}`} onClick={() => void remove(session)}><Trash2 className="size-4" /></Button></>}</div></article>)}{sessions.length === 0 && !loading && <p className="p-8 text-center text-sm text-zinc-500">Belum ada sesi pada Batch ini.</p>}</div></div>}</DialogContent></Dialog>;
}
