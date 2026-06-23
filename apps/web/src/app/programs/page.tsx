'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import ProgramCard from '@/components/programs/ProgramCard';
import { ProgramCardSkeleton } from '@/components/programs/ProgramCardSkeleton';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';
import { PaginationControls } from '@/components/ui/pagination-controls';

export default function ProgramsPage() {
  const { programs, fetchPrograms, isLoading } = useSalesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const perPage = 8;
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    console.log('[ProgramsPage] Fetching programs...');
    fetchPrograms({ active: true });
  }, []);  // Empty deps - run only once

  // Filter programs locally for now
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType ? program.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  const types = ['bootcamp', 'course'];

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedType]);

  const paginatedPrograms = filteredPrograms.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container py-8 md:py-12 mx-auto">
      <div className="flex flex-col gap-6 mb-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
             Jelajahi Program Belajar
          </h1>
          <p className="text-muted-foreground text-lg">
            Temukan kelas yang sesuai dengan minat dan kebutuhan karirmu.
          </p>
        </div>

        {/* Search and Filter */}
        <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 max-w-4xl mx-auto w-full sticky top-20 z-10">
           <div className="relative w-full md:max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Cari program (contoh: React, UI/UX)..." 
               className="pl-9 bg-white/5 border-white/10 focus:bg-white/10"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           
           <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <AnimatedButton 
                  variant={selectedType === null ? "default" : "glass"} 
                  size="sm"
                  onClick={() => setSelectedType(null)}
                  className="rounded-full"
                >
                  Semua
                </AnimatedButton>
                {types.map(type => (
                  <AnimatedButton
                    key={type}
                    variant={selectedType === type ? "default" : "glass"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="rounded-full capitalize"
                  >
                    {type}
                  </AnimatedButton>
                ))}
              </div>
              
           </div>
        </GlassCard>
      </div>
      <div className="flex justify-end mb-4">
        <ViewToggle view={viewMode} onViewChange={setViewMode} className="shrink-0" />
      </div>

      {isLoading && programs.length === 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "flex flex-col gap-4"
        }>
           {[1,2,3,4,5,6,7,8].map((n) => (
             <ProgramCardSkeleton key={n} />
           ))}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[400px]" 
          : "flex flex-col gap-4 min-h-[400px]"
        }>
          {filteredPrograms.length > 0 ? (
            paginatedPrograms.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} layout={viewMode} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center py-20 bg-muted/20 rounded-2xl border border-dashed w-full">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tidak ditemukan program</h3>
              <p className="text-muted-foreground max-w-sm">
                Coba gunakan kata kunci lain atau ubah filter pencarian.
              </p>
              <AnimatedButton 
                variant="link" 
                onClick={() => { setSearchQuery(''); setSelectedType(null); }}
                className="mt-2 text-primary"
              >
                Reset Filter
              </AnimatedButton>
            </div>
          )}
        </div>
      )}
      {filteredPrograms.length > perPage && (
        <div className="mt-12">
          <PaginationControls
            currentPage={page}
            lastPage={Math.ceil(filteredPrograms.length / perPage) || 1}
            total={filteredPrograms.length}
            from={filteredPrograms.length > 0 ? (page - 1) * perPage + 1 : 0}
            to={filteredPrograms.length > 0 ? Math.min(page * perPage, filteredPrograms.length) : 0}
            onPageChange={setPage}
            itemLabel="program"
          />
        </div>
      )}
    </div>
  );
}
