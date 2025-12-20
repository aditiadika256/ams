'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSalesStore } from '@/store/useSalesStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Clock, Signal, Award, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageLoader } from '@/components/ui/loaders';

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { currentProgram, fetchProgram, isLoading } = useSalesStore();

  useEffect(() => {
    if (id) {
      fetchProgram(id);
    }
  }, [id, fetchProgram]);

  const handleBuyNow = () => {
    router.push(`/checkout?program_id=${id}`);
  };

  if (isLoading) {
    return <PageLoader />;
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
    <div className="min-h-screen pb-20">
      {/* Header / Hero */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b">
        <div className="container py-8 md:py-12 max-w-5xl">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
              <Link href="/programs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Daftar
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase font-semibold">
                    {currentProgram.level}
                  </Badge>
                  <Badge className={`capitalize ${currentProgram.type === 'bootcamp' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {currentProgram.type}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                  {currentProgram.name}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                   Program komprehensif yang dirancang untuk membantu Anda menguasai skill {currentProgram.name} dari dasar hingga siap kerja.
                </p>
                
                <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground pt-4">
                   <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>3 Bulan Durasi</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Signal className="h-5 w-5 text-primary" />
                      <span>{currentProgram.level} Level</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span>Sertifikat</span>
                   </div>
                </div>
                
                {/* Mobile Buy Button */}
                <div className="md:hidden pt-4">
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-primary">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}
                        </span>
                    </div>
                    <Button onClick={handleBuyNow} size="lg" className="w-full rounded-full shadow-lg">
                       Beli Program Sekarang
                    </Button>
                </div>
             </div>
             
             {/* Pricing Card (Desktop) */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="hidden md:block w-full md:w-[350px] bg-card border rounded-2xl shadow-xl p-6 sticky top-24"
             >
                <div className="mb-6">
                  <span className="text-muted-foreground text-sm">Harga Program</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentProgram.price)}
                    </span>
                  </div>
                </div>
                
                <Button onClick={handleBuyNow} size="lg" className="w-full rounded-full mb-4 font-bold text-base shadow-lg shadow-primary/20">
                   Beli Program Sekarang
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                   Garansi uang kembali 30 hari
                </p>
             </motion.div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container py-12 max-w-5xl">
         <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
               {/* Description */}
               <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                     <BookOpen className="h-6 w-6 text-primary" />
                     Tentang Program
                  </h2>
                  <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground">
                    <p>
                      Dalam program ini, Anda akan mempelajari konsep-konsep fundamental hingga tingkat lanjut. 
                      Kurikulum disusun oleh para ahli industri untuk memastikan materi yang relevan dan aplikatif.
                    </p>
                    <p>
                      Metode pembelajaran interaktif dengan kombinasi video materi, kuis, dan proyek praktikal 
                      akan membantu Anda memahami setiap topik secara mendalam.
                    </p>
                  </div>
               </section>
               
               {/* Curriculum / Syllabus (Dummy) */}
               <section>
                  <h2 className="text-2xl font-bold mb-6">Materi yang Dipelajari</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                     {[
                        "Pengenalan & Fundamental",
                        "Konsep Lanjutan",
                        "Best Practices & Clean Code",
                        "Studi Kasus & Proyek",
                        "Deployment & Production",
                        "Karir & Persiapan Kerja"
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                           <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                           <span className="font-medium">{item}</span>
                        </div>
                     ))}
                  </div>
               </section>
            </div>
         </div>
      </div>
    </div>
  );
}
