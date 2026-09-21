'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap, CheckCircle2, ArrowRight, Loader2, Sparkles,
  ShieldCheck, Video, FileText, Award, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';

export default function BecomeMentorPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    ktp_number: '',
    cv_url: '',
    certificate_url: '',
    teaching_video_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.specialization) {
      alertActions.error('Data belum lengkap', 'Nama, email, nomor HP, dan bidang keahlian wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.mentorApplications.apply(form);
      setSubmitted(true);
      alertActions.success('Lamaran Terkirim!', 'Terima kasih telah mendaftar. Tim kami akan segera meninjau berkas Anda.');
    } catch (err) {
      alertActions.error('Pengiriman gagal', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button asChild variant="ghost" className="mb-6 -ml-3">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            Kembali ke Beranda
          </Link>
        </Button>

        {submitted ? (
          <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 text-center p-8">
            <div className="size-16 bg-emerald-100 dark:bg-emerald-900/60 rounded-full grid place-items-center mx-auto text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-200">
              Lamaran Berhasil Dikirim!
            </h1>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
              Terima kasih telah mendaftar sebagai Calon Pengajar Arkanin Education. Tim Staff Operasional (ASA) kami akan memeriksa berkas Anda dan menghubungi via WhatsApp/Email untuk tahapan tes tulis dan wawancara.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild>
                <Link href="/workspace">Masuk ke Workspace</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-3">
                <Sparkles className="size-3.5" />
                Arkanin Teaching Team (A-Teams)
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Bergabung Menjadi Pengajar</h1>
              <p className="mt-3 text-base text-zinc-500 max-w-xl mx-auto">
                Bantu ribuan siswa meraih mimpi mereka. Dapatkan honor mengajar kompetitif langsung cair ke dompet mentor Anda.
              </p>
            </div>

            <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl">Formulir Rekrutmen Pengajar</CardTitle>
                <CardDescription>
                  Lengkapi data profil dan portofolio mengajar Anda di bawah ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="app-name">Nama Lengkap *</Label>
                      <Input
                        id="app-name"
                        placeholder="Contoh: Budi Santoso, S.Pd."
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="app-email">Email Aktif *</Label>
                      <Input
                        id="app-email"
                        type="email"
                        placeholder="budi@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="app-phone">Nomor WhatsApp Aktif *</Label>
                      <Input
                        id="app-phone"
                        placeholder="08123456789"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="app-spec">Mata Pelajaran / Spesialisasi *</Label>
                      <Input
                        id="app-spec"
                        placeholder="Contoh: Matematika SNBT, Fisika, Penalaran Umum"
                        value={form.specialization}
                        onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="app-ktp">Nomor KTP (Opsional)</Label>
                    <Input
                      id="app-ktp"
                      placeholder="16 digit NIK KTP"
                      value={form.ktp_number}
                      onChange={(e) => setForm({ ...form, ktp_number: e.target.value })}
                    />
                  </div>

                  <div className="border-t pt-4 grid gap-4">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Dokumen & Portofolio (Tautan Google Drive / Cloud)
                    </p>

                    <div>
                      <Label htmlFor="app-cv" className="flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        Tautan CV / Resume (Google Drive)
                      </Label>
                      <Input
                        id="app-cv"
                        placeholder="https://drive.google.com/..."
                        value={form.cv_url}
                        onChange={(e) => setForm({ ...form, cv_url: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="app-cert" className="flex items-center gap-1.5">
                        <Award className="size-3.5" />
                        Tautan Ijazah / Sertifikat Pendukung
                      </Label>
                      <Input
                        id="app-cert"
                        placeholder="https://drive.google.com/..."
                        value={form.certificate_url}
                        onChange={(e) => setForm({ ...form, certificate_url: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="app-video" className="flex items-center gap-1.5">
                        <Video className="size-3.5" />
                        Tautan Video Micro-teaching / Simulasi Mengajar (YouTube / GDrive)
                      </Label>
                      <Input
                        id="app-video"
                        placeholder="https://youtube.com/watch?v=..."
                        value={form.teaching_video_url}
                        onChange={(e) => setForm({ ...form, teaching_video_url: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" size="lg" className="w-full gap-2 text-base" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="size-4 animate-spin" />Mengirim Lamaran…</>
                      ) : (
                        <>Kirim Lamaran Sekarang <ArrowRight className="size-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
