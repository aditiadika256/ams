'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Trophy, Users, CheckCircle2, Star, PlayCircle, ShieldCheck, PenTool, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import ProgramCard from '@/components/programs/ProgramCard';
import { ProgramCardSkeleton } from '@/components/programs/ProgramCardSkeleton';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function HomePage() {
  const { programs, fetchPrograms, isLoading } = useSalesStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch top programs for display
    if (!fetchedRef.current) {
      console.log('[HomePage] Fetching programs...');
      fetchedRef.current = true;
      fetchPrograms();
    }
  }, []);  // Empty deps - run only once

  // Display top 4 programs
  const featuredPrograms = programs.slice(0, 4);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 w-full h-full bg-background" />

      <div className="flex flex-col gap-16 md:gap-24 pt-24 pb-8 md:pt-32 md:pb-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 relative px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-3 py-1 text-xs font-semibold text-primary mb-6 shadow-lg">
              <Sparkles className="mr-2 h-3 w-3" />
              Platform Belajar Masa Depan
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground pb-4 drop-shadow-sm">
              Bangun Karir Impianmu <br className="hidden md:block" /> Bersama <span className="text-primary relative">
                Arkanin
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-[700px] mx-auto mt-4 leading-relaxed">
              Platform edukasi terintegrasi untuk meningkatkan skill coding, desain, dan manajemenmu dengan kurikulum industri terbaik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <AnimatedButton size="lg" className="rounded-full px-8 h-12 text-base shadow-xl shadow-primary/20" asChild>
                <Link href="/programs">
                  Mulai Belajar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </AnimatedButton>
              
              {(!mounted || !isAuthenticated) && (
                <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base glass hover:bg-white/10 border-white/20">
                  <Link href="/auth/register">
                    Daftar Akun
                  </Link>
                </Button>
              )}
              {mounted && isAuthenticated && (
                <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base glass hover:bg-white/10 border-white/20">
                  <Link href="/exams">
                    Ikuti Ujian <PenTool className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12 text-muted-foreground opacity-70">
              <div className="flex items-center gap-2 font-semibold">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-background bg-zinc-300 dark:bg-zinc-800`} />
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
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              { 
                icon: Users, 
                title: "Mentor Expert", 
                desc: "Belajar langsung dari praktisi yang berpengalaman di bidangnya.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              { 
                icon: Trophy, 
                title: "Sertifikat Resmi", 
                desc: "Dapatkan sertifikat kompetensi yang diakui setelah lulus ujian.",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              }
            ].map((item, i) => (
              <GlassCard
                key={i}
                className="flex flex-col items-center text-center p-6 hover:-translate-y-1 transition-transform duration-300 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${item.bg} ${item.color} backdrop-blur-md`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
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
            <Button variant="ghost" className="group hover:bg-white/5" asChild>
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
               <GlassCard className="col-span-full py-12 text-center border-dashed">
                  <p className="text-muted-foreground">Belum ada program yang tersedia saat ini.</p>
               </GlassCard>
            )}
          </div>
        </section>

        {/* Exam CTA Section */}
        <section className="container px-4 md:px-12 mx-auto max-w-full">
          <GlassCard className="p-8 md:p-12 relative overflow-hidden group border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-50 dark:bg-zinc-900/50">
            <div className="absolute inset-0 bg-primary/5 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Uji Kemampuanmu Sekarang</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Ikuti ujian sertifikasi untuk memvalidasi skill yang telah kamu pelajari. 
                  Dapatkan sertifikat resmi yang diakui industri.
                </p>
                <div className="flex flex-wrap gap-4">
                  <AnimatedButton size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-sm" asChild>
                    <Link href="/exams">
                      Lihat Daftar Ujian <PenTool className="ml-2 h-4 w-4" />
                    </Link>
                  </AnimatedButton>
                </div>
              </div>
              <div className="hidden md:block">
                <Trophy className="h-32 w-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              </div>
            </div>
          </GlassCard>
        </section>
        
         {/* Benefits Section */}
        <section className="glass border-y border-white/10 py-20 my-8 w-full backdrop-blur-xl bg-black/40">
          <div className="container mx-auto max-w-5xl px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Kenapa Memilih Arkanin?</h2>
                <div className="space-y-6">
                  {[
                    "Akses materi selamanya tanpa batas waktu",
                    "Konsultasi langsung dengan mentor",
                    "Proyek portofolio dunia nyata",
                    "Komunitas belajar yang aktif",
                    "Sertifikat kompetensi resmi"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-6 flex flex-col items-center justify-center text-center aspect-square hover:bg-white/10 transition-colors">
                  <PlayCircle className="h-8 w-8 mb-2 text-primary" />
                  <span className="font-bold text-2xl">50+</span>
                  <span className="text-sm text-muted-foreground">Kelas Premium</span>
                </GlassCard>
                <GlassCard className="p-6 flex flex-col items-center justify-center text-center aspect-square hover:bg-white/10 transition-colors translate-y-8">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <span className="font-bold text-2xl">10k+</span>
                  <span className="text-sm text-muted-foreground">Member Aktif</span>
                </GlassCard>
                <GlassCard className="p-6 flex flex-col items-center justify-center text-center aspect-square hover:bg-white/10 transition-colors">
                  <Star className="h-8 w-8 mb-2 text-primary" />
                  <span className="font-bold text-2xl">4.9</span>
                  <span className="text-sm text-muted-foreground">Rating Rata-rata</span>
                </GlassCard>
                <GlassCard className="p-6 flex flex-col items-center justify-center text-center aspect-square hover:bg-white/10 transition-colors translate-y-8">
                  <ShieldCheck className="h-8 w-8 mb-2 text-primary" />
                  <span className="font-bold text-2xl">100%</span>
                  <span className="text-sm text-muted-foreground">Jaminan Kualitas</span>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
