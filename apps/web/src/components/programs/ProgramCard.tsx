'use client';

import Link from 'next/link';
import { BookOpen, Boxes } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Program } from '@/types/sales';

interface ProgramCardProps { program: Program; index?: number; layout?: 'list' | 'grid' }

function currency(value: string): string {
  const amount = Number(value);
  return amount === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export default function ProgramCard({ program, index = 0, layout = 'grid' }: ProgramCardProps) {
  const isList = layout === 'list';
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.2) }} className="h-full">
      <Card className={`h-full overflow-hidden border-zinc-200 shadow-none transition-colors hover:border-primary/40 dark:border-zinc-800 ${isList ? 'sm:grid sm:grid-cols-[180px_1fr]' : ''}`}>
        <div className={`grid place-items-center bg-zinc-100 dark:bg-zinc-900 ${isList ? 'min-h-44' : 'aspect-[16/9]'}`}>
          {program.thumbnail_url ? <img src={program.thumbnail_url} alt="" className="size-full object-cover" /> : <BookOpen className="size-9 text-primary" />}
        </div>
        <CardContent className="grid gap-4 p-5">
          <div className="flex flex-wrap gap-1.5">{program.tags?.slice(0, 3).map((tag) => <Badge key={tag.id} variant="secondary" className="font-normal">{tag.name}</Badge>)}{program.children?.length ? <Badge variant="outline"><Boxes className="mr-1 size-3" />Collection</Badge> : null}</div>
          <div><h2 className="line-clamp-2 text-xl font-semibold tracking-tight">{program.name}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{program.short_description || 'Program belajar terstruktur untuk membantu Anda mencapai target.'}</p></div>
          <div className="mt-auto flex items-center justify-between gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800"><span className="font-semibold text-primary">{currency(program.base_price)}</span><Button asChild variant="outline" size="sm"><Link href={`/programs/${program.slug}`}>Lihat detail</Link></Button></div>
        </CardContent>
      </Card>
    </motion.article>
  );
}
