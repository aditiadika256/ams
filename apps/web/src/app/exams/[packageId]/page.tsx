'use client';

import React, { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/components/ui/loaders';

interface ExamPackage {
  id: number;
  name: string;
  level: string;
  duration_minutes: number;
  randomize: boolean;
  show_result_mode: string;
}

export default function ExamStartPage({ params }: { params: Promise<{ packageId: string }> }) {
  const { packageId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examPackage, setExamPackage] = useState<ExamPackage | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await apiClient.cbt.getPackage(packageId);
        if (res.success && res.data) {
          setExamPackage(res.data);
        } else {
          setError('Ujian tidak ditemukan.');
        }
      } catch (err: any) {
        console.error('Fetch package error:', err);
        setError('Gagal memuat informasi ujian.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchPackage();
  }, [packageId]);

  const handleStartExam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.cbt.startExam(parseInt(packageId));
      if (res.success && res.data) {
        const { attempt_id } = res.data;
        router.push(`/exams/session/${attempt_id}`);
      } else {
        setError(res.message || 'Gagal memulai ujian');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memulai ujian');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container max-w-3xl py-12 flex justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error && !examPackage) {
    return (
      <div className="container max-w-3xl py-12">
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Kembali
          </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{examPackage?.name || 'Konfirmasi Ujian'}</CardTitle>
          <CardDescription>
            Harap baca petunjuk di bawah ini sebelum memulai ujian.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold flex items-center">
              <Info className="h-4 w-4 mr-2" /> Detail Ujian
            </h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
              <li>Durasi: {examPackage?.duration_minutes} Menit</li>
              <li>Level: <span className="uppercase">{examPackage?.level}</span></li>
              {/* <li>Jumlah Soal: 100 Soal</li> */}
              <li>Tipe: Pilihan Ganda (MCQ)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Petunjuk Pengerjaan:</h3>
            <ul className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
              <li>Pastikan koneksi internet Anda stabil.</li>
              <li>Waktu akan berjalan otomatis saat Anda menekan tombol "Mulai Ujian".</li>
              <li>Anda dapat melewati soal dan kembali lagi nanti selama waktu masih tersedia.</li>
              <li>Jawaban akan tersimpan secara otomatis.</li>
              <li>Jika waktu habis, jawaban akan disubmit secara otomatis.</li>
              <li>Dilarang membuka tab lain atau melakukan kecurangan selama ujian berlangsung.</li>
            </ul>
          </div>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Waktu Pengerjaan</AlertTitle>
            <AlertDescription>
              Waktu ujian adalah {examPackage?.duration_minutes} menit. Tidak ada penambahan waktu jika Anda terlambat memulai.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Kembali
          </Button>
          <Button onClick={handleStartExam} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Mulai Ujian Sekarang
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
