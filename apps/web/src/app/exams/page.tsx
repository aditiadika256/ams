import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Construction } from 'lucide-react';

export default function ExamsPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
      <Construction className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-3">Ujian (CBT)</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Fitur Computer Based Test (CBT) sedang dalam tahap pengembangan.
        Nantikan update selanjutnya untuk fitur Tryout dan Ujian Online.
      </p>
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
