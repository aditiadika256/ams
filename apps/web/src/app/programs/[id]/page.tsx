'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, Layers3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';

function currency(value: string): string {
  const amount = Number(value);
  return amount === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export default function ProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentProgram, fetchProgram, isLoading, error } = useSalesStore();
  const [enrolling, setEnrolling] = useState(false);
  const id = params.id;

  useEffect(() => { if (id) void fetchProgram(id); }, [fetchProgram, id]);
  if (isLoading && !currentProgram) return <PageLoader />;
  if (!currentProgram || error) return <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 text-center"><div><h1 className="text-2xl font-semibold">Program tidak ditemukan</h1><p className="mt-2 text-zinc-500">{error || 'Program ini tidak tersedia pada katalog publik.'}</p><Button asChild className="mt-5"><Link href="/programs">Kembali ke katalog</Link></Button></div></div>;

  const program = currentProgram;
  const acquire = async () => {
    if (!isAuthenticated) { router.push(`/auth/login?redirect=${encodeURIComponent(`/programs/${id}`)}`); return; }
    if (Number(program.base_price) > 0) { router.push(`/checkout?program_id=${program.id}`); return; }
    setEnrolling(true);
    try {
      const response = await apiClient.access.freeEnroll(program.id);
      if (response.data) router.push(`/workspace/accesses/${response.data.id}`);
    } catch (requestError) {
      alertActions.error('Enrollment gagal', getErrorMessage(requestError, 'Program gratis tidak dapat ditambahkan ke Workspace.'));
    } finally { setEnrolling(false); }
  };

  return (
    <main className="min-h-screen">
      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"><div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-16"><div><Button asChild variant="ghost" className="mb-6 -ml-3"><Link href="/programs"><ArrowLeft className="mr-2 size-4" />Katalog</Link></Button><div className="mb-4 flex flex-wrap gap-2">{program.tags?.map((tag) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}</div><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{program.name}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-500">{program.short_description || 'Program modular yang dirancang untuk pengalaman belajar terstruktur.'}</p></div><Card className="self-end border-zinc-200 bg-white shadow-none dark:border-zinc-800 dark:bg-zinc-950"><CardContent className="grid gap-5 p-6"><div><span className="text-sm text-zinc-500">Harga dasar</span><p className="mt-1 text-3xl font-semibold text-primary">{currency(program.base_price)}</p></div><Button size="lg" disabled={enrolling} onClick={() => void acquire()}>{enrolling ? 'Menambahkan…' : Number(program.base_price) === 0 ? 'Tambahkan ke Workspace' : 'Lanjut ke checkout'}</Button><p className="text-center text-xs text-zinc-500">Akses akan terbit sebagai enrollment terpisah di Workspace Anda.</p></CardContent></Card></div></section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8"><section><h2 className="text-2xl font-semibold">Tentang Program</h2><div className="mt-5 whitespace-pre-line text-base leading-8 text-zinc-600 dark:text-zinc-300">{program.description || program.short_description || 'Deskripsi Program akan segera tersedia.'}</div></section><aside><h2 className="text-lg font-semibold">Komponen tersedia</h2><div className="mt-4 grid gap-3">{program.components?.length ? program.components.map((component) => <div key={component.code} className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"><Layers3 className="size-4 text-primary" /><span className="text-sm font-medium">{component.label || component.name}</span><CheckCircle2 className="ml-auto size-4 text-emerald-600" /></div>) : <div className="rounded-xl border border-dashed p-5 text-sm text-zinc-500"><BookOpen className="mb-2 size-5" />Komponen akan ditampilkan setelah konfigurasi tersedia.</div>}</div></aside></div>
    </main>
  );
}
