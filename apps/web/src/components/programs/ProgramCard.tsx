'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <Card className="flex flex-col h-full overflow-hidden border-muted/60 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <CardHeader className="p-0 relative overflow-hidden">
          <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
             {/* Fallback visual if no image */}
             <div className="bg-white/50 backdrop-blur-sm p-4 rounded-full shadow-sm">
                <BookOpen className="h-8 w-8 text-primary" />
             </div>
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur text-xs font-semibold shadow-sm hover:bg-white">
              {program.level}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
             <Badge className={`text-xs capitalize shadow-sm ${program.type === 'bootcamp' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {program.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-5">
          <CardTitle className="text-lg font-bold tracking-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {program.name}
          </CardTitle>
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
        </CardContent>
        <CardFooter className="p-5 pt-0 flex items-center justify-between border-t bg-muted/5 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Harga</span>
            <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(program.price)}
            </p>
          </div>
          <Button asChild size="sm" className="rounded-full px-4 group-hover:bg-primary/90">
            <Link href={`/programs/${program.id}`}>Detail</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProgramCard;
