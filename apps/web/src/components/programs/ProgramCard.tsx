'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Program } from '@/types/sales';

interface ProgramCardProps {
  program: Program;
  index?: number;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="p-0">
          <div className="aspect-video w-full bg-zinc-100 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="uppercase text-xs font-semibold">
              {program.level}
            </Badge>
            <Badge variant="outline" className="capitalize text-xs">
              {program.type}
            </Badge>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight line-clamp-2 mb-2">
            {program.name}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Program {program.type} untuk tingkat {program.level.toUpperCase()}.
          </p>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(program.price)}
          </p>
          <Button asChild size="sm">
            <Link href={`/programs/${program.id}`}>Lihat Detail</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProgramCard;
