'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, Layers3, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loaders';
import { EnrollmentCodeModal } from '@/components/programs/EnrollmentCodeModal';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';
import type { ProgramBatch } from '@/types/sales';

function currency(value: string): string {
  const amount = Number(value);
  return amount === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentProgram, fetchProgram, isLoading, error } = useSalesStore();
  const [enrolling, setEnrolling] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const id = params.id;

  useEffect(() => { if (id) void fetchProgram(id); }, [fetchProgram, id]);

  // Auto-select first open batch when program loads
  const openBatches = currentProgram?.batches?.filter((b) => b.status === 'OPEN') ?? [];
  useEffect(() => {
    if (openBatches.length === 1 && selectedBatchId === null) {
      setSelectedBatchId(openBatches[0].id);
    }
  }, [openBatches, selectedBatchId]);

  if (isLoading && !currentProgram) return <PageLoader />;
  if (!currentProgram || error) return <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 text-center"><div><h1 className="text-2xl font-semibold">Program tidak ditemukan</h1><p className="mt-2 text-zinc-500">{error || 'Program ini tidak tersedia pada katalog publik.'}</p><Button asChild className="mt-5"><Link href="/programs">Kembali ke katalog</Link></Button></div></div>;

  const program = currentProgram;
  const effectivePrice = (() => {
    if (!selectedBatchId) return program.base_price;
    const batch = openBatches.find((b) => b.id === selectedBatchId);
    return batch?.price_override ?? program.base_price;
  })();

  const acquire = async () => {
    if (!isAuthenticated) { router.push(`/auth/login?redirect=${encodeURIComponent(`/programs/${id}`)}`); return; }
    if (Number(effectivePrice) > 0) {
      const params = new URLSearchParams({ program_id: String(program.id) });
      if (selectedBatchId) params.set('batch_id', String(selectedBatchId));
      router.push(`/checkout?${params.toString()}`);
      return;
    }
    setEnrolling(true);
    try {
      const response = await apiClient.access.freeEnroll(program.id, selectedBatchId);
      if (response.data) router.push(`/workspace/accesses/${response.data.id}`);
    } catch (requestError) {
      alertActions.error('Enrollment gagal', getErrorMessage(requestError, 'Program gratis tidak dapat ditambahkan ke Workspace.'));
    } finally { setEnrolling(false); }
  };

  return (
    <main className="min-h-screen">
      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-16">
          <div>
            <Button asChild variant="ghost" className="mb-6 -ml-3"><Link href="/programs"><ArrowLeft className="mr-2 size-4" />Katalog</Link></Button>
            <div className="mb-4 flex flex-wrap gap-2">{program.tags?.map((tag) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}</div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{program.name}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-500">{program.short_description || 'Program modular yang dirancang untuk pengalaman belajar terstruktur.'}</p>
          </div>
          <Card className="self-end border-zinc-200 bg-white shadow-none dark:border-zinc-800 dark:bg-zinc-950">
            <CardContent className="grid gap-5 p-6">
              <div>
                <span className="text-sm text-zinc-500">Harga dasar</span>
                <p className="mt-1 text-3xl font-semibold text-primary">{currency(effectivePrice)}</p>
              </div>

              {/* Batch Selection */}
              {openBatches.length > 1 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Pilih Batch Pelaksanaan</label>
                  <div className="grid gap-2">
                    {openBatches.map((batch: ProgramBatch) => (
                      <button
                        key={batch.id}
                        type="button"
                        onClick={() => setSelectedBatchId(batch.id)}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                          selectedBatchId === batch.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{batch.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                            <Calendar className="size-3" />
                            {formatDate(batch.starts_at)} — {formatDate(batch.ends_at)}
                          </p>
                        </div>
                        {batch.capacity && (
                          <span className="flex items-center gap-1 text-xs text-zinc-400">
                            <Users className="size-3" />
                            {batch.enrolled_count}/{batch.capacity}
                          </span>
                        )}
                        {selectedBatchId === batch.id && <CheckCircle2 className="size-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {openBatches.length === 1 && (
                <p className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar className="size-4" />
                  {openBatches[0].name} · {formatDate(openBatches[0].starts_at)}
                </p>
              )}

              <Button size="lg" disabled={enrolling} onClick={() => void acquire()}>{enrolling ? 'Menambahkan…' : Number(effectivePrice) === 0 ? 'Tambahkan ke Workspace' : 'Lanjut ke checkout'}</Button>

              {/* Enrollment Code */}
              <div className="flex items-center justify-center">
                <EnrollmentCodeModal />
              </div>

              <p className="text-center text-xs text-zinc-500">Akses akan terbit sebagai enrollment terpisah di Workspace Anda.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <section>
          <h2 className="text-2xl font-semibold">Tentang Program</h2>
          <div className="mt-5 whitespace-pre-line text-base leading-8 text-zinc-600 dark:text-zinc-300">{program.description || program.short_description || 'Deskripsi Program akan segera tersedia.'}</div>
        </section>
        <aside>
          <h2 className="text-lg font-semibold">Komponen tersedia</h2>
          <div className="mt-4 grid gap-3">{program.components?.length ? program.components.map((component) => <div key={component.code} className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"><Layers3 className="size-4 text-primary" /><span className="text-sm font-medium">{component.label || component.name}</span><CheckCircle2 className="ml-auto size-4 text-emerald-600" /></div>) : <div className="rounded-xl border border-dashed p-5 text-sm text-zinc-500"><BookOpen className="mb-2 size-5" />Komponen akan ditampilkan setelah konfigurasi tersedia.</div>}</div>
        </aside>
      </div>
    </main>
  );
}

