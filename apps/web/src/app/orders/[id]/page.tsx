'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSalesStore } from '@/store/useSalesStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';

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
      <div className="container flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-xl font-bold mb-4">Order tidak ditemukan</h2>
        <Button asChild variant="outline">
          <Link href="/programs">Kembali ke Daftar Program</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Berhasil</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Menunggu Pembayaran</Badge>;
      case 'failed':
      case 'expired':
        return <Badge variant="destructive">Gagal / Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />;
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500 mb-4" />;
      case 'failed':
      case 'expired':
        return <XCircle className="h-12 w-12 text-red-500 mb-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Riwayat Pesanan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center">
            {getStatusIcon(currentOrder.status)}
          </div>
          <CardTitle className="text-xl">Detail Pesanan #{currentOrder.id}</CardTitle>
          <div className="mt-2">
            {getStatusBadge(currentOrder.status)}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{item.program?.name || 'Program Name'}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                </p>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentOrder.total)}
              </span>
            </div>
          </div>
        </CardContent>
        
        {currentOrder.status === 'pending' && (
          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full h-12 text-base" 
              onClick={handlePayment}
              disabled={!snapLoaded}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Bayar Sekarang
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Klik tombol di atas untuk menyelesaikan pembayaran melalui Midtrans.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
