'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, ArrowRight, AlertCircle, CreditCard, Wallet, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { ProcessingLoader, Spinner, PageLoader } from '@/components/ui/loaders';
import {
  getProgramLevelLabel,
  getProgramTypeLabel,
} from '@/lib/program-labels';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get('program_id');
  
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { currentProgram, fetchProgram, createOrder, isLoading: salesLoading } = useSalesStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');

  useEffect(() => {
    // Check auth status
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/checkout?program_id=${programId}`);
    }
  }, [authLoading, isAuthenticated, router, programId]);

  useEffect(() => {
    if (programId) {
      console.log('[CheckoutPage] Fetching program:', programId);
      fetchProgram(programId);
    }
  }, [programId]);  // Only programId - not fetchProgram function!

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
        <Spinner size="lg" />
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
    <div className="container py-8 md:py-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground">Selesaikan pembayaran untuk mulai belajar.</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Metode Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div 
                  className={`flex items-center justify-between space-x-2 border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => setPaymentMethod('qris')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${paymentMethod === 'qris' ? 'bg-primary' : 'bg-transparent'}`}>
                       {paymentMethod === 'qris' && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <Label className="cursor-pointer font-medium">QRIS (GoPay, OVO, Dana, dll)</Label>
                  </div>
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div 
                  className={`flex items-center justify-between space-x-2 border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${paymentMethod === 'transfer' ? 'bg-primary' : 'bg-transparent'}`}>
                       {paymentMethod === 'transfer' && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <Label className="cursor-pointer font-medium">Transfer Bank</Label>
                  </div>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
            <Lock className="h-4 w-4 text-green-600" />
            <span>Pembayaran Anda dienkripsi dan aman.</span>
          </div>
        </div>

        <div className="md:w-[380px]">
          <Card className="sticky top-24 shadow-lg border-primary/20">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">{currentProgram.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {getProgramTypeLabel(currentProgram)} • {getProgramLevelLabel(currentProgram)}
                  </p>
                </div>
                <p className="font-semibold">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Subtotal</span>
                   <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Biaya Admin</span>
                   <span className="text-green-600 font-medium">Gratis</span>
                 </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                 <span className="font-bold text-lg">Total</span>
                 <span className="font-bold text-xl text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}
                 </span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 pt-2">
              <Button 
                className="w-full text-lg h-12 rounded-full shadow-lg shadow-primary/20" 
                onClick={handleCheckout} 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner size="sm" variant="white" className="mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Bayar Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <ProcessingLoader 
                isOpen={isProcessing} 
                title="Memproses Pesanan" 
                description="Mohon jangan tutup halaman ini..." 
              />
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                <span>Jaminan Uang Kembali 30 Hari</span>
              </div>
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
        <Spinner size="lg" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
