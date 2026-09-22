'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Award, CheckCircle2, XCircle, ShieldCheck, 
  ExternalLink, Printer, Loader2, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';

interface CertificateModalProps {
  accessId: number;
  programName: string;
}

export function CertificateModal({ accessId, programName }: CertificateModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    is_eligible: boolean;
    criteria: {
      cbt_score: number;
      cbt_passing_grade: number;
      cbt_passed: boolean;
      attendance_rate: number;
      attendance_min_required: number;
      attendance_passed: boolean;
      total_sessions: number;
      present_sessions: number;
    };
    certificate: any | null;
  } | null>(null);

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setLoading(true);
      try {
        const res = await apiClient.certificates.getForAccess(accessId);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load certificate data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2 text-xs gap-1">
          <Award className="size-3.5 text-amber-500" />
          Sertifikat
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Award className="size-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Sertifikat Kelulusan</span>
          </div>
          <DialogTitle className="text-lg font-bold">
            {programName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Evaluasi syarat kelulusan CBT (skor &ge; 60) dan presensi kehadiran kelas (&ge; 80%).
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-zinc-500">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-xs">Memeriksa kualifikasi kelulusan...</span>
          </div>
        ) : !data ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            Gagal memuat status sertifikat. Silakan coba kembali.
          </div>
        ) : data.is_eligible && data.certificate ? (
          /* Qualified & Issued */
          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-2">
                <ShieldCheck className="size-6" />
              </div>
              <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                Selamat! Anda Lulus & Berhak atas Sertifikat
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                No. Seri: {data.certificate.certificate_number}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Skor Kelulusan CBT:</span>
                <span className="font-bold text-emerald-600">{data.criteria.cbt_score} / 100 (Lulus)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tingkat Kehadiran:</span>
                <span className="font-bold text-emerald-600">{data.criteria.attendance_rate}% ({data.criteria.present_sessions}/{data.criteria.total_sessions} Sesi)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="rounded-xl font-bold">
                <Link
                  href={`/certificates/verify/${data.certificate.certificate_number}`}
                  target="_blank"
                >
                  <ExternalLink className="mr-2 size-4" /> Buka & Cetak Sertifikat Resmi
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Not Yet Qualified */
          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Award className="size-4" /> Belum Memenuhi Syarat Kelulusan
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Lengkapi persyaratan berikut untuk menerbitkan sertifikat resmi Anda:
              </p>
            </div>

            <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white p-3 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="font-medium">1. Skor Passing Grade CBT (&ge; 60)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">{data.criteria.cbt_score} / 60</span>
                  {data.criteria.cbt_passed ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-medium">2. Presensi Hadir Kelas (&ge; 80%)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">{data.criteria.attendance_rate}% / 80%</span>
                  {data.criteria.attendance_passed ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
