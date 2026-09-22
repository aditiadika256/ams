'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';

interface PayWithWalletModalProps {
  orderId: number;
  orderTotal: string | number;
  onSuccess?: () => void;
}

function currency(value: string | number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
}

export function PayWithWalletModal({ orderId, orderTotal, onSuccess }: PayWithWalletModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingWallet, setFetchingWallet] = useState(false);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [walletData, setWalletData] = useState<{
    has_pin: boolean;
    is_pin_locked: boolean;
    balance: number;
  } | null>(null);

  const loadWallet = async () => {
    setFetchingWallet(true);
    try {
      const res = await apiClient.wallet.me();
      if (res.data) {
        setWalletData({
          has_pin: res.data.has_pin,
          is_pin_locked: res.data.is_pin_locked,
          balance: Number(res.data.student_wallet.balance),
        });
      }
    } catch {
      alertActions.error('Gagal memuat saldo', 'Tidak dapat mengambil informasi dompet Anda.');
    } finally {
      setFetchingWallet(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setPin('');
      setNewPin('');
      void loadWallet();
    }
  };

  const handleSetPin = async () => {
    if (!/^\d{6}$/.test(newPin)) {
      alertActions.error('PIN tidak valid', 'PIN harus berupa 6 digit angka.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.wallet.setPin(newPin);
      alertActions.success('PIN tersimpan', 'PIN transaksi berhasil diatur.');
      setPin(newPin);
      if (walletData) {
        setWalletData({ ...walletData, has_pin: true });
      }
    } catch (err) {
      alertActions.error('Gagal menyimpan PIN', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!/^\d{6}$/.test(pin)) {
      alertActions.error('PIN tidak valid', 'PIN harus berupa 6 digit angka.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.wallet.payOrder(orderId, pin);
      alertActions.success('Pembayaran Berhasil!', 'Pesanan telah dibayar dengan saldo dompet.');
      setOpen(false);
      onSuccess?.();
      router.push('/workspace');
    } catch (err) {
      alertActions.error('Pembayaran Gagal', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const total = Number(orderTotal);
  const sufficientBalance = (walletData?.balance ?? 0) >= total;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12 gap-2 text-base font-semibold border-primary/40 hover:bg-primary/5">
          <Wallet className="size-5 text-primary" />
          Bayar dengan Saldo Dompet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            Bayar via Dompet Siswa
          </DialogTitle>
          <DialogDescription>
            Gunakan saldo deposit/refund Anda untuk membayar pesanan ini secara instan.
          </DialogDescription>
        </DialogHeader>

        {fetchingWallet ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="flex justify-between items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 p-4">
              <div>
                <p className="text-xs text-zinc-500">Saldo Dompet Siswa</p>
                <p className="text-lg font-bold text-primary">{currency(walletData?.balance ?? 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Total Pesanan</p>
                <p className="text-lg font-bold">{currency(total)}</p>
              </div>
            </div>

            {!sufficientBalance && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>Saldo tidak mencukupi untuk pesanan ini. Silakan gunakan Midtrans.</span>
              </div>
            )}

            {sufficientBalance && !walletData?.has_pin && (
              <div className="grid gap-3 rounded-lg border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                  <KeyRound className="size-4" />
                  Buat PIN Transaksi Baru (6 Digit)
                </div>
                <Input
                  type="password"
                  maxLength={6}
                  placeholder="Contoh: 123456"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                />
                <Button size="sm" onClick={() => void handleSetPin()} disabled={loading || newPin.length !== 6}>
                  {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
                  Simpan PIN
                </Button>
              </div>
            )}

            {sufficientBalance && walletData?.has_pin && (
              <div className="grid gap-2">
                <Label htmlFor="tx-pin">Masukkan 6 Digit PIN Transaksi</Label>
                <Input
                  id="tx-pin"
                  type="password"
                  maxLength={6}
                  placeholder="******"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && pin.length === 6) void handlePay(); }}
                  disabled={loading || walletData.is_pin_locked}
                  autoFocus
                />
                {walletData.is_pin_locked && (
                  <p className="text-xs text-red-500">PIN sedang terkunci selama 30 menit karena salah 3x.</p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {sufficientBalance && walletData?.has_pin && (
            <Button
              className="w-full"
              onClick={() => void handlePay()}
              disabled={loading || pin.length !== 6 || walletData.is_pin_locked}
            >
              {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Memproses Pembayaran…</> : 'Konfirmasi Bayar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
