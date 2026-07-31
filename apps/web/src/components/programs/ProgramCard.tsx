'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard, GlassCardContent, GlassCardFooter, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { Program } from '@/types/sales';
import { BookOpen, Clock, Signal } from 'lucide-react';
import {
  getProgramLevelLabel,
  getProgramTypeLabel,
} from '@/lib/program-labels';

interface ProgramCardProps {
  program: Program;
  index?: number;
  layout?: 'list' | 'grid';
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, index = 0, layout = 'grid' }) => {
  const levelLabel = getProgramLevelLabel(program);
  const typeLabel = getProgramTypeLabel(program);

  if (layout === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ x: 5 }}
        className="w-full"
      >
        <GlassCard className="flex flex-col sm:flex-row overflow-hidden hover:scale-[1.01] transition-all duration-300 group p-4 gap-4 items-center">
          <div className="w-full sm:w-48 aspect-video bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center rounded-xl shrink-0 relative overflow-hidden">
            <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge variant="secondary" className="bg-secondary text-[10px] font-semibold shadow-sm text-secondary-foreground border-secondary py-0 h-5">
                {levelLabel}
              </Badge>
            </div>
            <div className="absolute top-2 right-2">
              <Badge className="h-5 border-0 bg-primary py-0 text-[10px] text-primary-foreground shadow-sm">
                {typeLabel}
              </Badge>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between h-full py-1 text-center sm:text-left">
            <div>
              <GlassCardTitle className="text-lg font-bold tracking-tight line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                {program.name}
              </GlassCardTitle>
              <p className="text-muted-foreground text-sm line-clamp-1 mb-3">
                Program komprehensif untuk menguasai skill {program.name} dari dasar hingga mahir.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>3 Bulan</span>
              </div>
              <div className="flex items-center gap-1">
                <Signal className="h-3.5 w-3.5" />
                <span>{levelLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end justify-center gap-2 pl-4 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 w-full sm:w-auto pt-4 sm:pt-0 shrink-0">
            <span className="text-[10px] text-muted-foreground">Harga</span>
            <p className="text-base font-bold text-primary">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(program.price)}
            </p>
            <AnimatedButton asChild size="sm" variant="outline" className="rounded-full px-4 mt-1">
              <Link href={`/programs/${program.id}`}>Detail</Link>
            </AnimatedButton>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <GlassCard className="flex flex-col h-full overflow-hidden hover:scale-[1.02] transition-all duration-300 group">
        <GlassCardHeader className="p-0 relative overflow-hidden">
          <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            {/* Fallback visual if no image */}
             <div className="bg-white dark:bg-zinc-950 p-4 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800">
                <BookOpen className="h-8 w-8 text-primary" />
             </div>
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-secondary text-xs font-semibold shadow-sm text-secondary-foreground border-secondary">
              {levelLabel}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
             <Badge className="border-0 bg-primary text-xs text-primary-foreground shadow-sm">
              {typeLabel}
            </Badge>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="flex-1 p-5">
          <GlassCardTitle className="text-lg font-bold tracking-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {program.name}
          </GlassCardTitle>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
             Program komprehensif untuk menguasai skill {program.name} dari dasar hingga mahir.
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
             <div className="flex items-center gap-1">
               <Clock className="h-3.5 w-3.5" />
               <span>3 Bulan</span>
             </div>
             <div className="flex items-center gap-1">
               <Signal className="h-3.5 w-3.5" />
               <span>{levelLabel}</span>
             </div>
          </div>
        </GlassCardContent>
        <GlassCardFooter className="p-5 pt-0 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Harga</span>
            <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(program.price)}
            </p>
          </div>
          <AnimatedButton asChild size="sm" variant="outline" className="rounded-full px-4">
            <Link href={`/programs/${program.id}`}>Detail</Link>
          </AnimatedButton>
        </GlassCardFooter>
      </GlassCard>
    </motion.div>
  );
};

export default ProgramCard;
