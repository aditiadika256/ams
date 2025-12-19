'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSalesStore } from '@/store/useSalesStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderHistoryPage() {
  const { orders, fetchOrders, isLoading } = useSalesStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Riwayat Pesanan</h1>
        <p className="text-zinc-500">Lihat status dan riwayat pembelian program belajarmu.</p>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
                          <span className="font-mono text-sm text-zinc-500">#{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">
                          {order.items.map(item => item.program?.name).join(', ')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-4 md:w-auto w-full">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                          <p className="font-bold text-lg text-primary">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total)}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/orders/${order.id}`}>Detail</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-zinc-50">
              <ShoppingBag className="h-12 w-12 text-zinc-300 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Belum ada pesanan</h3>
              <p className="text-zinc-500 max-w-sm mb-6">
                Kamu belum pernah melakukan pembelian program belajar apapun.
              </p>
              <Button asChild>
                <Link href="/programs">Lihat Program</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
