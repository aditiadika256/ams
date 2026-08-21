'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Award, Bell, BookOpen, CalendarDays, CheckCircle2, ExternalLink, FileQuestion, FolderOpen, RotateCcw, UserRound, Video } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import type { CurriculumModule, WorkspaceSessionUpdate } from '@/types/workspace';

function date(value?: string | null): string {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value)) : 'Belum dijadwalkan';
}

const componentIcons: Record<string, typeof BookOpen> = {
  material: BookOpen, assessment: FileQuestion, meeting: Video, certificate: Award,
};

const componentRoutes: Record<string, (accessId: number) => string> = {
  material: () => '#material',
  assessment: (accessId) => `/exams?program_access_id=${accessId}`,
  meeting: () => '#next-session',
  certificate: () => '#certificate',
};

export default function WorkspaceDetailPage() {
  const params = useParams<{ accessId: string }>();
  const accessId = Number(params.accessId);
  const { currentAccess, loading, error, fetchAccess, restore } = useWorkspaceStore();
  const [curriculum, setCurriculum] = useState<CurriculumModule[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [completingLesson, setCompletingLesson] = useState<number | null>(null);
  const [sessionUpdates, setSessionUpdates] = useState<WorkspaceSessionUpdate[]>([]);
  const [reservingMentor, setReservingMentor] = useState<number | null>(null);

  useEffect(() => { if (Number.isInteger(accessId)) void fetchAccess(accessId); }, [accessId, fetchAccess]);
  useEffect(() => {
    if (!currentAccess?.components?.some((component) => component.code === 'material')) return;
    setCurriculumLoading(true);
    void apiClient.workspace.curriculum(currentAccess.id)
      .then((response) => setCurriculum(response.data ?? []))
      .catch(() => setCurriculum([]))
      .finally(() => setCurriculumLoading(false));
  }, [currentAccess]);
  useEffect(() => {
    if (!currentAccess) { setSessionUpdates([]); return; }
    void apiClient.workspace.sessionUpdates()
      .then((response) => setSessionUpdates(
        (response.data ?? []).filter((update) => update.program_access_id === currentAccess.id),
      ))
      .catch(() => setSessionUpdates([]));
  }, [currentAccess?.id]);

  if (loading && !currentAccess) return <div className="mx-auto grid min-h-[60vh] max-w-6xl place-items-center px-4"><div className="size-10 animate-spin rounded-full border-4 border-zinc-200 border-t-primary" /></div>;
  if (!currentAccess || error) return <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 text-center"><div><h1 className="text-2xl font-semibold">Enrollment tidak ditemukan</h1><p className="mt-2 text-zinc-500">{error || 'Akses ini tidak tersedia di Workspace Anda.'}</p><Button asChild className="mt-5"><Link href="/workspace">Kembali ke Workspace</Link></Button></div></div>;

  const access = currentAccess;
  const handleRestore = async () => {
    try { await restore(access.id); await fetchAccess(access.id); alertActions.success('Kartu dipulihkan', 'Enrollment kembali tampil di Workspace utama.'); }
    catch { alertActions.error('Gagal memulihkan', 'Kartu tidak dapat dipulihkan.'); }
  };
  const completeLesson = async (lessonId: number) => {
    setCompletingLesson(lessonId);
    try {
      await apiClient.workspace.completeLesson(access.id, lessonId, `lesson-${access.id}-${lessonId}`);
      await fetchAccess(access.id);
      alertActions.success('Progress tersimpan', 'Lesson ditandai selesai untuk enrollment ini.');
    } catch {
      alertActions.error('Progress gagal disimpan', 'Coba kembali setelah memastikan akses masih aktif.');
    } finally {
      setCompletingLesson(null);
    }
  };
  const reserveMentor = async (assignmentId: number) => {
    if (!access.next_session) return;
    setReservingMentor(assignmentId);
    try {
      await apiClient.workspace.reserveMentor(
        access.id,
        access.next_session.id,
        assignmentId,
        `mentor:${access.id}:${access.next_session.id}:${assignmentId}`,
      );
      await fetchAccess(access.id);
      alertActions.success('Mentor dipilih', 'Slot mentor untuk sesi ini berhasil diamankan.');
    } catch {
      alertActions.error('Mentor tidak dapat dipilih', 'Slot mungkin sudah penuh atau enrollment tidak lagi aktif.');
    } finally {
      setReservingMentor(null);
    }
  };
  const acknowledgeUpdate = async (updateId: number) => {
    try {
      const response = await apiClient.workspace.acknowledgeSessionUpdate(updateId);
      setSessionUpdates((items) => items.map((item) => item.id === updateId ? (response.data ?? item) : item));
    } catch {
      alertActions.error('Pembaruan belum ditandai', 'Coba lagi beberapa saat lagi.');
    }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6 -ml-3"><Link href="/workspace"><ArrowLeft className="mr-2 size-4" />Workspace</Link></Button>
        <section className="grid gap-8 border-b border-zinc-200 pb-8 dark:border-zinc-800 lg:grid-cols-[1fr_300px]">
          <div><div className="mb-4 flex flex-wrap gap-2"><Badge>{access.status}</Badge>{access.batch && <Badge variant="outline">{access.batch.code}</Badge>}{access.program.tags.map((tag) => <Badge key={tag.code} variant="secondary">{tag.name}</Badge>)}</div><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{access.program.name}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-zinc-500">{access.program.description || access.program.short_description || 'Detail Program untuk enrollment ini.'}</p></div>
          <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="grid gap-4 p-5"><div><span className="text-xs uppercase tracking-wide text-zinc-500">Enrollment</span><p className="mt-1 font-medium">#{access.id} · {access.source_type}</p></div><div><span className="text-xs uppercase tracking-wide text-zinc-500">Periode akses</span><p className="mt-1 text-sm">{date(access.starts_at)}<br />hingga {date(access.ends_at)}</p></div>{access.archived_at && <Button variant="outline" onClick={() => void handleRestore()}><RotateCcw className="mr-2 size-4" />Pulihkan kartu</Button>}</CardContent></Card>
        </section>

        {access.next_session && <section id="next-session" className="my-8 scroll-mt-24 rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><CalendarDays className="mt-1 size-5 text-primary" aria-hidden="true" /><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Sesi berikutnya</p><h2 className="mt-1 text-lg font-semibold">{access.next_session.title}</h2><p className="mt-1 text-sm text-zinc-500">{date(access.next_session.starts_at)} · {access.next_session.mode}</p></div></div>{access.next_session.meeting_url && <Button asChild><a href={access.next_session.meeting_url} target="_blank" rel="noreferrer">Masuk sesi<ExternalLink className="ml-2 size-4" aria-hidden="true" /></a></Button>}</div></section>}

        {sessionUpdates.some((update) => !update.acknowledged_at) && <section className="my-8 grid gap-3" aria-live="polite" aria-label="Pembaruan jadwal">{sessionUpdates.filter((update) => !update.acknowledged_at).map((update) => <div key={update.id} className="flex flex-col gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 sm:flex-row sm:items-center dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><Bell className="size-5 shrink-0" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="font-semibold">Jadwal sesi diperbarui</p><p className="mt-1 text-sm">{update.payload.title} kini dijadwalkan {date(update.payload.starts_at)}.</p>{update.payload.reason && <p className="mt-1 text-sm opacity-80">{update.payload.reason}</p>}</div><Button type="button" variant="outline" onClick={() => void acknowledgeUpdate(update.id)}>Saya mengerti</Button></div>)}</section>}

        {access.next_session && access.next_session.mentor_assignment_mode !== 'ADMIN' && Boolean(access.next_session.mentor_assignments?.length) && <section className="my-8 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800" aria-labelledby="mentor-selection-title"><h2 id="mentor-selection-title" className="text-lg font-semibold">Pilih mentor sesi</h2><p className="mt-1 text-sm text-zinc-500">Pilihan berlaku khusus untuk enrollment dan sesi ini.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{access.next_session.mentor_assignments?.map((assignment) => { const full = assignment.capacity !== null && assignment.capacity !== undefined && assignment.reserved_count >= assignment.capacity; return <button key={assignment.id} type="button" disabled={full || reservingMentor !== null} onClick={() => void reserveMentor(assignment.id)} className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><UserRound className="size-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block font-medium">{assignment.mentor.name}</span><span className="block text-sm text-zinc-500">{assignment.mentor.specialization || assignment.role}{assignment.capacity ? ` · ${assignment.capacity - assignment.reserved_count} slot` : ' · tanpa batas'}</span></span><span className="text-sm font-medium text-primary">{reservingMentor === assignment.id ? 'Memilih…' : full ? 'Penuh' : 'Pilih'}</span></button>; })}</div></section>}

        <section className="my-10"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Available tools</p><h2 className="mt-2 text-2xl font-semibold">Komponen Program</h2></div>{access.components?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{access.components.map((component) => { const Icon = componentIcons[component.code] ?? FolderOpen; const route = componentRoutes[component.code]; const href = route?.(access.id); const actionable = href && (component.code !== 'meeting' || access.next_session) && (component.code !== 'certificate' || access.certificate); return <Card key={component.code} className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="grid gap-4 p-5"><div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></div><div><h3 className="font-semibold">{component.label || component.name}</h3><p className="mt-1 text-sm text-zinc-500">Komponen {component.code} untuk enrollment ini.</p></div>{actionable ? <Button asChild variant="outline"><Link href={href}>Buka komponen</Link></Button> : <p className="text-sm text-zinc-500" role="status">Belum ada aktivitas yang dapat dibuka.</p>}</CardContent></Card>; })}</div> : <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500">Belum ada komponen yang dapat diakses untuk status enrollment ini.</div>}</section>

        {access.certificate && <section id="certificate" className="my-10 scroll-mt-24" aria-labelledby="certificate-title"><Card className="border-primary/30 bg-primary/5 shadow-none"><CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center"><div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Award className="size-6" aria-hidden="true" /></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sertifikat kelulusan</p><h2 id="certificate-title" className="mt-2 text-xl font-semibold">{access.program.name}</h2><p className="mt-1 break-all font-mono text-sm text-zinc-600 dark:text-zinc-300">{access.certificate.certificate_number}</p><p className="mt-1 text-sm text-zinc-500">Terbit {date(access.certificate.issued_at)}</p></div></CardContent></Card></section>}

        {access.components?.some((component) => component.code === 'material') && <section id="material" className="scroll-mt-24"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Curriculum</p><h2 className="mt-2 text-2xl font-semibold">Materi belajar</h2></div>{curriculumLoading ? <div className="h-32 animate-pulse rounded-2xl bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-900" /> : curriculum.length ? <div className="grid gap-4">{curriculum.map((module) => <Card key={module.id} className="border-zinc-200 shadow-none dark:border-zinc-800"><CardHeader><CardTitle className="text-lg">{module.title}</CardTitle></CardHeader><CardContent className="grid gap-2">{module.lessons.map((lesson) => <div key={lesson.id} className="flex min-h-11 flex-wrap items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900"><BookOpen className="size-4 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1">{lesson.title}</span><Badge variant="outline">{lesson.content_type}</Badge>{access.status === 'ACTIVE' && <Button type="button" variant="outline" size="sm" disabled={completingLesson === lesson.id} onClick={() => void completeLesson(lesson.id)}>{completingLesson === lesson.id ? 'Menyimpan…' : <><CheckCircle2 className="mr-2 size-4" aria-hidden="true" />Tandai selesai</>}</Button>}</div>)}</CardContent></Card>)}</div> : <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500">Materi terbit belum tersedia.</div>}</section>}
      </main>
    </ProtectedRoute>
  );
}
