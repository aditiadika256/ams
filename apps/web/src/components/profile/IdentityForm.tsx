'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function IdentityForm() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.profile?.phone || '',
    birth_place: user?.profile?.birth_place || '',
    birth_date: user?.profile?.birth_date || '',
    parent_name: user?.profile?.parent_name || '',
    parent_phone: user?.profile?.parent_phone || '',
    school_name: user?.profile?.school_name || '',
    school_level: user?.profile?.school_level || 'SMA',
    school_major: user?.profile?.school_major || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    province: user?.profile?.province || '',
    maps_url: user?.profile?.maps_url || '',
    house_photo_url: user?.profile?.house_photo_url || '',
  });

  // Sync when user profile updates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.profile?.phone || prev.phone,
        birth_place: user.profile?.birth_place || prev.birth_place,
        birth_date: user.profile?.birth_date || prev.birth_date,
        parent_name: user.profile?.parent_name || prev.parent_name,
        parent_phone: user.profile?.parent_phone || prev.parent_phone,
        school_name: user.profile?.school_name || prev.school_name,
        school_level: user.profile?.school_level || prev.school_level,
        school_major: user.profile?.school_major || prev.school_major,
        address: user.profile?.address || prev.address,
        city: user.profile?.city || prev.city,
        province: user.profile?.province || prev.province,
        maps_url: user.profile?.maps_url || prev.maps_url,
        house_photo_url: user.profile?.house_photo_url || prev.house_photo_url,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Upload Photo handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alertActions.error('Ukuran File Terlalu Besar', 'Maksimal ukuran foto adalah 5MB.');
      return;
    }

    try {
      setUploadingPhoto(true);
      const res = await apiClient.auth.uploadHousePhoto(file);
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, house_photo_url: res.data.url }));
        alertActions.success('Foto Terunggah', 'Foto depan rumah berhasil diunggah.');
        await fetchUser();
      }
    } catch (err: any) {
      alertActions.error('Gagal Mengunggah Foto', err?.response?.data?.message || 'Terjadi kesalahan saat unggah foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.auth.updateProfile(formData);
      alertActions.success('Identitas Tersimpan', 'Data profil dan identitas Anda berhasil diperbarui.');
      await fetchUser();
    } catch (err: any) {
      alertActions.error('Gagal Menyimpan', err?.response?.data?.message || 'Gagal menyimpan perubahan identitas.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion percentage
  const fieldsToCheck = [
    formData.name,
    formData.phone,
    formData.birth_place,
    formData.birth_date,
    formData.parent_name,
    formData.parent_phone,
    formData.school_name,
    formData.address,
    formData.maps_url,
    formData.house_photo_url,
  ];
  const filledCount = fieldsToCheck.filter((f) => Boolean(f)).length;
  const completionPercentage = Math.round((filledCount / fieldsToCheck.length) * 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kelengkapan Data Progress */}
      <Card className="border-primary/20 bg-primary/5 dark:bg-primary/[0.03]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Kelengkapan Identitas</h3>
                <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'} className="text-xs">
                  {completionPercentage}% Selesai
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Lengkapi identitas untuk mempercepat aktivasi dan verifikasi program bimbingan belajar.
              </p>
            </div>
            <div className="w-full sm:w-36 h-2 bg-muted rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Biodata Pribadi */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="size-4 text-primary" />
            Biodata Pribadi
          </CardTitle>
          <CardDescription className="text-xs">
            Informasi identitas dasar akun peserta atau pengajar
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name" className="text-xs font-medium">Nama Lengkap</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              className="h-10 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium">Nomor WhatsApp / HP Pribadi</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="081234567890"
                className="h-10 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birth_place" className="text-xs font-medium">Tempat Lahir</Label>
            <Input
              id="birth_place"
              name="birth_place"
              value={formData.birth_place}
              onChange={handleChange}
              placeholder="Contoh: Jakarta / Surabaya"
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="birth_date" className="text-xs font-medium">Tanggal Lahir</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                className="h-10 pl-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Data Orang Tua / Wali */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Data Orang Tua / Wali
          </CardTitle>
          <CardDescription className="text-xs">
            Kontak darurat dan koordinasi laporan perkembangan belajar
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="parent_name" className="text-xs font-medium">Nama Orang Tua / Wali</Label>
            <Input
              id="parent_name"
              name="parent_name"
              value={formData.parent_name}
              onChange={handleChange}
              placeholder="Nama Ayah / Ibu / Wali"
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="parent_phone" className="text-xs font-medium">WhatsApp Orang Tua</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="parent_phone"
                name="parent_phone"
                value={formData.parent_phone}
                onChange={handleChange}
                placeholder="0812xxxxxxxx"
                className="h-10 pl-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Riwayat Sekolah */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                Riwayat Sekolah
              </CardTitle>
              <CardDescription className="text-xs">
                Asal sekolah dan jenjang tingkatan peserta
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              Wajib untuk Program Tertentu
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/40 rounded-xl flex items-start gap-2.5 text-xs text-muted-foreground border border-border/40">
            <Info className="size-4 text-primary shrink-0 mt-0.5" />
            <p>
              Data riwayat sekolah ini akan diminta mengisi jika Anda mendaftar ke program bimbingan belajar atau seleksi kedinasan/CPNS tertentu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="school_name" className="text-xs font-medium">Asal Sekolah / Kampus</Label>
              <Input
                id="school_name"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                placeholder="Contoh: SMAN 1 Jakarta / Universitas Indonesia"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Jenjang</Label>
              <Select
                value={formData.school_level}
                onValueChange={(val) => handleSelectChange('school_level', val)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Pilih jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SD">SD / Sederajat</SelectItem>
                  <SelectItem value="SMP">SMP / Sederajat</SelectItem>
                  <SelectItem value="SMA">SMA / Sederajat</SelectItem>
                  <SelectItem value="SMK">SMK</SelectItem>
                  <SelectItem value="Kuliah">Perguruan Tinggi</SelectItem>
                  <SelectItem value="Umum">Umum / Kedinasan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="school_major" className="text-xs font-medium">Kelas / Jurusan / Peminatan</Label>
              <Input
                id="school_major"
                name="school_major"
                value={formData.school_major}
                onChange={handleChange}
                placeholder="Contoh: XII IPA 1 / Teknik Informatika"
                className="h-10 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Lokasi & Foto Depan Rumah */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            Lokasi Tempat Tinggal & Foto Rumah
          </CardTitle>
          <CardDescription className="text-xs">
            Alamat domisili, Maps tag lokasi, dan foto depan rumah
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-medium">Alamat Lengkap</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan"
              className="h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-medium">Kota / Kabupaten</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Kota domisili"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="province" className="text-xs font-medium">Provinsi</Label>
              <Input
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Provinsi domisili"
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Maps Tag Lokasi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="maps_url" className="text-xs font-medium">
                Maps Tag Lokasi (Pin Google Maps)
              </Label>
              <span className="text-[10px] text-muted-foreground">
                Bisa diisikan juga oleh admin cabang
              </span>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="maps_url"
                name="maps_url"
                value={formData.maps_url}
                onChange={handleChange}
                placeholder="Tempel tautan link Google Maps lokasi rumah Anda (https://maps.app.goo.gl/...)"
                className="h-10 pl-9 text-sm"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Perlu mengisi maps tag lokasi untuk verifikasi wilayah cabang, namun dapat juga diisikan atau diperbarui oleh admin operasional cabang.
            </p>
          </div>

          {/* Foto Depan Rumah */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <Label className="text-xs font-medium flex items-center justify-between">
              <span>Foto Depan Rumah</span>
              {formData.house_photo_url && (
                <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="size-3" /> Foto Terunggah
                </span>
              )}
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Preview image */}
              <div className="relative h-36 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center overflow-hidden">
                {formData.house_photo_url ? (
                  <img
                    src={formData.house_photo_url}
                    alt="Foto Depan Rumah"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground p-3 text-center">
                    <Camera className="size-8 mb-1.5 opacity-60" />
                    <span className="text-xs font-medium">Belum ada foto</span>
                    <span className="text-[10px] opacity-70">JPG, PNG, WebP maks 5MB</span>
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Upload trigger */}
              <div className="sm:col-span-2 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Unggah foto tampak depan rumah tempat tinggal Anda dengan jelas untuk kemudahan survei atau pengiriman modul/merchandise.
                </p>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingPhoto}
                      className="rounded-xl gap-2 text-xs"
                      asChild
                    >
                      <span>
                        <Upload className="size-3.5" />
                        {formData.house_photo_url ? 'Ganti Foto Rumah' : 'Pilih Foto Rumah'}
                      </span>
                    </Button>
                  </label>
                  {formData.house_photo_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, house_photo_url: '' }))}
                      className="text-xs text-destructive hover:bg-destructive/10"
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="sticky bottom-20 md:static z-20 flex justify-end p-2 md:p-0 bg-background/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none rounded-xl">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 h-11 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Menyimpan Perubahan...
            </>
          ) : (
            'Simpan Data Identitas'
          )}
        </Button>
      </div>
    </form>
  );
}
