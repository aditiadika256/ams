'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Clock, FileText, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { PageLoader } from '@/components/ui/loaders';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface ExamPackage {
  id: number;
  name: string;
  level: string;
  duration_minutes: number;
  randomize: boolean;
  show_result_mode: string;
  // Augmented fields for UI
  description?: string;
  questionCount?: number;
  status?: 'available' | 'locked';
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    const fetchExams = async () => {
      try {
        const data = await apiClient.cbt.getPackages();
        // Transform data to match UI needs
        const formattedExams: ExamPackage[] = (data.data || []).map((pkg: any) => ({
          ...pkg,
          description: pkg.description || `Ujian ${pkg.level} - Durasi ${pkg.duration_minutes} menit`,
          questionCount: pkg.questionCount || 0, // Backend doesn't provide this yet
          status: 'available' // Default to available for now
        }));
        setExams(formattedExams);
      } catch (err: any) {
        console.error('Failed to fetch exams:', err);
        setError('Gagal memuat daftar ujian. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (isLoading) {
    return <PageLoader message="Memuat daftar ujian..." />;
  }

  return (
    <div className="flex flex-col gap-12 pt-8 pb-16">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto px-4"
      >
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-transparent bg-primary/10 text-primary mb-2">
          <Sparkles className="mr-2 h-3 w-3" />
          Uji Kemampuanmu
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Daftar Ujian & Tryout
        </h1>
        <p className="text-muted-foreground text-lg">
          Pilih ujian yang tersedia untuk mengukur pemahaman dan kesiapan belajarmu.
        </p>
      </motion.div>

      <div className="container px-4 md:px-6 w-full mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && exams.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4 bg-muted/30 rounded-2xl border border-dashed max-w-md mx-auto"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Belum ada ujian tersedia</h3>
            <p className="text-muted-foreground mb-6">
              Saat ini belum ada jadwal ujian yang aktif. Silakan cek kembali nanti atau hubungi admin jika ada kendala.
            </p>
          </motion.div>
        )}

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {exams.slice((page - 1) * perPage, page * perPage).map((exam) => (
            <motion.div key={exam.id} variants={item}>
              <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-muted/60 hover:border-primary/20 bg-background/60 backdrop-blur-sm group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={exam.status === 'available' ? 'default' : 'secondary'} className="shadow-sm">
                      {exam.status === 'available' ? 'Tersedia' : 'Terkunci'}
                    </Badge>
                    <Badge variant="outline" className="uppercase text-xs bg-background">
                      {exam.level}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                    {exam.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mt-2 text-base">
                    {exam.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-muted/50">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-primary" />
                      {exam.duration_minutes} Menit
                    </div>
                    {exam.questionCount ? (
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        {exam.questionCount} Soal
                      </div>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full h-11 shadow-md hover:shadow-lg transition-all" 
                    disabled={exam.status !== 'available'}
                    asChild={exam.status === 'available'}
                  >
                    {exam.status === 'available' ? (
                      <Link href={`/exams/${exam.id}`}>Mulai Ujian</Link>
                    ) : (
                      'Belum Tersedia'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {exams.length > perPage && (
          <div className="mt-8">
            <PaginationControls
              currentPage={page}
              lastPage={Math.ceil(exams.length / perPage) || 1}
              total={exams.length}
              from={exams.length > 0 ? (page - 1) * perPage + 1 : 0}
              to={exams.length > 0 ? Math.min(page * perPage, exams.length) : 0}
              onPageChange={setPage}
              itemLabel="ujian"
            />
          </div>
        )}
      </div>
    </div>
  );
}
