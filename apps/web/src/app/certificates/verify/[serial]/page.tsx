'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, CheckCircle2, XCircle, ShieldCheck, 
  Calendar, User, BookOpen, ArrowLeft, Printer, Share2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loaders';
import { apiClient } from '@/lib/api';

interface CertificateVerification {
  certificate_number: string;
  is_valid: boolean;
  status: string;
  student_name: string;
  program_name: string;
  batch_name: string;
  issued_at: string;
  revoked_at: string | null;
  verification_url: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function CertificateVerifyPage() {
  const params = useParams();
  const serial = params?.serial as string;

  const [data, setData] = useState<CertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serial) return;

    const verifyCertificate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.certificates.verify(serial);
        setData(res.data);
      } catch (err: any) {
        setError(err.message || 'Nomor sertifikat tidak ditemukan atau tidak valid.');
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [serial]);

  if (loading) {
    return (
      <div className="py-28">
        <PageLoader text="Memverifikasi keaslian sertifikat..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <XCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
          Sertifikat Tidak Ditemukan
        </h1>
        <p className="text-sm text-zinc-500">
          Nomor seri <strong>"{serial}"</strong> tidak terdaftar dalam basis data sertifikasi Arkanin Education.
        </p>
        <div className="pt-4">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" /> Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8 pb-20">
      {/* Verification Banner */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" /> Beranda Arkanin
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl">
            <Printer className="mr-1.5 size-3.5" /> Cetak
          </Button>
        </div>
      </div>

      {/* Official Certificate Card */}
      <Card className="relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-white to-amber-500/5 p-8 shadow-2xl dark:via-zinc-900 dark:to-zinc-950 md:p-12">
        {/* Corner Decors */}
        <div className="absolute left-4 top-4 size-8 border-l-2 border-t-2 border-amber-500/50" />
        <div className="absolute right-4 top-4 size-8 border-r-2 border-t-2 border-amber-500/50" />
        <div className="absolute bottom-4 left-4 size-8 border-b-2 border-l-2 border-amber-500/50" />
        <div className="absolute bottom-4 right-4 size-8 border-b-2 border-r-2 border-amber-500/50" />

        <div className="text-center space-y-6">
          {/* Logo & Seal */}
          <div className="flex flex-col items-center gap-2">
            <img src="/logo/arkanin-logo.png" alt="Arkanin" className="size-16 object-contain" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Arkanin Education Platform
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 font-extrabold">
              Certificate of Completion
            </h2>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Sertifikat Kelulusan
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              No. Seri: {data.certificate_number}
            </p>
          </div>

          {/* Recipient */}
          <div className="py-4 space-y-1 border-y border-zinc-200/80 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Diberikan secara sah kepada:</p>
            <p className="text-2xl font-black text-primary sm:text-3xl">
              {data.student_name}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Atas pemenuhan kualifikasi kelulusan simulasi CBT dan kehadiran kelas pada program:
            </p>
            <p className="text-lg font-extrabold text-zinc-800 dark:text-zinc-200">
              {data.program_name} ({data.batch_name})
            </p>
          </div>

          {/* Verification Status Badge */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {data.is_valid ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
                <ShieldCheck className="size-4" /> Terverifikasi Sah & Asli
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-xs font-bold text-destructive shadow-sm">
                <XCircle className="size-4" /> Status Sertifikat: Dicabut (Revoked)
              </div>
            )}
            <span className="text-xs text-zinc-400">
              Diterbitkan: {formatDate(data.issued_at)}
            </span>
          </div>

          {/* Security details */}
          <div className="pt-4 text-[11px] text-zinc-400">
            Dokumen elektronik ini diterbitkan secara otomatis dan terotentikasi secara digital oleh Arkanin Management System (AMS).
          </div>
        </div>
      </Card>
    </div>
  );
}
