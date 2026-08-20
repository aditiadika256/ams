'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, BookOpen, CalendarDays, Edit3, MoreHorizontal, Plus, Search, Tags } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { ComponentDefinition, Program, ProgramBatch, ProgramTag, ProgramWizardPayload } from '@/types/sales';
import { ProgramForm } from './form';
import { ProgramDeliveryDialog } from './ProgramDeliveryDialog';

const statusLabels: Record<Program['status'], string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  UNPUBLISHED: 'Unpublished',
  ARCHIVED: 'Archived',
};

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value) return ((value as { data?: T[] }).data ?? []);
  return [];
}

function currency(value: string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
}

export default function ProgramsView() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('program.create');
  const canUpdate = hasPermission('program.update');
  const canPublish = hasPermission('program.publish');
  const canArchive = hasPermission('program.archive');
  const canManageSessions = hasPermission('program-session.manage');
  const {
    adminPrograms,
    fetchAdminPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    transitionProgram,
    isLoading,
    error,
  } = useSalesStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [batches, setBatches] = useState<ProgramBatch[]>([]);
  const [tags, setTags] = useState<ProgramTag[]>([]);
  const [definitions, setDefinitions] = useState<ComponentDefinition[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [deliveryProgram, setDeliveryProgram] = useState<Program | null>(null);
  const perPage = 8;

  useEffect(() => {
    void Promise.all([
      fetchAdminPrograms({ per_page: 100 }),
      apiClient.admin.tags.list().then((response) => setTags(unwrapArray<ProgramTag>(response.data))),
      apiClient.admin.componentDefinitions.list().then((response) => setDefinitions(unwrapArray<ComponentDefinition>(response.data))),
    ]).catch(() => undefined);
  }, [fetchAdminPrograms]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id-ID');
    if (!query) return adminPrograms;
    return adminPrograms.filter((program) => [program.name, program.slug, program.status, ...(program.tags?.map((tag) => tag.name) ?? [])]
      .some((value) => value.toLocaleLowerCase('id-ID').includes(query)));
  }, [adminPrograms, search]);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [search]);

  const openCreate = () => {
    setSelectedProgram(null);
    setBatches([]);
    setDialogOpen(true);
  };

  const openEdit = async (program: Program) => {
    setFormLoading(true);
    setDialogOpen(true);
    try {
      const [programResponse, batchResponse] = await Promise.all([
        apiClient.admin.programs.get(program.id),
        apiClient.admin.programs.batches.list(program.id),
      ]);
      setSelectedProgram(programResponse.data ?? program);
      setBatches(unwrapArray<ProgramBatch>(batchResponse.data));
    } catch (requestError) {
      alertActions.error('Editor gagal dimuat', getErrorMessage(requestError, 'Detail program tidak tersedia.'));
      setDialogOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const saveComposition = async (program: Program, payload: ProgramWizardPayload) => {
    await Promise.all([
      apiClient.admin.programs.syncTags(program.id, payload.tag_ids, payload.reason),
      apiClient.admin.programs.syncComponents(program.id, payload.components, payload.reason),
      apiClient.admin.programs.syncRelations(program.id, payload.children, payload.reason),
    ]);
    await Promise.all([
      ...payload.batches.map((batch) => batch.id
        ? apiClient.admin.programs.batches.update(program.id, batch.id, batch)
        : apiClient.admin.programs.batches.create(program.id, batch)),
      ...payload.delete_batch_ids.map((batchId) => apiClient.admin.programs.batches.remove(program.id, batchId)),
    ]);
  };

  const submit = async (payload: ProgramWizardPayload) => {
    setFormLoading(true);
    try {
      const program = selectedProgram
        ? await updateProgram(selectedProgram.id, payload.basics)
        : await createProgram(payload.basics);
      await saveComposition(program, payload);
      await fetchAdminPrograms({ per_page: 100 });
      alertActions.success('Konfigurasi tersimpan', `${program.name} dan seluruh komposisinya telah diperbarui.`);
      setDialogOpen(false);
      setSelectedProgram(null);
    } catch (requestError) {
      alertActions.error('Program gagal disimpan', getErrorMessage(requestError, 'Periksa kembali konfigurasi program.'));
    } finally {
      setFormLoading(false);
    }
  };

  const transition = async (program: Program, action: 'publish' | 'unpublish' | 'archive' | 'restore') => {
    const label = action === 'publish' ? 'mempublikasikan' : action === 'unpublish' ? 'menarik publikasi' : action === 'archive' ? 'mengarsipkan' : 'memulihkan';
    if (!window.confirm(`Anda yakin ingin ${label} ${program.name}?`)) return;
    try {
      await transitionProgram(program.id, action, `${label} program melalui administrasi`);
      alertActions.success('Status diperbarui', `${program.name} berhasil diperbarui.`);
    } catch (requestError) {
      alertActions.error('Status gagal diperbarui', getErrorMessage(requestError, 'Status program tidak dapat diubah.'));
    }
  };

  const remove = async (program: Program) => {
    if (!window.confirm(`Hapus draft ${program.name} secara permanen?`)) return;
    try {
      await deleteProgram(program.id);
    } catch (requestError) {
      alertActions.error('Program gagal dihapus', getErrorMessage(requestError, 'Draft program tidak dapat dihapus.'));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Learning operations</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Master Program</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">Kelola katalog, komponen, collection, dan batch dari satu workspace administrasi.</p>
        </div>
        {canCreate && <Button onClick={openCreate} className="min-h-11"><Plus className="mr-2 size-4" />Tambah program</Button>}
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

      <Card className="border-zinc-200 shadow-none dark:border-zinc-800">
        <CardHeader className="gap-4 border-b border-zinc-200 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Semua program</CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, slug, status, atau tag" className="min-h-11 pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && adminPrograms.length === 0 ? (
            <div className="grid gap-3 p-6" role="status" aria-label="Memuat program">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />)}</div>
          ) : paginated.length === 0 ? (
            <div className="grid min-h-64 place-items-center p-8 text-center"><div><BookOpen className="mx-auto mb-3 size-8 text-zinc-400" /><p className="font-medium">Program tidak ditemukan</p><p className="mt-1 text-sm text-zinc-500">Ubah pencarian atau buat program pertama.</p></div></div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginated.map((program) => (
                <article key={program.id} className="grid gap-4 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:px-6">
                  <div className="flex min-w-0 gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></div>
                    <div className="min-w-0"><h2 className="truncate font-semibold text-zinc-950 dark:text-zinc-50">{program.name}</h2><p className="truncate text-sm text-zinc-500">/{program.slug} · {currency(program.base_price)}</p><div className="mt-2 flex flex-wrap gap-1.5">{program.tags?.slice(0, 3).map((tag) => <Badge key={tag.id} variant="outline" className="font-normal"><Tags className="mr-1 size-3" />{tag.name}</Badge>)}</div></div>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end"><Badge variant={program.status === 'PUBLISHED' ? 'default' : 'secondary'}>{statusLabels[program.status]}</Badge><span className="text-xs text-zinc-500">{program.visibility}</span></div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Aksi ${program.name}`} className="min-h-11 min-w-11"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>Aksi program</DropdownMenuLabel>
                      {canUpdate && <DropdownMenuItem onClick={() => void openEdit(program)}><Edit3 className="mr-2 size-4" />Edit konfigurasi</DropdownMenuItem>}
                      {canManageSessions && <DropdownMenuItem onClick={() => setDeliveryProgram(program)}><CalendarDays className="mr-2 size-4" />Kelola Batch & sesi</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      {canPublish && (program.status === 'DRAFT' || program.status === 'UNPUBLISHED') && <DropdownMenuItem onClick={() => void transition(program, 'publish')}>Publikasikan</DropdownMenuItem>}
                      {canPublish && program.status === 'PUBLISHED' && <DropdownMenuItem onClick={() => void transition(program, 'unpublish')}>Tarik publikasi</DropdownMenuItem>}
                      {canArchive && program.status !== 'ARCHIVED' && <DropdownMenuItem onClick={() => void transition(program, 'archive')}><Archive className="mr-2 size-4" />Arsipkan</DropdownMenuItem>}
                      {canArchive && program.status === 'ARCHIVED' && <DropdownMenuItem onClick={() => void transition(program, 'restore')}>Pulihkan sebagai draft</DropdownMenuItem>}
                      {canUpdate && program.status === 'DRAFT' && <><DropdownMenuSeparator /><DropdownMenuItem className="text-red-600" onClick={() => void remove(program)}>Hapus draft</DropdownMenuItem></>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </article>
              ))}
            </div>
          )}
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <PaginationControls currentPage={page} lastPage={Math.max(1, Math.ceil(filtered.length / perPage))} total={filtered.length} from={filtered.length ? (page - 1) * perPage + 1 : 0} to={Math.min(page * perPage, filtered.length)} onPageChange={setPage} itemLabel="program" isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !formLoading && setDialogOpen(open)}>
        <DialogContent className="max-h-[92dvh] max-w-5xl overflow-y-auto bg-white dark:bg-zinc-950">
          <DialogHeader><DialogTitle>{selectedProgram ? `Edit ${selectedProgram.name}` : 'Tambah program baru'}</DialogTitle></DialogHeader>
          {formLoading && !selectedProgram && dialogOpen ? <div className="grid min-h-80 place-items-center text-sm text-zinc-500">Memuat editor…</div> : (
            <ProgramForm initialData={selectedProgram} initialBatches={batches} tags={tags} definitions={definitions} programs={adminPrograms} onSubmit={submit} onCancel={() => setDialogOpen(false)} isLoading={formLoading} />
          )}
        </DialogContent>
      </Dialog>
      <ProgramDeliveryDialog program={deliveryProgram} open={deliveryProgram !== null} onOpenChange={(open) => !open && setDeliveryProgram(null)} />
    </motion.div>
  );
}
