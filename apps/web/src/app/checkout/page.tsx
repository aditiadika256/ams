'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get('program_id');
  
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { currentProgram, fetchProgram, createOrder, isLoading: salesLoading } = useSalesStore();
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check auth status
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/checkout?program_id=${programId}`);
    }
  }, [authLoading, isAuthenticated, router, programId]);

  useEffect(() => {
    if (programId) {
      fetchProgram(programId);
    }
  }, [programId, fetchProgram]);

  const handleCheckout = async () => {
    if (!currentProgram) return;

    setIsProcessing(true);
    try {
      const order = await createOrder({
        programs: [
          {
            id: currentProgram.id,
            quantity: 1
          }
        ]
      });

      if (order) {
        router.push(`/orders/${order.id}`);
      }
    } catch (error) {
      console.error('Checkout failed', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || (salesLoading && !currentProgram)) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!programId || !currentProgram) {
    return (
      <div className="container py-12 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Program tidak ditemukan atau URL tidak valid.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/programs">Kembali ke Daftar Program</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Checkout</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start py-4">
                <div>
                  <h3 className="font-semibold text-lg">{currentProgram.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {currentProgram.type} • {currentProgram.level.toUpperCase()}
                  </p>
                </div>
                <p className="font-bold">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-muted-foreground">Biaya Layanan</span>
                <span>Rp 0</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Pembayaran</span>
                <span className="text-primary">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground bg-zinc-50 p-4 rounded-lg border">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <p>Pembayaran Anda aman dan terenkripsi. Kami tidak menyimpan informasi kartu kredit Anda.</p>
          </div>
        </div>
        
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Detail Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Silakan lanjutkan untuk menyelesaikan pembayaran dan mendapatkan akses ke program.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjut Pembayaran
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
