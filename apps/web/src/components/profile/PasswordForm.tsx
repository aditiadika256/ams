'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ShieldCheck, Loader2 } from 'lucide-react';

export default function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Password Strength Calculations
  const hasMinLength = formData.new_password.length >= 8;
  const hasNumber = /\d/.test(formData.new_password);
  const hasLetter = /[a-zA-Z]/.test(formData.new_password);
  const passwordsMatch =
    Boolean(formData.new_password) &&
    formData.new_password === formData.new_password_confirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength) {
      alertActions.error('Kata Sandi Terlalu Pendek', 'Kata sandi baru minimal 8 karakter.');
      return;
    }

    if (!passwordsMatch) {
      alertActions.error('Konfirmasi Tidak Cocok', 'Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.auth.changePassword(formData);
      alertActions.success('Kata Sandi Diperbarui', 'Kata sandi Anda berhasil diubah. Gunakan kata sandi baru untuk login.');
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err: any) {
      alertActions.error('Gagal Mengubah Kata Sandi', err?.response?.data?.message || 'Pastikan kata sandi saat ini benar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm max-w-xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          Ganti Kata Sandi
        </CardTitle>
        <CardDescription className="text-xs">
          Perbarui kata sandi secara berkala untuk menjaga keamanan akun Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kata Sandi Saat Ini */}
          <div className="space-y-1.5">
            <Label htmlFor="current_password" className="text-xs font-medium">Kata Sandi Saat Ini</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="current_password"
                name="current_password"
                type={showCurrent ? 'text' : 'password'}
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi saat ini"
                className="h-10 pl-9 pr-10 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                aria-label={showCurrent ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Kata Sandi Baru */}
          <div className="space-y-1.5">
            <Label htmlFor="new_password" className="text-xs font-medium">Kata Sandi Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="new_password"
                name="new_password"
                type={showNew ? 'text' : 'password'}
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter kombinasi"
                className="h-10 pl-9 pr-10 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi Baru */}
          <div className="space-y-1.5">
            <Label htmlFor="new_password_confirmation" className="text-xs font-medium">Konfirmasi Kata Sandi Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="new_password_confirmation"
                name="new_password_confirmation"
                type={showConfirm ? 'text' : 'password'}
                value={formData.new_password_confirmation}
                onChange={handleChange}
                placeholder="Ulangi kata sandi baru"
                className="h-10 pl-9 pr-10 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Validasi Kriteria */}
          <div className="p-3 bg-muted/40 rounded-xl space-y-2 border border-border/40 text-xs">
            <span className="font-semibold text-foreground block mb-1">Ketentuan Kata Sandi:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="size-3.5 text-muted-foreground/60" />
                )}
                <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                  Minimal 8 karakter
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasNumber && hasLetter ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="size-3.5 text-muted-foreground/60" />
                )}
                <span className={hasNumber && hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                  Kombinasi huruf & angka
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                {passwordsMatch ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="size-3.5 text-muted-foreground/60" />
                )}
                <span className={passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                  Konfirmasi kata sandi cocok
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={loading || !hasMinLength || !passwordsMatch}
              className="w-full sm:w-auto h-11 px-8 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memperbarui...
                </>
              ) : (
                'Simpan Kata Sandi'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
