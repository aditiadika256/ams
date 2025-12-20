'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSalesStore } from '@/store/useSalesStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, CheckCircle2, XCircle, Clock, PlayCircle, BookOpen, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Spinner, PageLoader } from '@/components/ui/loaders';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    snap: any;
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentOrder, fetchOrder, isLoading } = useSalesStore();
  const id = params.id;
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id, fetchOrder]);

  // Load Snap JS
  useEffect(() => {
    const snapScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

    if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
      const script = document.createElement('script');
      script.src = snapScriptUrl;
      script.setAttribute('data-client-key', clientKey);
      script.onload = () => setSnapLoaded(true);
      document.body.appendChild(script);
    } else {
      setSnapLoaded(true);
    }
  }, []);

  const handlePayment = () => {
    if (currentOrder?.snap_token && window.snap) {
      window.snap.pay(currentOrder.snap_token, {
        onSuccess: function (result: any) {
          console.log('Payment success', result);
          fetchOrder(id); // Refresh order status
        },
        onPending: function (result: any) {
          console.log('Payment pending', result);
          fetchOrder(id);
        },
        onError: function (result: any) {
          console.log('Payment error', result);
          fetchOrder(id);
        },
        onClose: function () {
          console.log('Customer closed the popup without finishing the payment');
        }
      });
    }
  };

  if (isLoading && !currentOrder) {
    return (
      <div className="container flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Order tidak ditemukan</h2>
        <Button asChild variant="default">
          <Link href="/programs">Kembali ke Daftar Program</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600 px-4 py-1 text-base">Berhasil</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 px-4 py-1 text-base">Menunggu Pembayaran</Badge>;
      case 'failed':
      case 'expired':
        return <Badge variant="destructive" className="px-4 py-1 text-base">Gagal / Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline" className="px-4 py-1 text-base">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        );
      case 'pending':
        return (
           <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
        );
      case 'failed':
      case 'expired':
        return (
           <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 md:py-16 max-w-3xl mx-auto">
      <div className="mb-8">
        <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
          <Link href="/programs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Program
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-t-4 border-t-primary shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-10 bg-muted/20">
            {getStatusIcon(currentOrder.status)}
            <CardTitle className="text-2xl md:text-3xl font-bold">
               {currentOrder.status === 'paid' ? 'Terima Kasih!' : 'Detail Pesanan'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Order ID: <span className="font-mono font-medium text-foreground">#{currentOrder.id}</span>
            </CardDescription>
            <div className="mt-4">
              {getStatusBadge(currentOrder.status)}
            </div>
          </CardHeader>
          
          <CardContent className="pt-8 px-6 md:px-10">
            <h3 className="font-semibold text-lg mb-4">Item yang Dibeli</h3>
            <div className="space-y-6">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start group">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                       <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg group-hover:text-primary transition-colors">{item.program?.name || 'Program Name'}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-lg">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                  </p>
                </div>
              ))}
              
              <Separator className="my-6" />
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Pembayaran</span>
                <span className="font-bold text-2xl text-primary">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentOrder.total)}
                </span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-muted/20 p-6 md:p-10 flex flex-col gap-4">
            {currentOrder.status === 'pending' ? (
              <>
                <Button 
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20" 
                  onClick={handlePayment}
                  disabled={!snapLoaded}
                >
                  {!snapLoaded ? (
                    <>
                      <Spinner size="sm" variant="white" className="mr-2" />
                      Memuat Pembayaran...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Bayar Sekarang
                    </>
                  )}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Klik tombol di atas untuk menyelesaikan pembayaran aman melalui Midtrans.
                </p>
              </>
            ) : currentOrder.status === 'paid' ? (
              <div className="w-full space-y-3">
                 <Button className="w-full h-12 text-lg rounded-xl" asChild>
                    <Link href="/dashboard">
                       <PlayCircle className="mr-2 h-5 w-5" />
                       Mulai Belajar
                    </Link>
                 </Button>
                 <Button variant="outline" className="w-full h-12 text-lg rounded-xl">
                    <Download className="mr-2 h-5 w-5" />
                    Unduh Invoice
                 </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full h-12 text-lg rounded-xl" asChild>
                <Link href="/programs">
                   Cari Program Lain
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
