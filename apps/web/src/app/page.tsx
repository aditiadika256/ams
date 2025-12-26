'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Trophy, Users, CheckCircle2, Star, PlayCircle, ShieldCheck, Zap, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import ProgramCard from '@/components/programs/ProgramCard';
import { ProgramCardSkeleton } from '@/components/programs/ProgramCardSkeleton';

export default function HomePage() {
  const { programs, fetchPrograms, isLoading } = useSalesStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const didFetch = useRef(false);
  useEffect(() => {
    setMounted(true);
    // Fetch top programs for display
    if (!didFetch.current) {
      didFetch.current = true;
      fetchPrograms({ active: true });
    }
  }, [fetchPrograms]);

  // Display top 4 programs
  const featuredPrograms = programs.slice(0, 4);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pt-24 pb-8 md:pt-32 md:pb-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 relative">
        <div className="absolute top-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl px-4"
        >
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
            🚀 Platform Belajar Masa Depan
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent pb-4">
            Bangun Karir Impianmu <br className="hidden md:block" /> Bersama <span className="text-primary">Arkanin</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[700px] mx-auto mt-4 leading-relaxed">
            Platform edukasi terintegrasi untuk meningkatkan skill coding, desain, dan manajemenmu dengan kurikulum industri terbaik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" asChild className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Link href="/programs">
                Mulai Belajar <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {(!mounted || !isAuthenticated) && (
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base hover:bg-muted/50">
                <Link href="/auth/register">
                  Daftar Akun
                </Link>
              </Button>
            )}
            {mounted && isAuthenticated && (
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base hover:bg-muted/50">
                <Link href="/exams">
                  Ikuti Ujian <PenTool className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-muted-foreground grayscale opacity-70">
            <div className="flex items-center gap-2 font-semibold">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`h-8 w-8 rounded-full border-2 border-background bg-black bg-zinc-${i*100 + 200}`} />
                ))}
              </div>
              <span className="ml-2">1,000+ Siswa Bergabung</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 md:px-6 w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: BookOpen, 
              title: "Kurikulum Terupdate", 
              desc: "Materi disusun sesuai standar industri terkini dan selalu diperbarui.",
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-900/20"
            },
            { 
              icon: Users, 
              title: "Mentor Expert", 
              desc: "Belajar langsung dari praktisi yang berpengalaman di bidangnya.",
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-900/20"
            },
            { 
              icon: Trophy, 
              title: "Sertifikat Resmi", 
              desc: "Dapatkan sertifikat kompetensi yang diakui setelah lulus ujian.",
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-900/20"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className={`h-12 w-12 ${item.bg} rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Programs */}
      <section className="container px-4 md:px-12 mx-auto max-w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
             <h2 className="text-3xl font-bold tracking-tight mb-2">Program Unggulan</h2>
             <p className="text-muted-foreground">Pilihan terbaik untuk memulai karir profesionalmu.</p>
          </div>
          <Button variant="ghost" className="group" asChild>
            <Link href="/programs">
              Lihat Semua Program 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
             [1,2,3,4].map((n) => (
               <ProgramCardSkeleton key={n} />
             ))
          ) : featuredPrograms.length > 0 ? (
            featuredPrograms.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))
          ) : (
             <div className="col-span-full py-12 text-center bg-muted/30 rounded-xl border border-dashed">
                <p className="text-muted-foreground">Belum ada program yang tersedia saat ini.</p>
             </div>
          )}
        </div>
      </section>

      {/* Exam CTA Section */}
      <section className="container px-4 md:px-12 mx-auto max-w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Uji Kemampuanmu Sekarang</h2>
              <p className="text-blue-100 text-lg mb-6">
                Ikuti ujian sertifikasi untuk memvalidasi skill yang telah kamu pelajari. 
                Dapatkan sertifikat resmi yang diakui industri.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" asChild className="text-blue-700 hover:text-blue-800 font-bold">
                  <Link href="/exams">
                    Lihat Daftar Ujian <PenTool className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <Trophy className="h-32 w-32 text-yellow-300 drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>
      
       {/* Benefits Section */}
      <section className="bg-zinc-900 text-white py-20 my-8 w-full">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Kenapa Memilih Arkanin?</h2>
              <div className="space-y-6">
                {[
                  "Akses materi selamanya tanpa batas waktu",
                  "Konsultasi langsung dengan mentor",
                  "Proyek portofolio dunia nyata",
                  "Komunitas belajar yang suportif",
                  "Bantuan penyaluran kerja"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>
              {(!mounted || !isAuthenticated) && (
                <Button size="lg" className="mt-8 rounded-full" asChild>
                  <Link href="/auth/register">Gabung Komunitas</Link>
                </Button>
              )}
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 shadow-2xl">
                 {/* Header Profile */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-white">Alexander Dev</div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" /> Pro Member
                      </div>
                    </div>
                    <div className="ml-auto bg-zinc-800 px-3 py-1 rounded-full text-xs font-medium text-zinc-300 border border-zinc-700">
                      Level 5
                    </div>
                </div>

                 {/* Activity */}
                 <div className="space-y-4">
                   <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200">Menyelesaikan Modul</div>
                        <div className="text-xs text-zinc-500">React Hooks & Context</div>
                      </div>
                      <div className="ml-auto text-xs text-zinc-500">2j lalu</div>
                   </div>

                   <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                        <PlayCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200">Sedang Dipelajari</div>
                        <div className="text-xs text-zinc-500">Advanced State Management</div>
                      </div>
                      <div className="ml-auto">
                        <div className="h-1.5 w-12 bg-zinc-700 rounded-full overflow-hidden">
                          <div className="h-full w-[60%] bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                   </div>
                 </div>

                 {/* Stats */}
                 <div className="mt-6 grid grid-cols-2 gap-4">
                   <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 text-center">
                     <div className="text-zinc-500 text-xs mb-1">Total Sertifikat</div>
                     <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                       4 <Trophy className="h-4 w-4 text-amber-500" />
                     </div>
                   </div>
                   <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 text-center">
                     <div className="text-zinc-500 text-xs mb-1">Learning Streak</div>
                     <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                       12 <Zap className="h-4 w-4 text-orange-500" />
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-12 mx-auto max-w-full">
        <div className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Siap Memulai Perjalananmu?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Jangan tunda lagi. Investasikan waktu untuk masa depan karirmu sekarang juga.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {(!mounted || !isAuthenticated) && (
                <Button size="lg" asChild className="rounded-full px-8 h-12 text-base">
                  <Link href="/auth/register">Daftar Sekarang</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base bg-white/50 backdrop-blur">
                <Link href="/programs">Lihat Katalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
