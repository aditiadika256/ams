'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, ShieldCheck, KeyRound,
  Download, Clock, CheckCircle2, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/useAuthStore';

function currency(val: string | number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function WalletPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [data, setData] = useState<{
    has_pin: boolean;
    is_pin_locked: boolean;
    student_wallet: { id: number; balance: string; pending_balance: string };
    mentor_wallet: { id: number; balance: string; pending_balance: string };
    recent_transactions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // PIN modal
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // Withdraw modal
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await apiClient.wallet.me();
      if (res.data) setData(res.data);
    } catch (err) {
      alertActions.error('Gagal memuat dompet', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) void fetchWallet();
  }, [isAuthenticated]);

  const handleSavePin = async () => {
    if (!/^\d{6}$/.test(pinInput)) {
      alertActions.error('PIN tidak valid', 'PIN harus berupa 6 digit angka.');
      return;
    }
    setPinLoading(true);
    try {
      await apiClient.wallet.setPin(pinInput);
      alertActions.success('Berhasil', 'PIN transaksi Anda berhasil disimpan.');
      setPinModalOpen(false);
      setPinInput('');
      void fetchWallet();
    } catch (err) {
      alertActions.error('Gagal menyimpan PIN', getErrorMessage(err));
    } finally {
      setPinLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 10000) {
      alertActions.error('Nominal tidak valid', 'Minimal penarikan adalah Rp 10.000.');
      return;
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      alertActions.error('Data rekening belum lengkap', 'Mohon isi semua data bank.');
      return;
    }
    if (!/^\d{6}$/.test(withdrawPin)) {
      alertActions.error('PIN tidak valid', 'PIN harus berupa 6 digit angka.');
      return;
    }

    setWithdrawLoading(true);
    try {
      await apiClient.wallet.withdraw({
        amount,
        bank_name: bankName,
        bank_account_number: accountNumber,
        bank_account_name: accountName,
        pin: withdrawPin,
        notes: withdrawNotes || undefined,
      });
      alertActions.success('Pengajuan Berhasil', 'Pengajuan pencairan honor telah terkirim dan segera diverifikasi admin.');
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawPin('');
      void fetchWallet();
    } catch (err) {
      alertActions.error('Pencairan Gagal', getErrorMessage(err));
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (authLoading || (loading && !data)) return <PageLoader />;

  const studentBalance = Number(data?.student_wallet?.balance ?? 0);
  const mentorBalance = Number(data?.mentor_wallet?.balance ?? 0);
  const mentorPending = Number(data?.mentor_wallet?.pending_balance ?? 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dompet Saya</h1>
          <p className="mt-1 text-sm text-zinc-500">Kelola saldo deposit, refund belanja, dan honor mengajar mentor.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void fetchWallet()} className="gap-1.5">
            <RefreshCw className="size-4" />
            Muat Ulang
          </Button>

          {/* PIN Setup Dialog */}
          <Dialog open={pinModalOpen} onOpenChange={setPinModalOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <KeyRound className="size-4" />
                {data?.has_pin ? 'Ubah PIN Transaksi' : 'Atur PIN Transaksi'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  {data?.has_pin ? 'Ubah PIN Transaksi 6-Digit' : 'Atur PIN Transaksi 6-Digit'}
                </DialogTitle>
                <DialogDescription>
                  PIN digunakan untuk otentikasi saat pembayaran dompet dan penarikan saldo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <Label htmlFor="new-pin">Masukkan 6 Digit Angka</Label>
                <Input
                  id="new-pin"
                  type="password"
                  maxLength={6}
                  placeholder="******"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  disabled={pinLoading}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button onClick={() => void handleSavePin()} disabled={pinLoading || pinInput.length !== 6}>
                  {pinLoading ? <><Loader2 className="size-4 animate-spin mr-2" />Menyimpan…</> : 'Simpan PIN'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        {/* Student Wallet */}
        <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dompet Siswa</span>
              <Badge variant="secondary" className="font-normal">Deposit & Refund</Badge>
            </div>
            <CardTitle className="text-3xl font-bold text-primary mt-2">
              {currency(studentBalance)}
            </CardTitle>
            <CardDescription>
              Dapat langsung digunakan untuk membayar pesanan program di checkout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/programs">Belanja Program Sekarang</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Mentor Wallet */}
        <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dompet Mentor</span>
              {mentorPending > 0 && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
                  <Clock className="size-3 mr-1" />
                  Pending: {currency(mentorPending)}
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {currency(mentorBalance)}
            </CardTitle>
            <CardDescription>
              Akumulasi honor sesi mengajar yang siap ditarik ke rekening bank Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Withdraw Modal */}
            <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full gap-1.5" disabled={mentorBalance < 10000}>
                  <Download className="size-4" />
                  Tarik Honor ke Rekening
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Tarik Honor Mentor</DialogTitle>
                  <DialogDescription>
                    Saldo yang dapat ditarik: <strong>{currency(mentorBalance)}</strong> (minimal Rp 10.000).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2 text-sm">
                  <div>
                    <Label htmlFor="w-amount">Nominal Penarikan (Rp)</Label>
                    <Input
                      id="w-amount"
                      type="number"
                      placeholder="Contoh: 50000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="w-bank">Nama Bank</Label>
                      <Input
                        id="w-bank"
                        placeholder="BCA / Mandiri / BNI / BRI"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="w-acc-num">Nomor Rekening</Label>
                      <Input
                        id="w-acc-num"
                        placeholder="1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="w-acc-name">Nama Pemilik Rekening</Label>
                    <Input
                      id="w-acc-name"
                      placeholder="Sesuai buku tabungan"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="w-pin">PIN Transaksi (6 Digit)</Label>
                    <Input
                      id="w-pin"
                      type="password"
                      maxLength={6}
                      placeholder="******"
                      value={withdrawPin}
                      onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="w-notes">Catatan (Opsional)</Label>
                    <Input
                      id="w-notes"
                      placeholder="Contoh: Honor Batch September"
                      value={withdrawNotes}
                      onChange={(e) => setWithdrawNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => void handleWithdraw()} disabled={withdrawLoading}>
                    {withdrawLoading ? <><Loader2 className="size-4 animate-spin mr-2" />Memproses…</> : 'Ajukan Penarikan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Transactions History */}
      <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl">Riwayat Mutasi Saldo</CardTitle>
          <CardDescription>Catatan ledger mutasi kredit dan debit terkini.</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.recent_transactions?.length ? (
            <div className="py-12 text-center text-zinc-500">
              <Wallet className="size-10 mx-auto text-zinc-400 mb-2 opacity-60" />
              <p>Belum ada transaksi mutasi di dompet Anda.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {data.recent_transactions.map((tx: any) => {
                const isCredit = tx.type === 'credit';
                return (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isCredit ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'}`}>
                        {isCredit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(tx.created_at)} · Saldo setelahnya: {currency(tx.balance_after)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isCredit ? '+' : '-'}{currency(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
