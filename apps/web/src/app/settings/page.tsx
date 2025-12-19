import React from 'react';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[50vh] py-12 text-center">
      <Construction className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold tracking-tight mb-2">Pengaturan</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Halaman pengaturan sedang dalam pengembangan.
      </p>
      <Button asChild variant="outline">
        <Link href="/profile">Kembali ke Profile</Link>
      </Button>
    </div>
  );
}
