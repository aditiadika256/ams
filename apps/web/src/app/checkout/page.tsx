'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader, ProcessingLoader, Spinner } from '@/components/ui/loaders';
import { Separator } from '@/components/ui/separator';
import { alertActions } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';

function currency(value: string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get('program_id');
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { currentProgram, fetchProgram, createOrder, isLoading } = useSalesStore();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace(`/auth/login?redirect=${encodeURIComponent(`/checkout?program_id=${programId ?? ''}`)}`);
  }, [authLoading, isAuthenticated, programId, router]);
  useEffect(() => { if (programId) void fetchProgram(programId); }, [fetchProgram, programId]);

  if (authLoading || (isLoading && !currentProgram)) return <PageLoader />;
  if (!programId || !currentProgram) return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 text-center"><div><h1 className="text-2xl font-semibold">Program tidak tersedia</h1><Button asChild className="mt-5"><Link href="/programs">Kembali ke katalog</Link></Button></div></div>;
  const program = currentProgram;

  if (Number(program.base_price) === 0) return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 text-center"><div><h1 className="text-2xl font-semibold">Program ini gratis</h1><p className="mt-2 text-zinc-500">Program gratis menggunakan flow enrollment dan tidak membuat Order.</p><Button asChild className="mt-5"><Link href={`/programs/${program.slug}`}>Kembali ke detail Program</Link></Button></div></div>;

  const checkout = async () => {
    setProcessing(true);
    const order = await createOrder({ programs: [{ id: program.id, quantity: 1 }], payment_provider: 'midtrans' });
    if (order) router.push(`/orders/${order.id}`);
    else alertActions.error('Checkout gagal', 'Order tidak dapat dibuat. Silakan coba kembali.');
    setProcessing(false);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Secure checkout</p><h1 className="text-4xl font-semibold tracking-tight">Konfirmasi pesanan</h1><p className="mt-3 text-zinc-500">Selesaikan pembayaran untuk menerbitkan enrollment ke Workspace Anda.</p></header>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-5" />Pembayaran online</CardTitle></CardHeader><CardContent className="grid gap-5"><div className="rounded-xl border border-primary bg-primary/5 p-4"><p className="font-medium">Midtrans</p><p className="mt-1 text-sm text-zinc-500">Pilih QRIS, virtual account, atau kanal lain pada halaman pembayaran.</p></div><div className="flex items-start gap-3 rounded-xl bg-zinc-100 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"><Lock className="mt-0.5 size-4 shrink-0 text-emerald-600" /><span>Referensi pembayaran dibuat oleh server. Enrollment diterbitkan hanya setelah webhook terverifikasi.</span></div></CardContent></Card>
        <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardHeader><CardTitle>Ringkasan</CardTitle></CardHeader><CardContent><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{program.name}</h2><div className="mt-2 flex flex-wrap gap-1.5">{program.tags?.map((tag) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}</div></div><span className="font-medium">{currency(program.base_price)}</span></div><Separator className="my-5" /><div className="flex justify-between"><span className="font-semibold">Total</span><strong className="text-xl text-primary">{currency(program.base_price)}</strong></div></CardContent><CardFooter className="grid gap-3"><Button size="lg" disabled={processing} onClick={() => void checkout()}>{processing ? <><Spinner size="sm" variant="white" className="mr-2" />Memproses…</> : <>Buat pesanan<ArrowRight className="ml-2 size-5" /></>}</Button><div className="flex items-center justify-center gap-2 text-xs text-zinc-500"><ShieldCheck className="size-4" />Transaksi diverifikasi oleh server</div></CardFooter></Card>
      </div>
      <ProcessingLoader isOpen={processing} title="Membuat pesanan" description="Mohon tunggu sebentar…" />
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<PageLoader />}><CheckoutContent /></Suspense>;
}
