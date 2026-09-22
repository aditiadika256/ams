'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Coins, Package, ShoppingBag, ShieldCheck, 
  Truck, CheckCircle2, AlertCircle, Loader2, Sparkles, Minus, Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/useAuthStore';

interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price_points: number;
  price_cash: string | number | null;
  stock: number;
  is_active: boolean;
  category: string | null;
}

function currency(val: string | number | null): string {
  if (!val) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'cash' | 'mixed'>('points');

  // Shipping Form State
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name) setShippingName(user.name);
    if (user?.phone) setShippingPhone(user.phone);
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.store.productDetail(slug);
      setProduct(res.data);

      if (isAuthenticated) {
        const pointRes = await apiClient.points.me();
        setUserPoints(pointRes.data?.balance ?? 0);
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
      alertActions.error('Produk tidak ditemukan atau tidak aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchData();
  }, [slug, isAuthenticated]);

  if (loading) {
    return (
      <div className="py-24">
        <PageLoader text="Memuat rincian produk..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center space-y-4">
        <Package className="mx-auto size-16 text-zinc-400" />
        <h2 className="text-xl font-bold">Produk Tidak Ditemukan</h2>
        <p className="text-sm text-zinc-500">Produk yang Anda cari mungkin telah dihapus atau dinonaktifkan.</p>
        <Button asChild>
          <Link href="/store">Kembali ke Store</Link>
        </Button>
      </div>
    );
  }

  const totalPointsNeeded = product.price_points * quantity;
  const totalCashNeeded = Number(product.price_cash ?? 0) * quantity;
  const hasEnoughPoints = userPoints >= totalPointsNeeded;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/store/${slug}`);
      return;
    }

    if (paymentMethod === 'points' && !hasEnoughPoints) {
      alertActions.error(`Saldo poin tidak mencukupi. Anda butuh ${totalPointsNeeded.toLocaleString('id-ID')} poin, saldo Anda ${userPoints.toLocaleString('id-ID')} poin.`);
      return;
    }

    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
      alertActions.error('Mohon lengkapi Nama Penerima, No. Telepon, dan Alamat Pengiriman.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.store.checkout({
        items: [{ product_id: product.id, quantity }],
        payment_method: paymentMethod,
        shipping_name: shippingName.trim(),
        shipping_phone: shippingPhone.trim(),
        shipping_address: shippingAddress.trim(),
        shipping_city: shippingCity.trim() || undefined,
        shipping_postal_code: shippingPostalCode.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      alertActions.success('Pesanan berhasil dibuat! Tim kami akan segera memproses pengiriman.');
      router.push('/store/orders');
    } catch (err: any) {
      const msg = getErrorMessage(err) || 'Gagal memproses pesanan Store.';
      alertActions.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          <Link href="/store">
            <ArrowLeft className="mr-2 size-4" /> Kembali ke Katalog Store
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column: Product Image & Overview */}
        <div className="space-y-6 lg:col-span-5">
          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-md">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <Package className="size-20 stroke-1" />
                  <span className="text-sm font-medium">Official Product</span>
                </div>
              )}

              {/* Status badge */}
              <div className="absolute right-4 top-4">
                {product.stock <= 0 ? (
                  <Badge variant="destructive">Stok Habis</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Stok Tersedia ({product.stock})
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Highlights Card */}
          <Card className="rounded-2xl border-zinc-200/80 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="space-y-4 p-5 text-sm">
              <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
                <span>100% Produk Resmi & Original Arkanin Education</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <Truck className="size-5 text-indigo-500 shrink-0" />
                <span>Pengiriman ke seluruh Indonesia dengan nomor resi terverifikasi</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <Sparkles className="size-5 text-amber-500 shrink-0" />
                <span>Bebas tukar dengan akumulasi Poin Prestasi & Presensi</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & Checkout Form */}
        <div className="space-y-6 lg:col-span-7">
          <div>
            <div className="flex items-center gap-2">
              {product.category && (
                <Badge variant="outline" className="text-xs uppercase tracking-wider">
                  {product.category === 'book' ? 'Buku Fisik' : product.category === 'module' ? 'Modul Cetak' : 'Merchandise'}
                </Badge>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-black text-zinc-900 dark:text-white sm:text-3xl">
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            )}
          </div>

          {/* Pricing & Stock Card */}
          <Card className="rounded-2xl border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-indigo-500/5 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Harga Penukaran</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="flex items-center gap-1 text-2xl font-black text-amber-500">
                    <Coins className="size-6" />
                    {product.price_points.toLocaleString('id-ID')} Poin
                  </span>
                  {product.price_cash && Number(product.price_cash) > 0 && (
                    <span className="text-sm font-semibold text-zinc-500">
                      atau {currency(product.price_cash)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-500">Jumlah:</span>
                <div className="flex items-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-l-xl"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-r-xl"
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* User Points Status */}
            {isAuthenticated && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  Saldo Poin Anda: <strong>{userPoints.toLocaleString('id-ID')} Poin</strong>
                </span>
                {paymentMethod === 'points' && !hasEnoughPoints && (
                  <span className="text-destructive font-semibold">
                    Kurang {(totalPointsNeeded - userPoints).toLocaleString('id-ID')} Poin
                  </span>
                )}
              </div>
            )}
          </Card>

          {/* Checkout & Shipping Form */}
          <form onSubmit={handleCheckout} className="space-y-6">
            {/* Payment Method Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-bold">Pilih Metode Pembayaran</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  onClick={() => setPaymentMethod('points')}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    paymentMethod === 'points'
                      ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-amber-500 text-sm">
                      <Coins className="size-4" /> Tukar Poin Penuh
                    </span>
                    <span className="text-xs font-semibold">
                      {totalPointsNeeded.toLocaleString('id-ID')} Poin
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Gunakan poin prestasi dan kehadiran Anda
                  </p>
                </div>

                {product.price_cash && Number(product.price_cash) > 0 && (
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        💵 Bayar Tunai
                      </span>
                      <span className="text-xs font-semibold">
                        {currency(totalCashNeeded)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Transfer bank / VA tanpa memotong poin
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Details */}
            <Card className="rounded-2xl border-zinc-200/80 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-sm">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Truck className="size-4 text-primary" /> Alamat Pengiriman
                </CardTitle>
                <CardDescription className="text-xs">
                  Pastikan alamat dan nomor telepon aktif untuk keperluan pengiriman ekspedisi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5 pt-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">Nama Penerima *</Label>
                    <Input
                      id="name"
                      placeholder="Nama lengkap"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">Nomor WhatsApp / HP *</Label>
                    <Input
                      id="phone"
                      placeholder="08xxxxxxxxxx"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold">Alamat Lengkap *</Label>
                  <Textarea
                    id="address"
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold">Kota / Kabupaten</Label>
                    <Input
                      id="city"
                      placeholder="Contoh: Jakarta Selatan"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postal" className="text-xs font-semibold">Kode Pos</Label>
                    <Input
                      id="postal"
                      placeholder="Contoh: 12345"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold">Catatan Pengiriman (Opsional)</Label>
                  <Input
                    id="notes"
                    placeholder="Contoh: Titip di satpam / pagar hitam"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Summary & Submit Button */}
            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Total Pembayaran:</span>
                <span className="text-base font-extrabold text-primary">
                  {paymentMethod === 'points'
                    ? `${totalPointsNeeded.toLocaleString('id-ID')} Poin`
                    : currency(totalCashNeeded)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={submitting || product.stock <= 0 || (paymentMethod === 'points' && !hasEnoughPoints && isAuthenticated)}
                className="mt-4 w-full rounded-xl py-6 text-base font-bold shadow-lg transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Memproses Pesanan...
                  </>
                ) : !isAuthenticated ? (
                  'Masuk untuk Menyelesaikan Pesanan'
                ) : product.stock <= 0 ? (
                  'Stok Produk Habis'
                ) : paymentMethod === 'points' && !hasEnoughPoints ? (
                  `Saldo Poin Tidak Cukup (${userPoints.toLocaleString('id-ID')} / ${totalPointsNeeded.toLocaleString('id-ID')})`
                ) : (
                  <>
                    <ShoppingBag className="mr-2 size-5" /> Konfirmasi & Pesan Sekarang
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
