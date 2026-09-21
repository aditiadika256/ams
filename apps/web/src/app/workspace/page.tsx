'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Archive, BookOpen, CalendarDays, Clock3, FileQuestion, GraduationCap,
  KeyRound, Layers3, RotateCcw, Search, Sparkles, Video, Users
} from 'lucide-react';
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
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { MentorWorkspaceView } from '@/components/workspace/MentorWorkspaceView';
import type { AccessStatus, WorkspaceAccess } from '@/types/workspace';

const filters: Array<{ label: string; value?: AccessStatus }> = [
  { label: 'Aktif', value: 'ACTIVE' },
  { label: 'Menunggu', value: 'WAITING' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Semua' },
];

function date(value?: string | null): string {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Belum dijadwalkan';
}

function AccessCard({ access, onArchive, onRestore }: { access: WorkspaceAccess; onArchive: (id: number) => void; onRestore: (id: number) => void }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full overflow-hidden border-zinc-200 shadow-none transition-colors hover:border-primary/40 dark:border-zinc-800 flex flex-col">
        <div className="h-2 bg-primary" />
        <CardContent className="grid h-full gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></div>
            <div className="flex flex-wrap justify-end gap-2">
              <Badge variant={access.status === 'ACTIVE' ? 'default' : 'secondary'}>{access.status}</Badge>
              {access.batch && <Badge variant="outline">{access.batch.code}</Badge>}
            </div>
          </div>
          <div>
            <h2 className="line-clamp-2 text-xl font-semibold tracking-tight">{access.program.name}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{access.program.short_description || 'Enrollment Program Anda.'}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">{access.program.tags.map((tag) => <Badge key={tag.code} variant="secondary" className="font-normal">{tag.name}</Badge>)}</div>

          <dl className="grid gap-2 text-sm text-zinc-500">
            <div className="flex items-center gap-2"><Layers3 className="size-4" /><span>{access.batch?.name || 'On-demand'}</span></div>
            <div className="flex items-center gap-2"><CalendarDays className="size-4" /><span>{access.next_session ? access.next_session.title : 'Tidak ada sesi mendatang'}</span></div>
            {access.next_session && <div className="flex items-center gap-2"><Clock3 className="size-4" /><span>{date(access.next_session.starts_at)}</span></div>}
          </dl>

          {/* Progress Tracker Bar */}
          <div>
            <div className="mb-2 flex justify-between text-xs text-zinc-500">
              <span className="font-medium">Progress Belajar</span>
              <span className="font-semibold text-primary">{access.progress.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <motion.div initial={{ width: 0 }} animate={{ width: `${access.progress.percent}%` }} className="h-full bg-primary" />
            </div>
          </div>

          {/* Quick Action Buttons: Class, Assessment, Schedule */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t text-xs">
            <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs gap-1">
              <Link href={`/workspace/accesses/${access.id}#material`}>
                <BookOpen className="size-3.5" />
                Class
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs gap-1">
              <Link href={`/exams?program_access_id=${access.id}`}>
                <FileQuestion className="size-3.5 text-amber-600" />
                Assessment
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs gap-1">
              <Link href={`/workspace/accesses/${access.id}#next-session`}>
                <Video className="size-3.5 text-blue-600" />
                Jadwal
              </Link>
            </Button>
          </div>

          <div className="mt-auto grid gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800 sm:grid-cols-[1fr_auto]">
            <Button asChild className="w-full"><Link href={`/workspace/accesses/${access.id}`}>{access.status === 'ACTIVE' ? 'Buka Workspace' : 'Lihat Detail'}</Link></Button>
            {access.archived_at ? <Button variant="ghost" size="icon" aria-label={`Pulihkan ${access.program.name}`} onClick={() => onRestore(access.id)}><RotateCcw className="size-4" /></Button> : <Button variant="ghost" size="icon" aria-label={`Arsipkan ${access.program.name}`} onClick={() => onArchive(access.id)}><Archive className="size-4" /></Button>}
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}

export default function WorkspacePage() {
  const { user } = useAuthStore();
  const { accesses, page, summary, loading, error, fetchWorkspace, archive, restore } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<'student' | 'mentor'>('student');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AccessStatus | undefined>('ACTIVE');
  const [archived, setArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [code, setCode] = useState('');
  const [codeType, setCodeType] = useState<'enrollment-code' | 'voucher'>('enrollment-code');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (activeTab === 'student') {
      const timeout = window.setTimeout(() => {
        void fetchWorkspace({ search: search || undefined, status, archived: archived ? 1 : 0, page: currentPage, per_page: 12, sort_by: 'last_accessed_at', sort_dir: 'desc' });
      }, 250);
      return () => window.clearTimeout(timeout);
    }
  }, [activeTab, archived, currentPage, fetchWorkspace, search, status]);

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

  const isMentor = user?.roles?.some((r: any) => (typeof r === 'string' ? r : r.name).toLowerCase().includes('mentor'));

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="grid gap-6 border-b border-zinc-200 pb-8 dark:border-zinc-800 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {activeTab === 'student' ? 'Arkanin Plus (A+) Learning' : 'Arkanin Teams (A-Teams)'}
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Workspace</h1>
            <p className="mt-3 max-w-2xl text-zinc-500">
              {activeTab === 'student'
                ? 'Semua program belajar, jadwal tatap muka, dan asesmen CBT Anda dalam satu antarmuka terstruktur.'
                : 'Portal mengajar pengajar Arkanin: presensi kelas real-time, jadwal mengajar, dan rekap honor digital.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-3">
            {/* Mode Switch: Student A+ vs Mentor A-Teams */}
            <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'student' ? 'bg-white text-foreground shadow-sm dark:bg-zinc-800' : 'text-zinc-500 hover:text-foreground'
                }`}
              >
                <BookOpen className="size-3.5" />
                Siswa (A+)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mentor')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'mentor' ? 'bg-white text-foreground shadow-sm dark:bg-zinc-800' : 'text-zinc-500 hover:text-foreground'
                }`}
              >
                <GraduationCap className="size-3.5" />
                Mengajar (A-Teams)
              </button>
            </div>

            {activeTab === 'student' && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-zinc-100 px-3.5 py-2 dark:bg-zinc-900"><strong className="block text-lg">{summary.ACTIVE ?? 0}</strong><span className="text-xs text-zinc-500">Aktif</span></div>
                <div className="rounded-xl bg-zinc-100 px-3.5 py-2 dark:bg-zinc-900"><strong className="block text-lg">{summary.WAITING ?? 0}</strong><span className="text-xs text-zinc-500">Menunggu</span></div>
                <div className="rounded-xl bg-zinc-100 px-3.5 py-2 dark:bg-zinc-900"><strong className="block text-lg">{summary.COMPLETED ?? 0}</strong><span className="text-xs text-zinc-500">Selesai</span></div>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'mentor' ? (
          <div className="mt-8">
            <MentorWorkspaceView />
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
