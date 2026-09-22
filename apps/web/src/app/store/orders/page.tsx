'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, ShoppingBag, Truck, CheckCircle2, Clock, 
  XCircle, ArrowLeft, Coins, ExternalLink, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

interface StoreOrderItem {
  id: number;
  product_name: string;
  quantity: number;
  points_each: number;
  cash_each: string | number;
}

interface StoreOrder {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  total_points: number;
  total_cash: string | number;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  items: StoreOrderItem[];
}

function currency(val: string | number | null): string {
  if (!val) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500">
          <Clock className="mr-1 size-3" /> Menunggu Konfirmasi
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-500">
          <CheckCircle2 className="mr-1 size-3" /> Dikonfirmasi
        </Badge>
      );
    case 'shipped':
      return (
        <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-500 font-bold">
          <Truck className="mr-1 size-3" /> Dalam Pengiriman
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="mr-1 size-3" /> Selesai
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 size-3" /> Dibatalkan
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function StoreOrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.store.orders();
      const items = res.data?.data || res.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load store orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="py-24">
        <PageLoader text="Memuat riwayat pesanan Store..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            <Link href="/store">
              <ArrowLeft className="mr-2 size-4" /> Kembali ke Store
            </Link>
          </Button>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Riwayat Pesanan Store
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Pantau status pengiriman buku, modul, dan reward merchandise Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchOrders} className="rounded-xl">
            <RefreshCw className="mr-1.5 size-3.5" /> Segarkan
          </Button>
          <Button asChild size="sm" className="rounded-xl shadow-sm">
            <Link href="/store">
              <ShoppingBag className="mr-1.5 size-3.5" /> Belanja Lagi
            </Link>
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-800">
          <div className="max-w-md space-y-4">
            <Package className="mx-auto size-16 text-zinc-400" />
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Belum Ada Pesanan Store</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Anda belum pernah menukarkan poin atau memesan produk fisik dari Store Arkanin.
            </p>
            <Button asChild className="rounded-xl">
              <Link href="/store">Jelajahi Store Sekarang</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-col gap-3 border-b border-zinc-100 bg-zinc-50/50 p-5 dark:border-zinc-800/60 dark:bg-zinc-800/20 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-zinc-900 dark:text-white">
                      #{order.order_number}
                    </span>
                    {statusBadge(order.status)}
                  </div>
                  <span className="text-xs text-zinc-400 mt-1 block">
                    Dipesan pada: {formatDate(order.created_at)}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-zinc-400">Total Pembayaran</span>
                  <div className="flex items-center sm:justify-end gap-2 mt-0.5">
                    {order.total_points > 0 && (
                      <span className="flex items-center gap-1 font-bold text-amber-500 text-sm">
                        <Coins className="size-4" />
                        {order.total_points.toLocaleString('id-ID')} Poin
                      </span>
                    )}
                    {order.total_cash && Number(order.total_cash) > 0 && (
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        {currency(order.total_cash)}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-5">
                {/* Items List */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          <Package className="size-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {item.quantity} barang &times;{' '}
                            {item.points_each > 0
                              ? `${item.points_each.toLocaleString('id-ID')} Poin`
                              : currency(item.cash_each)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Tracking Information */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">Tujuan Pengiriman: </span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {order.shipping_name} ({order.shipping_phone}) — {order.shipping_address}
                        {order.shipping_city ? `, ${order.shipping_city}` : ''}
                        {order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ''}
                      </span>
                    </div>

                    {order.tracking_number && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <Truck className="size-3.5" /> No. Resi: {order.tracking_number}
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <p className="text-zinc-400 italic">
                      Catatan: {order.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
