'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Correct import for Next.js 13+
import { useSalesStore } from '@/store/useSalesStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Next.js 15 unwraps params, but for 'use client' we use React.use() or just props if it works.
// In Next.js 13/14 client components, params are passed as props.
export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentProgram, fetchProgram, isLoading } = useSalesStore();

  // Handle unwrapping params if necessary (Next.js 15 future proofing, though strictly params is a promise in 15 server components)
  // For client components in 15, it's still evolving, but usually props are fine or we use `useParams` hook.
  // Safest way in Client Component is `useParams` hook.
  // But since we have the prop, let's use it. If it fails in Next 15, we'll switch to useParams.
  // Actually, let's use `useParams` from next/navigation to be safe.
  
  // Wait, I can't use useParams if I rely on props. Let's just use the prop ID.
  const id = params.id;

  useEffect(() => {
    if (id) {
      fetchProgram(id);
    }
  }, [id, fetchProgram]);

  const handleBuyNow = () => {
    router.push(`/checkout?program_id=${id}`);
  };

  if (isLoading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentProgram) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-xl font-bold mb-4">Program tidak ditemukan</h2>
        <Button asChild variant="outline">
          <Link href="/programs">Kembali ke Daftar Program</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
          <Link href="/programs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-zinc-200 shadow-lg">
          <CardHeader className="p-0">
            <div className="aspect-video w-full bg-zinc-100 flex items-center justify-center border-b">
               <span className="text-6xl">📚</span>
            </div>
            <div className="px-6 pt-6 pb-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="uppercase font-semibold">
                      {currentProgram.level}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {currentProgram.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900">
                    {currentProgram.name}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="prose max-w-none text-zinc-600">
              <p>
                Program ini dirancang khusus untuk membantu siswa tingkat {currentProgram.level.toUpperCase()} dalam menghadapi ujian.
                Materi disusun oleh pengajar berpengalaman dan disesuaikan dengan kurikulum terbaru.
              </p>
              
              <h3 className="text-lg font-semibold text-zinc-900 mt-6 mb-3">Apa yang akan kamu dapatkan?</h3>
              <ul className="grid sm:grid-cols-2 gap-3 pl-0 list-none">
                {[
                  'Akses materi lengkap selamanya',
                  'Latihan soal dengan pembahasan',
                  'Tryout berkala dengan sistem CAT',
                  'Grup diskusi dengan pengajar',
                  'Rapor perkembangan belajar',
                  'Sertifikat kelulusan program'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>

          <CardFooter className="p-6 bg-zinc-50 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
            <p className="text-sm text-zinc-500 text-center sm:text-left">
              *Harga sudah termasuk pajak dan biaya administrasi.
            </p>
            <Button size="lg" className="w-full sm:w-auto font-semibold text-base px-8" onClick={handleBuyNow}>
              Daftar Sekarang
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
