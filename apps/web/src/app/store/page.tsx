'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Search, Sparkles, Coins, Package, 
  BookOpen, Shirt, ArrowRight, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';
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

const CATEGORIES = [
  { id: 'all', label: 'Semua Produk', icon: Package },
  { id: 'book', label: 'Buku Fisik', icon: BookOpen },
  { id: 'module', label: 'Modul Cetak', icon: BookOpen },
  { id: 'merchandise', label: 'Merchandise', icon: Shirt },
];

export default function StorePage() {
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userPoints, setUserPoints] = useState<number | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeCategory !== 'all') {
        params.category = activeCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await apiClient.store.products(params);
      const items = res.data?.data || res.data || [];
      setProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load store products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.points.me();
      if (res.data?.balance !== undefined) {
        setUserPoints(res.data.balance);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  useEffect(() => {
    fetchUserPoints();
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-zinc-900 to-amber-950 p-8 text-white shadow-2xl md:p-12">
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-300">
              <Sparkles className="size-3.5" /> Arkanin Reward Store
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Tukar Poin & Belanja Materi Pembelajaran
            </h1>
            <p className="text-sm text-zinc-300 sm:text-base">
              Raih poin dari kelulusan CBT, presensi kelas, dan cashback. Tukarkan langsung dengan buku fisik cetak, modul latihan eksklusif, dan merchandise resmi Arkanin.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row md:flex-col md:items-end">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Coins className="size-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Saldo Poin Anda</p>
                  <p className="text-2xl font-black text-amber-400">
                    {userPoints !== null ? `${userPoints.toLocaleString('id-ID')} Poin` : '...'}
                  </p>
                  <Link href="/points" className="text-xs text-indigo-300 underline hover:text-indigo-200">
                    Lihat riwayat & leaderboard &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <Button asChild className="rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400">
                <Link href="/auth/login?redirect=/store">Masuk untuk Cek Poin</Link>
              </Button>
            )}

            {isAuthenticated && (
              <Button asChild variant="outline" size="sm" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link href="/store/orders">
                  <ShoppingBag className="mr-2 size-4" /> Riwayat Pesanan Saya
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white'
                }`}
              >
                <Icon className="mr-1.5 size-3.5" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Cari buku, merchandise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 rounded-full"
          />
        </form>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20">
          <PageLoader text="Memuat katalog Store..." />
        </div>
      ) : products.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-800">
          <div className="max-w-md space-y-3">
            <Package className="mx-auto size-12 text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Belum ada produk di etalase</h3>
            <p className="text-sm text-zinc-500">
              {searchQuery
                ? `Tidak ditemukan produk dengan kata kunci "${searchQuery}".`
                : 'Produk untuk kategori ini sedang disiapkan. Silakan cek kembali nanti.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  fetchProducts();
                }}
              >
                Reset Pencarian
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const hasPoints = product.price_points > 0;
            const hasCash = product.price_cash && Number(product.price_cash) > 0;
            const isOutOfStock = product.stock <= 0;

            return (
              <Card
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Package className="size-12 stroke-1" />
                        <span className="text-xs font-medium">Arkanin Official</span>
                      </div>
                    )}

                    {/* Stock Badge */}
                    <div className="absolute right-3 top-3">
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="shadow-sm">
                          Stok Habis
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                          Stok: {product.stock}
                        </Badge>
                      )}
                    </div>

                    {/* Category Tag */}
                    {product.category && (
                      <div className="absolute left-3 top-3">
                        <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900/80 text-xs backdrop-blur-md">
                          {product.category === 'book' ? 'Buku' : product.category === 'module' ? 'Modul' : 'Merch'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="line-clamp-1 text-base font-bold group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    {product.description && (
                      <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {product.description}
                      </p>
                    )}
                  </CardHeader>
                </div>

                {/* Footer Pricing & CTA */}
                <CardFooter className="flex flex-col gap-3 p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 mt-auto">
                  <div className="flex w-full items-center justify-between">
                    <div>
                      {hasPoints && (
                        <div className="flex items-center gap-1 text-sm font-extrabold text-amber-500">
                          <Coins className="size-4" />
                          <span>{product.price_points.toLocaleString('id-ID')} Poin</span>
                        </div>
                      )}
                      {hasCash && (
                        <p className={`text-xs ${hasPoints ? 'text-zinc-400 line-through mt-0.5' : 'text-sm font-bold text-zinc-800 dark:text-zinc-200'}`}>
                          {currency(product.price_cash)}
                        </p>
                      )}
                    </div>

                    <Button
                      asChild
                      size="sm"
                      disabled={isOutOfStock}
                      className="rounded-xl shadow-sm transition-all"
                    >
                      <Link href={`/store/${product.slug}`}>
                        Beli <ArrowRight className="ml-1 size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
