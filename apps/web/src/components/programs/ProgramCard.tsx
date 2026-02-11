'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard, GlassCardContent, GlassCardFooter, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { Program } from '@/types/sales';
import { BookOpen, Clock, Signal } from 'lucide-react';

interface ProgramCardProps {
  program: Program;
  index?: number;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, index = 0 }) => {
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
          <div className="aspect-video w-full bg-linear-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
            {/* Fallback visual if no image */}
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full shadow-sm border border-white/20">
                <BookOpen className="h-8 w-8 text-primary" />
             </div>
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-secondary/40 backdrop-blur-md text-xs font-semibold shadow-sm text-secondary-foreground border-secondary/50">
              {program.level}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
             <Badge className={`text-xs capitalize shadow-sm border-0 ${program.type === 'bootcamp' ? 'bg-blue-500/80 backdrop-blur-md' : 'bg-emerald-500/80 backdrop-blur-md'}`}>
              {program.type}
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
               <span>{program.level}</span>
             </div>
          </div>
        </GlassCardContent>
        <GlassCardFooter className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Harga</span>
            <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(program.price)}
            </p>
          </div>
          <AnimatedButton asChild size="sm" variant="glass" className="rounded-full px-4">
            <Link href={`/programs/${program.id}`}>Detail</Link>
          </AnimatedButton>
        </GlassCardFooter>
      </GlassCard>
    </motion.div>
  );
};

export default ProgramCard;
