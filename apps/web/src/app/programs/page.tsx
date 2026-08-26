'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import ProgramCard from '@/components/programs/ProgramCard';
import { ProgramCardSkeleton } from '@/components/programs/ProgramCardSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle';
import { useSalesStore } from '@/store/useSalesStore';

export default function ProgramsPage() {
  const { programs, fetchPrograms, isLoading, error } = useSalesStore();
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => { void fetchPrograms(); }, [fetchPrograms]);
  const tags = useMemo(() => Array.from(new Map(programs.flatMap((program) => program.tags ?? []).map((item) => [item.code, item])).values()), [programs]);
  const normalized = search.trim().toLocaleLowerCase('id-ID');
  const filtered = programs.filter((program) => (!normalized || [program.name, program.short_description ?? '', ...(program.tags?.map((item) => item.name) ?? [])].some((value) => value.toLocaleLowerCase('id-ID').includes(normalized))) && (!tag || program.tags?.some((item) => item.code === tag)));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [search, tag]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl text-center"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Program catalog</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Temukan Program yang tepat</h1><p className="mt-4 text-zinc-500">Pilih Program modular berdasarkan fokus belajar Anda. Akses yang diperoleh akan tampil otomatis di Workspace.</p></header>
      <section className="sticky top-20 z-20 mx-auto my-8 grid max-w-5xl gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama Program atau tag" className="min-h-11 pl-9" /></div>
        <div className="flex gap-2 overflow-x-auto pb-1"><Button size="sm" className="min-h-11 shrink-0" variant={tag === null ? 'default' : 'outline'} onClick={() => setTag(null)}>Semua</Button>{tags.map((item) => <Button key={item.code} size="sm" className="min-h-11 shrink-0" variant={tag === item.code ? 'default' : 'outline'} onClick={() => setTag(item.code)}>{item.name}</Button>)}</div>
      </section>
      <div className="mb-5 flex items-center justify-between"><p className="text-sm text-zinc-500">{filtered.length} Program tersedia</p><ViewToggle view={view} onViewChange={setView} /></div>
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {isLoading && programs.length === 0 ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <ProgramCardSkeleton key={item} />)}</div> : paginated.length ? <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-4' : 'grid gap-4'}>{paginated.map((program, index) => <ProgramCard key={program.id} program={program} index={index} layout={view} />)}</div> : <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed text-center"><div><Search className="mx-auto mb-3 size-8 text-zinc-400" /><h2 className="font-semibold">Program tidak ditemukan</h2><p className="mt-1 text-sm text-zinc-500">Ubah kata kunci atau filter tag.</p></div></div>}
      {filtered.length > perPage && <div className="mt-8"><PaginationControls currentPage={page} lastPage={Math.ceil(filtered.length / perPage)} total={filtered.length} from={(page - 1) * perPage + 1} to={Math.min(page * perPage, filtered.length)} onPageChange={setPage} itemLabel="program" isLoading={isLoading} /></div>}
    </main>
  );
}
