
'use client';

import React, { useEffect } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import ProgramCard from '@/components/programs/ProgramCard';
import { Loader2 } from 'lucide-react';

export default function ProgramsPage() {
  const { programs, fetchPrograms, isLoading } = useSalesStore();

  useEffect(() => {
    fetchPrograms({ active: true });
  }, [fetchPrograms]);

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Daftar Program</h1>
        <p className="text-zinc-500">Pilih program belajar yang sesuai dengan kebutuhanmu.</p>
      </div>

      {isLoading && programs.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {programs.length > 0 ? (
            programs.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Belum ada program yang tersedia saat ini.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
