'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CalendarDays, ExternalLink, FileQuestion, FolderOpen, RotateCcw, Video } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import type { CurriculumModule } from '@/types/workspace';

function date(value?: string | null): string {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value)) : 'Belum dijadwalkan';
}

const componentIcons: Record<string, typeof BookOpen> = {
  material: BookOpen, assessment: FileQuestion, meeting: Video,
};

export default function WorkspaceDetailPage() {
  const params = useParams<{ accessId: string }>();
  const accessId = Number(params.accessId);
  const { currentAccess, loading, error, fetchAccess, restore } = useWorkspaceStore();
  const [curriculum, setCurriculum] = useState<CurriculumModule[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState(false);

  useEffect(() => { if (Number.isInteger(accessId)) void fetchAccess(accessId); }, [accessId, fetchAccess]);
  useEffect(() => {
    if (!currentAccess?.components?.some((component) => component.code === 'material')) return;
    setCurriculumLoading(true);
    void apiClient.workspace.curriculum(currentAccess.id)
      .then((response) => setCurriculum(response.data ?? []))
      .catch(() => setCurriculum([]))
      .finally(() => setCurriculumLoading(false));
  }, [currentAccess]);

  if (loading && !currentAccess) return <div className="mx-auto grid min-h-[60vh] max-w-6xl place-items-center px-4"><div className="size-10 animate-spin rounded-full border-4 border-zinc-200 border-t-primary" /></div>;
  if (!currentAccess || error) return <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 text-center"><div><h1 className="text-2xl font-semibold">Enrollment tidak ditemukan</h1><p className="mt-2 text-zinc-500">{error || 'Akses ini tidak tersedia di Workspace Anda.'}</p><Button asChild className="mt-5"><Link href="/workspace">Kembali ke Workspace</Link></Button></div></div>;

  const access = currentAccess;
  const handleRestore = async () => {
    try { await restore(access.id); await fetchAccess(access.id); alertActions.success('Kartu dipulihkan', 'Enrollment kembali tampil di Workspace utama.'); }
    catch { alertActions.error('Gagal memulihkan', 'Kartu tidak dapat dipulihkan.'); }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6 -ml-3"><Link href="/workspace"><ArrowLeft className="mr-2 size-4" />Workspace</Link></Button>
        <section className="grid gap-8 border-b border-zinc-200 pb-8 dark:border-zinc-800 lg:grid-cols-[1fr_300px]">
          <div><div className="mb-4 flex flex-wrap gap-2"><Badge>{access.status}</Badge>{access.batch && <Badge variant="outline">{access.batch.code}</Badge>}{access.program.tags.map((tag) => <Badge key={tag.code} variant="secondary">{tag.name}</Badge>)}</div><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{access.program.name}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-zinc-500">{access.program.description || access.program.short_description || 'Detail Program untuk enrollment ini.'}</p></div>
          <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="grid gap-4 p-5"><div><span className="text-xs uppercase tracking-wide text-zinc-500">Enrollment</span><p className="mt-1 font-medium">#{access.id} · {access.source_type}</p></div><div><span className="text-xs uppercase tracking-wide text-zinc-500">Periode akses</span><p className="mt-1 text-sm">{date(access.starts_at)}<br />hingga {date(access.ends_at)}</p></div>{access.archived_at && <Button variant="outline" onClick={() => void handleRestore()}><RotateCcw className="mr-2 size-4" />Pulihkan kartu</Button>}</CardContent></Card>
        </section>

        {access.next_session && <section className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><CalendarDays className="mt-1 size-5 text-primary" /><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Sesi berikutnya</p><h2 className="mt-1 text-lg font-semibold">{access.next_session.title}</h2><p className="mt-1 text-sm text-zinc-500">{date(access.next_session.starts_at)} · {access.next_session.mode}</p></div></div>{access.next_session.meeting_url && <Button asChild><a href={access.next_session.meeting_url} target="_blank" rel="noreferrer">Masuk sesi<ExternalLink className="ml-2 size-4" /></a></Button>}</div></section>}

        <section className="my-10"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Available tools</p><h2 className="mt-2 text-2xl font-semibold">Komponen Program</h2></div>{access.components?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{access.components.map((component) => { const Icon = componentIcons[component.code] ?? FolderOpen; const href = component.code === 'assessment' ? `/exams?program_access_id=${access.id}` : `#${component.code}`; return <Card key={component.code} className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="grid gap-4 p-5"><div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><div><h3 className="font-semibold">{component.label || component.name}</h3><p className="mt-1 text-sm text-zinc-500">Komponen {component.code} untuk enrollment ini.</p></div><Button asChild variant="outline"><Link href={href}>Buka komponen</Link></Button></CardContent></Card>; })}</div> : <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500">Belum ada komponen yang dapat diakses untuk status enrollment ini.</div>}</section>

        {access.components?.some((component) => component.code === 'material') && <section id="material" className="scroll-mt-24"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Curriculum</p><h2 className="mt-2 text-2xl font-semibold">Materi belajar</h2></div>{curriculumLoading ? <div className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" /> : curriculum.length ? <div className="grid gap-4">{curriculum.map((module) => <Card key={module.id} className="border-zinc-200 shadow-none dark:border-zinc-800"><CardHeader><CardTitle className="text-lg">{module.title}</CardTitle></CardHeader><CardContent className="grid gap-2">{module.lessons.map((lesson) => <div key={lesson.id} className="flex min-h-11 items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900"><BookOpen className="size-4 text-primary" /><span>{lesson.title}</span><Badge variant="outline" className="ml-auto">{lesson.content_type}</Badge></div>)}</CardContent></Card>)}</div> : <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500">Materi terbit belum tersedia.</div>}</section>}
      </main>
    </ProtectedRoute>
  );
}
