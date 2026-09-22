'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, Plus, Edit2, Trash2, Truck, CheckCircle2, 
  Clock, XCircle, Search, Filter, Loader2, Coins, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';

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

interface StoreOrder {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  total_points: number;
  total_cash: string | number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  tracking_number: string | null;
  created_at: string;
  items?: Array<{
    id: number;
    product_name: string;
    quantity: number;
    points_each: number;
  }>;
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

export default function AdminStorePage() {
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Product modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPricePoints, setFormPricePoints] = useState(0);
  const [formPriceCash, setFormPriceCash] = useState('');
  const [formStock, setFormStock] = useState(10);
  const [formCategory, setFormCategory] = useState('book');
  const [formIsActive, setFormIsActive] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  // Order status modal
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>('confirmed');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.admin.store.products();
      const items = res.data?.data || res.data || [];
      setProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await apiClient.admin.store.orders();
      const items = res.data?.data || res.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const openAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormImageUrl('');
    setFormPricePoints(100);
    setFormPriceCash('');
    setFormStock(20);
    setFormCategory('book');
    setFormIsActive(true);
    setProductModalOpen(true);
  };

  const openEditProduct = (prod: StoreProduct) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormDescription(prod.description || '');
    setFormImageUrl(prod.image_url || '');
    setFormPricePoints(prod.price_points);
    setFormPriceCash(prod.price_cash ? String(prod.price_cash) : '');
    setFormStock(prod.stock);
    setFormCategory(prod.category || 'book');
    setFormIsActive(prod.is_active);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alertActions.error('Nama produk wajib diisi.');
      return;
    }

    setSavingProduct(true);
    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        image_url: formImageUrl.trim() || null,
        price_points: Number(formPricePoints),
        price_cash: formPriceCash ? Number(formPriceCash) : null,
        stock: Number(formStock),
        category: formCategory,
        is_active: formIsActive,
      };

      if (editingProduct) {
        await apiClient.admin.store.updateProduct(editingProduct.id, payload);
        alertActions.success('Produk berhasil diperbarui.');
      } else {
        await apiClient.admin.store.createProduct(payload);
        alertActions.success('Produk baru berhasil ditambahkan.');
      }

      setProductModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alertActions.error(getErrorMessage(err) || 'Gagal menyimpan produk.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini dari etalase?')) return;
    try {
      await apiClient.admin.store.deleteProduct(id);
      alertActions.success('Produk berhasil dihapus.');
      fetchProducts();
    } catch (err: any) {
      alertActions.error(getErrorMessage(err) || 'Gagal menghapus produk.');
    }
  };

  const openUpdateOrder = (order: StoreOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.tracking_number || '');
    setOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdatingOrder(true);
    try {
      await apiClient.admin.store.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        newStatus === 'shipped' ? trackingNumber : undefined
      );

      alertActions.success(`Status pes #${selectedOrder.order_number} berhasil diubah.`);
      setOrderModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      alertActions.error(getErrorMessage(err) || 'Gagal mengubah status pesanan.');
    } finally {
      setUpdatingOrder(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link href="/admin">
              <ArrowLeft className="mr-2 size-4" /> Kembali ke Admin Panel
            </Link>
          </Button>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Manajemen Store & Pengiriman Fisik
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Kelola katalog buku materi, merchandise, stok, dan proses pengiriman pesanan siswa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshAll} className="rounded-xl">
            <RefreshCw className="mr-1.5 size-3.5" /> Segarkan
          </Button>
          {tab === 'products' && (
            <Button onClick={openAddProduct} size="sm" className="rounded-xl shadow-md">
              <Plus className="mr-1.5 size-4" /> Tambah Produk Baru
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setTab('products')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            tab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Package className="size-4" />
          Katalog Produk ({products.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            tab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Truck className="size-4" />
          Pesanan Pengiriman ({orders.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20">
          <PageLoader text="Memuat data Store admin..." />
        </div>
      ) : tab === 'products' ? (
        /* Products Table */
        <Card className="overflow-hidden rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200/80 bg-zinc-50/75 text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga Poin</th>
                  <th className="px-6 py-4">Harga Tunai</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                      Belum ada produk Store. Klik "Tambah Produk Baru" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt={prod.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="size-5 text-zinc-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white">{prod.name}</p>
                            <p className="text-xs text-zinc-400 line-clamp-1">{prod.description || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs uppercase">
                          {prod.category || 'Lainnya'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-500">
                        {prod.price_points.toLocaleString('id-ID')} Poin
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300">
                        {currency(prod.price_cash)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={prod.stock > 0 ? 'secondary' : 'destructive'}>
                          {prod.stock} unit
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={prod.is_active ? 'default' : 'outline'}>
                          {prod.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditProduct(prod)}
                            className="size-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="size-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Orders Table */
        <Card className="overflow-hidden rounded-2xl border-zinc-200/80 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200/80 bg-zinc-50/75 text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
                <tr>
                  <th className="px-6 py-4">No. Pesanan</th>
                  <th className="px-6 py-4">Penerima & Alamat</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">No. Resi</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                      Belum ada pesanan Store yang masuk.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                      <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-white">
                        {ord.order_number}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-white">
                          {ord.shipping_name} ({ord.shipping_phone})
                        </p>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          {ord.shipping_address}, {ord.shipping_city || ''}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {ord.total_points > 0 && (
                          <span className="font-bold text-amber-500 block text-xs">
                            {ord.total_points.toLocaleString('id-ID')} Poin
                          </span>
                        )}
                        {ord.total_cash && Number(ord.total_cash) > 0 && (
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 block text-xs">
                            {currency(ord.total_cash)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            ord.status === 'completed'
                              ? 'default'
                              : ord.status === 'shipped'
                              ? 'secondary'
                              : ord.status === 'cancelled'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="capitalize"
                        >
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                        {ord.tracking_number || '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {formatDate(ord.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateOrder(ord)}
                          className="rounded-lg text-xs"
                        >
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Product Create/Edit Dialog */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveProduct}>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Produk Store' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription>
                Isi rincian produk fisik, modul cetak, atau merchandise Arkanin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="pname" className="text-xs font-semibold">Nama Produk *</Label>
                <Input
                  id="pname"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Modul Eksklusif UTBK SNBT 2027"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pdesc" className="text-xs font-semibold">Deskripsi</Label>
                <Textarea
                  id="pdesc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan isi buku, materi, atau spesifikasi barang"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pimg" className="text-xs font-semibold">URL Foto Produk</Label>
                <Input
                  id="pimg"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://... (URL gambar)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ppoints" className="text-xs font-semibold">Harga Poin *</Label>
                  <Input
                    id="ppoints"
                    type="number"
                    min={0}
                    value={formPricePoints}
                    onChange={(e) => setFormPricePoints(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pcash" className="text-xs font-semibold">Harga Tunai (Rp)</Label>
                  <Input
                    id="pcash"
                    type="number"
                    min={0}
                    placeholder="Contoh: 75000"
                    value={formPriceCash}
                    onChange={(e) => setFormPriceCash(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pstock" className="text-xs font-semibold">Stok Barang *</Label>
                  <Input
                    id="pstock"
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pcat" className="text-xs font-semibold">Kategori</Label>
                  <select
                    id="pcat"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="book">Buku Fisik</option>
                    <option value="module">Modul Cetak</option>
                    <option value="merchandise">Merchandise</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pactive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="size-4 rounded border-zinc-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="pactive" className="text-xs font-semibold cursor-pointer">
                  Tampilkan produk di etalase Store publik
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProductModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={savingProduct}>
                {savingProduct ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Produk'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Status Update Dialog */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateOrderStatus}>
            <DialogHeader>
              <DialogTitle>Update Status Pesanan</DialogTitle>
              <DialogDescription>
                Pesanan #{selectedOrder?.order_number} — {selectedOrder?.shipping_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">Status Pesanan</Label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                >
                  <option value="pending">Menunggu Konfirmasi (pending)</option>
                  <option value="confirmed">Dikonfirmasi / Diproses (confirmed)</option>
                  <option value="shipped">Dalam Pengiriman Ekspedisi (shipped)</option>
                  <option value="completed">Selesai / Diterima (completed)</option>
                  <option value="cancelled">Dibatalkan (cancelled & auto-refund poin)</option>
                </select>
              </div>

              {newStatus === 'shipped' && (
                <div className="space-y-1.5">
                  <Label htmlFor="resi" className="text-xs font-semibold">Nomor Resi Pengiriman *</Label>
                  <Input
                    id="resi"
                    placeholder="Contoh: JNE1234567890 / SICEPAT987654"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-zinc-400">
                    Siswa dapat memantau nomor resi ini di halaman riwayat pesanan mereka.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOrderModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updatingOrder}>
                {updatingOrder ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Perbarui Status'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
