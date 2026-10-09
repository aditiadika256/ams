'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Mail, Phone, ShieldCheck, ArrowRight, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';

interface OtpVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'email' | 'whatsapp';
  currentValue: string;
  onSuccess?: () => void;
}

export default function OtpVerificationModal({
  open,
  onOpenChange,
  type,
  currentValue,
  onSuccess,
}: OtpVerificationModalProps) {
  const { fetchUser } = useAuthStore();
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [newValue, setNewValue] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('input');
      setNewValue('');
      setOtp('');
      setDevOtpHint(null);
      setTimer(60);
      setCanResend(false);
    }
  }, [open]);

  useEffect(() => {
    let interval: any;
    if (step === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const isEmail = type === 'email';
  const title = isEmail ? 'Ubah Alamat Email' : 'Ubah Nomor WhatsApp';
  const Icon = isEmail ? Mail : Phone;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newValue.trim();

    if (!val) {
      alertActions.error('Form Belum Lengkap', `Silakan masukkan ${isEmail ? 'email' : 'nomor WhatsApp'} baru.`);
      return;
    }

    if (val === currentValue) {
      alertActions.error('Data Sama', `${isEmail ? 'Email' : 'Nomor'} baru tidak boleh sama dengan yang lama.`);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.auth.requestOtp(type, val);
      if (res.data?.dev_otp) {
        setDevOtpHint(res.data.dev_otp);
      }
      setStep('verify');
      setTimer(60);
      setCanResend(false);
      alertActions.success('OTP Terkirim', `Kode verifikasi telah dikirimkan ke ${val}.`);
    } catch (err: any) {
      alertActions.error('Gagal Mengirim OTP', err?.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      setLoading(true);
      const res = await apiClient.auth.requestOtp(type, newValue.trim());
      if (res.data?.dev_otp) {
        setDevOtpHint(res.data.dev_otp);
      }
      setTimer(60);
      setCanResend(false);
      alertActions.success('OTP Dikirim Ulang', 'Kode verifikasi baru telah dikirim.');
    } catch (err: any) {
      alertActions.error('Gagal Kirim Ulang', err?.response?.data?.message || 'Gagal mengirim ulang kode.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.trim();

    if (otpCode.length < 6) {
      alertActions.error('Kode Tidak Lengkap', 'Masukkan 6 digit kode OTP.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.auth.verifyOtp(type, otpCode, newValue.trim());
      alertActions.success('Berhasil Diperbarui', `${isEmail ? 'Email' : 'WhatsApp'} Anda berhasil diubah.`);
      await fetchUser();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alertActions.error('Verifikasi Gagal', err?.response?.data?.message || 'Kode OTP tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl border-border">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Icon className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === 'input'
              ? `Demi keamanan data, perubahan ${isEmail ? 'email' : 'nomor WhatsApp'} membutuhkan verifikasi kode OTP.`
              : `Masukkan 6 digit kode OTP yang telah dikirim ke ${newValue}.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {isEmail ? 'Email Saat Ini' : 'Nomor WhatsApp Saat Ini'}
              </Label>
              <div className="text-sm font-medium p-2.5 bg-muted/50 rounded-xl border border-border/50 truncate">
                {currentValue || 'Belum diisi'}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-val" className="text-xs font-semibold">
                {isEmail ? 'Alamat Email Baru' : 'Nomor WhatsApp Baru'}
              </Label>
              <div className="relative">
                <Icon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="new-val"
                  type={isEmail ? 'email' : 'tel'}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={isEmail ? 'contoh: nama@domain.com' : 'contoh: 081234567890'}
                  className="h-10 pl-9 text-sm rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-xs">
                Batal
              </Button>
              <Button type="submit" disabled={loading || !newValue} className="rounded-xl text-xs gap-1.5 font-semibold">
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Kode OTP
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="otp-input" className="text-xs font-semibold">
                  6-Digit Kode OTP
                </Label>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-[11px] text-primary hover:underline"
                >
                  Ganti {isEmail ? 'email' : 'nomor'}?
                </button>
              </div>

              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3 size-4 text-primary" />
                <Input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="h-11 pl-9 text-center text-lg tracking-widest font-mono font-bold rounded-xl"
                  autoFocus
                  required
                />
              </div>

              {/* Dev mode helper */}
              {devOtpHint && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between">
                  <span>Kode OTP Simulasi (Dev): <strong>{devOtpHint}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtpHint)}
                    className="underline text-[11px] font-semibold"
                  >
                    Pakai Kode
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Tidak menerima kode?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="size-3" />
                  Kirim Ulang
                </button>
              ) : (
                <span>Kirim ulang dalam {timer}s</span>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-xs">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading || otp.length < 6}
                className="rounded-xl text-xs gap-1.5 font-semibold shadow-md shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    Verifikasi & Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
