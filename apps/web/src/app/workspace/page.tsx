'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Archive, BookOpen, CalendarDays, Clock3, KeyRound, Layers3, RotateCcw, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { alertActions } from '@/store/useAlertStore';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import type { AccessStatus, WorkspaceAccess } from '@/types/workspace';

const filters: Array<{ label: string; value?: AccessStatus }> = [
  { label: 'Semua' }, { label: 'Aktif', value: 'ACTIVE' }, { label: 'Menunggu', value: 'WAITING' },
  { label: 'Selesai', value: 'COMPLETED' }, { label: 'Ditangguhkan', value: 'SUSPENDED' },
];

function date(value?: string | null): string {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Belum dijadwalkan';
}

function AccessCard({ access, onArchive, onRestore }: { access: WorkspaceAccess; onArchive: (id: number) => void; onRestore: (id: number) => void }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full overflow-hidden border-zinc-200 shadow-none transition-colors hover:border-primary/40 dark:border-zinc-800">
        <div className="h-2 bg-primary" />
        <CardContent className="grid h-full gap-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></div>
            <div className="flex flex-wrap justify-end gap-2"><Badge>{access.status}</Badge>{access.batch && <Badge variant="outline">{access.batch.code}</Badge>}</div>
          </div>
          <div><h2 className="line-clamp-2 text-xl font-semibold tracking-tight">{access.program.name}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{access.program.short_description || 'Enrollment Program Anda.'}</p></div>
          <div className="flex flex-wrap gap-1.5">{access.program.tags.map((tag) => <Badge key={tag.code} variant="secondary" className="font-normal">{tag.name}</Badge>)}</div>
          <dl className="grid gap-2 text-sm text-zinc-500">
            <div className="flex items-center gap-2"><Layers3 className="size-4" /><span>{access.batch?.name || 'On-demand'}</span></div>
            <div className="flex items-center gap-2"><CalendarDays className="size-4" /><span>{access.next_session ? access.next_session.title : 'Tidak ada sesi mendatang'}</span></div>
            {access.next_session && <div className="flex items-center gap-2"><Clock3 className="size-4" /><span>{date(access.next_session.starts_at)}</span></div>}
          </dl>
          <div><div className="mb-2 flex justify-between text-xs text-zinc-500"><span>Progress</span><span>{access.progress.percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><motion.div initial={{ width: 0 }} animate={{ width: `${access.progress.percent}%` }} className="h-full bg-primary" /></div></div>
          <div className="mt-auto grid gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800 sm:grid-cols-[1fr_auto]">
            <Button asChild><Link href={`/workspace/accesses/${access.id}`}>{access.status === 'ACTIVE' ? 'Buka workspace' : 'Lihat detail'}</Link></Button>
            {access.archived_at ? <Button variant="ghost" size="icon" aria-label={`Pulihkan ${access.program.name}`} onClick={() => onRestore(access.id)}><RotateCcw className="size-4" /></Button> : <Button variant="ghost" size="icon" aria-label={`Arsipkan ${access.program.name}`} onClick={() => onArchive(access.id)}><Archive className="size-4" /></Button>}
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}

export default function WorkspacePage() {
  const { accesses, page, summary, loading, error, fetchWorkspace, archive, restore } = useWorkspaceStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AccessStatus | undefined>();
  const [archived, setArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [code, setCode] = useState('');
  const [codeType, setCodeType] = useState<'enrollment-code' | 'voucher'>('enrollment-code');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchWorkspace({ search: search || undefined, status, archived: archived ? 1 : 0, page: currentPage, per_page: 12, sort_by: 'last_accessed_at', sort_dir: 'desc' });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [archived, currentPage, fetchWorkspace, search, status]);

  const handleArchive = async (id: number) => {
    try {
      await archive(id);
      alertActions.success('Kartu diarsipkan', 'Entitlement tetap aktif dan dapat dipulihkan kapan saja.');
    } catch {
      alertActions.error('Gagal mengarsipkan', 'Kartu Workspace tidak dapat diarsipkan.');
    }
  };
  const handleRestore = async (id: number) => {
    try { await restore(id); alertActions.success('Kartu dipulihkan', 'Enrollment kembali tampil di Workspace utama.'); }
    catch { alertActions.error('Gagal memulihkan', 'Kartu Workspace tidak dapat dipulihkan.'); }
  };

  const redeemCode = async () => {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length < 4) return;
    setRedeeming(true);
    try {
      const storageKey = `redeem:${codeType}:${normalizedCode}`;
      const existingKey = window.sessionStorage.getItem(storageKey);
      const idempotencyKey = existingKey || crypto.randomUUID();
      window.sessionStorage.setItem(storageKey, idempotencyKey);
      await apiClient.access.redeem(codeType, normalizedCode, idempotencyKey);
      setCode('');
      await fetchWorkspace({ per_page: 12 });
      alertActions.success('Kode berhasil digunakan', 'Enrollment telah ditambahkan ke Workspace.');
    } catch (requestError) {
      alertActions.error('Kode tidak dapat digunakan', getErrorMessage(requestError, 'Periksa tipe dan masa berlaku kode.'));
    } finally { setRedeeming(false); }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="grid gap-6 border-b border-zinc-200 pb-8 dark:border-zinc-800 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Personal learning</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Workspace</h1><p className="mt-3 max-w-2xl text-zinc-500">Semua enrollment, batch, sesi berikutnya, dan komponen belajar Anda dalam satu tempat.</p></div>
          <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-900"><strong className="block text-xl">{summary.ACTIVE ?? 0}</strong><span className="text-xs text-zinc-500">Aktif</span></div><div className="rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-900"><strong className="block text-xl">{summary.WAITING ?? 0}</strong><span className="text-xs text-zinc-500">Menunggu</span></div><div className="rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-900"><strong className="block text-xl">{summary.COMPLETED ?? 0}</strong><span className="text-xs text-zinc-500">Selesai</span></div></div>
        </header>

        <section className="my-6 grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><KeyRound className="size-5" /></div><div><h2 className="text-sm font-semibold">Punya kode akses?</h2><p className="text-xs text-zinc-500">Voucher atau enrollment code</p></div></div>
          <div className="grid gap-2 sm:grid-cols-[auto_1fr]"><div className="flex rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"><button type="button" className={`min-h-9 rounded-lg px-3 text-xs font-medium ${codeType === 'enrollment-code' ? 'bg-primary text-primary-foreground' : 'text-zinc-500'}`} onClick={() => setCodeType('enrollment-code')}>Enrollment</button><button type="button" className={`min-h-9 rounded-lg px-3 text-xs font-medium ${codeType === 'voucher' ? 'bg-primary text-primary-foreground' : 'text-zinc-500'}`} onClick={() => setCodeType('voucher')}>Voucher</button></div><Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Masukkan kode" className="min-h-11 bg-white font-mono uppercase dark:bg-zinc-950" /></div>
          <Button disabled={redeeming || code.trim().length < 4} onClick={() => void redeemCode()}>{redeeming ? 'Memproses…' : 'Gunakan kode'}</Button>
        </section>

        <section className="my-6 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
          <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} placeholder="Cari Program, Batch, atau tag" className="min-h-11 pl-9" /></div>
          <div className="flex gap-2 overflow-x-auto pb-1">{filters.map((filter) => <Button key={filter.label} variant={status === filter.value && !archived ? 'default' : 'outline'} size="sm" className="min-h-11 shrink-0" onClick={() => { setStatus(filter.value); setArchived(false); setCurrentPage(1); }}>{filter.label}</Button>)}<Button variant={archived ? 'default' : 'outline'} size="sm" className="min-h-11 shrink-0" onClick={() => { setArchived(true); setStatus(undefined); setCurrentPage(1); }}>Arsip ({summary.ARCHIVED ?? 0})</Button></div>
        </section>

        {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
        {loading && accesses.length === 0 ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />)}</div> : accesses.length === 0 ? (
          <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700"><div><BookOpen className="mx-auto mb-4 size-10 text-zinc-400" /><h2 className="text-xl font-semibold">{archived ? 'Arsip masih kosong' : 'Belum ada enrollment'}</h2><p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">{archived ? 'Kartu yang Anda arsipkan akan tampil di sini.' : 'Temukan Program di katalog atau gunakan kode enrollment yang diberikan admin.'}</p>{!archived && <Button asChild className="mt-5"><Link href="/programs">Jelajahi Program</Link></Button>}</div></div>
        ) : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{accesses.map((access) => <AccessCard key={access.id} access={access} onArchive={handleArchive} onRestore={handleRestore} />)}</div>}

        {page && page.last_page > 1 && <div className="mt-8"><PaginationControls currentPage={page.current_page} lastPage={page.last_page} total={page.total} from={page.from ?? 0} to={page.to ?? 0} onPageChange={setCurrentPage} itemLabel="enrollment" isLoading={loading} /></div>}
      </main>
    </ProtectedRoute>
  );
}
