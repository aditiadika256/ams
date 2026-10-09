'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Hash,
  Camera,
  Lock,
  CheckCircle2,
  Edit3,
  Loader2,
  ShieldCheck,
  Save,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BranchItem } from '@/types/auth';
import OtpVerificationModal from './OtpVerificationModal';

export default function StudentProfileCard() {
  const { user, fetchUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [name, setName] = useState(user?.name || '');
  const [branchId, setBranchId] = useState<string>(user?.branch_id ? String(user.branch_id) : '');
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // OTP Modal states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'whatsapp'>('email');

  // Load branches
  useEffect(() => {
    async function loadBranches() {
      try {
        setLoadingBranches(true);
        const res = await apiClient.auth.getBranches();
        if (res.data) {
          setBranches(res.data);
        }
      } catch (err) {
        console.error('Failed to load branches', err);
      } finally {
        setLoadingBranches(false);
      }
    }
    loadBranches();
  }, []);

  // Sync state with user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.branch_id) {
        setBranchId(String(user.branch_id));
      }
    }
  }, [user]);

  // Handle Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alertActions.error('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 5MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      await apiClient.auth.uploadAvatar(file);
      alertActions.success('Foto Berhasil Diperbarui', 'Foto profil baru Anda telah disimpan.');
      await fetchUser();
    } catch (err: any) {
      alertActions.error('Gagal Mengunggah Foto', err?.response?.data?.message || 'Terjadi kesalahan saat unggah foto.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alertActions.error('Nama Wajib Diisi', 'Silakan masukkan nama lengkap Anda.');
      return;
    }
    try {
      setSavingName(true);
      await apiClient.auth.updateProfile({ name: name.trim() });
      alertActions.success('Nama Disimpan', 'Nama lengkap berhasil diperbarui.');
      await fetchUser();
    } catch (err: any) {
      alertActions.error('Gagal Menyimpan Nama', err?.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setSavingName(false);
    }
  };

  // Save Branch
  const handleBranchChange = async (val: string) => {
    setBranchId(val);
    try {
      setSavingBranch(true);
      await apiClient.auth.updateProfile({ branch_id: Number(val) });
      alertActions.success('Cabang Diperbarui', 'Pilihan cabang belajar Anda berhasil disimpan.');
      await fetchUser();
    } catch (err: any) {
      alertActions.error('Gagal Mengubah Cabang', err?.response?.data?.message || 'Gagal mengubah cabang.');
    } finally {
      setSavingBranch(false);
    }
  };

  // Open OTP Modal
  const openOtp = (type: 'email' | 'whatsapp') => {
    setOtpType(type);
    setOtpModalOpen(true);
  };

  const formattedId = user?.id ? `#ARK-${String(user.id).padStart(5, '0')}` : '#ARK-00000';
  const formattedJoinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '10 Januari 2026';

  const userPhone = user?.profile?.phone || 'Belum diatur';

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((x) => x[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card Foto Profile & Ringkasan ID */}
      <Card className="border-border/60 shadow-sm overflow-hidden bg-gradient-to-br from-card via-card to-primary/[0.04]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Foto Profile dengan Tombol Kamera Overlay */}
            <div className="relative group shrink-0">
              <Avatar className="size-24 sm:size-28 rounded-3xl ring-4 ring-primary/20 shadow-lg object-cover">
                <AvatarImage
                  src={user?.avatar_url || user?.profile_image_url || ''}
                  alt={user?.name || 'User'}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold rounded-3xl">
                  {user?.name ? getInitials(user.name) : <User className="size-10" />}
                </AvatarFallback>
              </Avatar>

              {/* Upload trigger overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 size-9 rounded-2xl bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                title="Ganti Foto Profil"
                aria-label="Ganti Foto Profil"
              >
                {uploadingAvatar ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </div>

            {/* Profile Bio Details */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate">
                    {user?.name || 'Pengguna Arkanin'}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                    <Mail className="size-3.5 text-primary" />
                    <span>{user?.email || 'email@example.com'}</span>
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="rounded-xl text-xs gap-1.5 border-border/80 self-center sm:self-start"
                >
                  <Camera className="size-3.5 text-primary" />
                  {uploadingAvatar ? 'Mengunggah...' : 'Ubah Foto Profil'}
                </Button>
              </div>

              {/* Badges Info */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                <Badge variant="outline" className="rounded-lg bg-primary/10 text-primary border-primary/20 font-semibold gap-1 py-1">
                  <Hash className="size-3" />
                  {formattedId}
                </Badge>
                <Badge variant="outline" className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold gap-1 py-1">
                  <CheckCircle2 className="size-3" />
                  Akun Terverifikasi
                </Badge>
                <Badge variant="outline" className="rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold gap-1 py-1">
                  <Clock className="size-3" />
                  Bergabung {formattedJoinedDate}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Form Konten Utama Profil Student */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="size-4 text-primary" />
            Informasi Akun & Data Profil
          </CardTitle>
          <CardDescription className="text-xs">
            Data identitas student. ID Pengguna dan Waktu Bergabung bersifat tetap. Perubahan Email dan WhatsApp memerlukan verifikasi OTP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Grid Informasi Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Field 1: Nama Lengkap (Editable) */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fullname" className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  Nama Lengkap
                </Label>
                <span className="text-[11px] text-primary font-medium flex items-center gap-1">
                  <Edit3 className="size-3" /> Dapat Diedit
                </span>
              </div>
              <form onSubmit={handleSaveName} className="flex gap-2">
                <Input
                  id="fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="h-10 text-sm rounded-xl"
                  required
                />
                <Button
                  type="submit"
                  disabled={savingName || name === user?.name}
                  className="h-10 px-4 rounded-xl text-xs gap-1.5 shrink-0 font-semibold shadow-sm"
                >
                  {savingName ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Simpan Nama
                </Button>
              </form>
            </div>

            {/* Field 2: ID Pengguna (Fixed / Read-only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Hash className="size-3.5 text-muted-foreground" />
                  ID Pengguna
                </Label>
                <Badge variant="secondary" className="text-[10px] gap-1 py-0.5 rounded-md font-mono bg-muted text-muted-foreground">
                  <Lock className="size-2.5" /> Tetap (Read-Only)
                </Badge>
              </div>
              <div className="flex items-center justify-between h-10 px-3.5 bg-muted/40 rounded-xl border border-border/60 text-sm font-mono font-bold text-foreground">
                <span>{formattedId}</span>
                <span className="text-xs text-muted-foreground font-normal">Internal ID: #{user?.id}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                ID Pengguna dibuat secara otomatis oleh sistem Arkanin dan tidak dapat diubah.
              </p>
            </div>

            {/* Field 3: Waktu Bergabung (Fixed / Read-only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Waktu Bergabung
                </Label>
                <Badge variant="secondary" className="text-[10px] gap-1 py-0.5 rounded-md font-mono bg-muted text-muted-foreground">
                  <Lock className="size-2.5" /> Tetap (Read-Only)
                </Badge>
              </div>
              <div className="flex items-center justify-between h-10 px-3.5 bg-muted/40 rounded-xl border border-border/60 text-sm font-semibold text-foreground">
                <span>{formattedJoinedDate}</span>
                <Clock className="size-4 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tanggal resmi saat akun pertama kali didaftarkan di platform Arkanin.
              </p>
            </div>

            {/* Field 4: Branch (Editable Dropdown) */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" />
                  Branch (Cabang Belajar)
                </Label>
                <span className="text-[11px] text-primary font-medium flex items-center gap-1">
                  <Edit3 className="size-3" /> Dapat Diedit
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Select
                    value={branchId}
                    onValueChange={handleBranchChange}
                    disabled={loadingBranches || savingBranch}
                  >
                    <SelectTrigger className="h-10 text-sm rounded-xl">
                      <SelectValue placeholder={loadingBranches ? 'Memuat cabang...' : 'Pilih cabang belajar'} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name} {b.code ? `(${b.code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {savingBranch && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                    <span>Menyimpan cabang...</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pilih cabang Arkanin terdekat tempat Anda mengikuti kelas tatap muka atau pembinaan tryout.
              </p>
            </div>

            {/* Field 5: Email (Editable WITH OTP) */}
            <div className="space-y-2 p-4 bg-muted/20 border border-border/60 rounded-2xl">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Mail className="size-3.5 text-primary" />
                  Alamat Email
                </Label>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold gap-1">
                  <ShieldCheck className="size-3" /> Wajib OTP
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-foreground truncate py-1">
                  {user?.email || 'email@example.com'}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openOtp('email')}
                  className="rounded-xl text-xs gap-1.5 h-8 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <ShieldCheck className="size-3.5 text-primary" />
                  Ubah Email
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Perubahan email akan mengirimkan kode OTP 6-digit ke email baru Anda untuk diverifikasi.
              </p>
            </div>

            {/* Field 6: Whatsapp (Editable WITH OTP) */}
            <div className="space-y-2 p-4 bg-muted/20 border border-border/60 rounded-2xl">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Phone className="size-3.5 text-emerald-500" />
                  Nomor WhatsApp
                </Label>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold gap-1">
                  <ShieldCheck className="size-3" /> Wajib OTP
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-foreground truncate py-1">
                  {userPhone}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openOtp('whatsapp')}
                  className="rounded-xl text-xs gap-1.5 h-8 shrink-0 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                >
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  Ubah WhatsApp
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Perubahan WhatsApp akan mengirimkan kode OTP 6-digit untuk memastikan nomor Anda aktif.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog OTP untuk Email dan WhatsApp */}
      <OtpVerificationModal
        open={otpModalOpen}
        onOpenChange={setOtpModalOpen}
        type={otpType}
        currentValue={otpType === 'email' ? user?.email || '' : userPhone}
        onSuccess={() => fetchUser()}
      />
    </div>
  );
}
