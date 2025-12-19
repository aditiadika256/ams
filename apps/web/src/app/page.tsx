'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Trophy, Users, CheckCircle2, Star, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import ProgramCard from '@/components/programs/ProgramCard';

export default function HomePage() {
  const { programs, fetchPrograms, isLoading } = useSalesStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch top programs for display
    fetchPrograms({ active: true });
  }, [fetchPrograms]);

  // Display top 4 programs
  const featuredPrograms = programs.slice(0, 4);

  return (
    <div className="flex flex-col gap-16 md:gap-24 py-8 md:py-16">
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
      <section className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: BookOpen, 
              title: "Kurikulum Terupdate", 
              desc: "Materi disusun sesuai standar industri terkini dan selalu diperbarui.",
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            { 
              icon: Users, 
              title: "Mentor Expert", 
              desc: "Belajar langsung dari praktisi yang berpengalaman di bidangnya.",
              color: "text-emerald-600",
              bg: "bg-emerald-50"
            },
            { 
              icon: Trophy, 
              title: "Sertifikat Resmi", 
              desc: "Dapatkan sertifikat kompetensi yang diakui setelah lulus ujian.",
              color: "text-amber-600",
              bg: "bg-amber-50"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
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
      <section className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
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
               <div key={n} className="h-[350px] bg-muted rounded-xl animate-pulse" />
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
      
       {/* Benefits Section */}
      <section className="bg-zinc-900 text-white py-20 my-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
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
              <div className="relative bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-2xl">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-zinc-700"></div>
                    <div>
                      <div className="h-4 w-32 bg-zinc-700 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-zinc-700 rounded"></div>
                    </div>
                 </div>
                 <div className="space-y-3">
                   <div className="h-3 w-full bg-zinc-700 rounded"></div>
                   <div className="h-3 w-full bg-zinc-700 rounded"></div>
                   <div className="h-3 w-3/4 bg-zinc-700 rounded"></div>
                 </div>
                 <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="h-20 bg-zinc-700 rounded-lg"></div>
                   <div className="h-20 bg-zinc-700 rounded-lg"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-6 mb-12">
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
