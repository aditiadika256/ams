'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, FileQuestion } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';

interface ExamPackage { id: number; name: string; level: string; duration_minutes: number; description?: string | null }

function ExamsContent() {
  const searchParams = useSearchParams();
  const accessId = Number(searchParams.get('program_access_id'));
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [loading, setLoading] = useState(Number.isInteger(accessId) && accessId > 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(accessId) || accessId <= 0) return;
    void apiClient.cbt.getPackages(accessId)
      .then((response) => setPackages(response.data ?? []))
      .catch((requestError) => setError(getErrorMessage(requestError, 'Paket ujian tidak dapat dimuat.')))
      .finally(() => setLoading(false));
  }, [accessId]);

  if (!Number.isInteger(accessId) || accessId <= 0) return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 text-center"><div><FileQuestion className="mx-auto mb-4 size-10 text-zinc-400" /><h1 className="text-2xl font-semibold">Pilih ujian dari Workspace</h1><p className="mt-2 text-zinc-500">Paket ujian selalu terikat pada enrollment yang memiliki komponen assessment.</p><Button asChild className="mt-5"><Link href="/workspace">Buka Workspace</Link></Button></div></div>;
  if (loading) return <PageLoader message="Memuat ujian enrollment…" />;

  return <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><header><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Assessment</p><h1 className="text-4xl font-semibold tracking-tight">Ujian & Tryout</h1><p className="mt-3 text-zinc-500">Hanya paket yang dikonfigurasi untuk enrollment #{accessId} yang ditampilkan.</p></header>{error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{packages.map((exam) => <Card key={exam.id} className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="grid h-full gap-5 p-5"><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><FileQuestion className="size-5" /></div><Badge variant="outline">{exam.level}</Badge></div><div><h2 className="text-xl font-semibold">{exam.name}</h2><p className="mt-2 line-clamp-2 text-sm text-zinc-500">{exam.description || 'Assessment Program Anda.'}</p></div><div className="flex items-center gap-2 text-sm text-zinc-500"><Clock className="size-4" />{exam.duration_minutes} menit</div><Button asChild className="mt-auto"><Link href={`/exams/${exam.id}?program_access_id=${accessId}`}>Lihat petunjuk</Link></Button></CardContent></Card>)}</section>{!error && packages.length === 0 && <div className="mt-8 rounded-2xl border border-dashed p-10 text-center text-zinc-500">Belum ada paket ujian yang dikonfigurasi.</div>}</main>;
}

export default function ExamsPage() {
  return <ProtectedRoute><Suspense fallback={<PageLoader />}><ExamsContent /></Suspense></ProtectedRoute>;
}
