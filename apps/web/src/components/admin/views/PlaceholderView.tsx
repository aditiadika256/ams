'use client';

import React from 'react';
import { Construction, ArrowLeft, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/store/useAdminStore';

interface PlaceholderViewProps {
  title: string;
  viewKey: string;
}

export default function PlaceholderView({ title, viewKey }: PlaceholderViewProps) {
  const { setActiveTab } = useAdminStore();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="size-3" />
              Fitur Dalam Pengembangan (Roadmap)
            </span>
            <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded">
              admin://view/{viewKey}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modul ini telah didaftarkan dalam sistem menu AMS dan spesifikasi fungsionalnya tercantum dalam dokumen PRD resmi.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('dashboard-default')}
          className="self-start sm:self-auto gap-2"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Dashboard
        </Button>
      </div>

      {/* Main notice card */}
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
          <Construction className="size-8" />
        </div>

        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Layanan & Antarmuka Sedang Disiapkan
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Halaman <span className="font-semibold text-foreground">{title}</span> sedang dalam tahap perancangan servis backend dan komponen antarmuka admin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-xl mt-4 pt-4 border-t border-border/40">
          <div className="p-3.5 rounded-xl bg-card border border-border/50 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Integrasi Terjadwal
            </div>
            <p className="text-xs text-muted-foreground">
              Akan terhubung ke alur Member, Student, dan Mentor sesuai diagram operasional.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/50 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <BookOpen className="size-3.5" />
              Rujukan PRD
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              docs/plans/PRD-ams-admin-menus.md
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
