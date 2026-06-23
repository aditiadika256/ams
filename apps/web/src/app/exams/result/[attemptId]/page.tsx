'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ExamResult } from '@/types/cbt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner, PageLoader } from '@/components/ui/loaders';
import { CheckCircle, Home, RotateCcw } from 'lucide-react';
// date-fns is not installed; using native Intl.DateTimeFormat for formatting
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
// date-fns is not installed; using native Intl.DateTimeFormat for formatting

export default function ExamResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId: attemptIdStr } = use(params);
  const router = useRouter();
  const attemptId = parseInt(attemptIdStr);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await apiClient.cbt.getResult(attemptId);
        if (res.success && res.data) {
          setResult(res.data);
        } else {
          setError(res.message || 'Gagal memuat hasil ujian');
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat hasil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (isLoading) {
    return <PageLoader message="Memuat hasil ujian..." />;
  }

  if (error || !result) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/exams">Kembali ke Daftar Ujian</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 p-4 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Ujian Selesai!</CardTitle>
          <p className="text-muted-foreground mt-2">
            Anda telah menyelesaikan ujian <strong>{result.package_name}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-xl">
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">
              Skor Anda
            </div>
            <div className="text-6xl font-extrabold text-primary">
              {result.score_total}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Waktu Submit</div>
              <div className="font-medium">
                {formatDate(new Date(result.submitted_at))}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">ID Attempt</div>
              <div className="font-medium">#{result.attempt_id}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/exams">
              <Home className="mr-2 h-4 w-4" /> Daftar Ujian
            </Link>
          </Button>
          <Button asChild>
             <Link href={`/exams/${result.package_id}`}>
               <RotateCcw className="mr-2 h-4 w-4" /> Ulangi Ujian
             </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
