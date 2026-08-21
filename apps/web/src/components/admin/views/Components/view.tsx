'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Archive, Blocks, Edit3, MoreHorizontal, Plus, RefreshCcw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { ComponentDefinition, ComponentDefinitionPayload } from '@/types/sales';
import { ComponentDefinitionForm } from './form';

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value) return ((value as { data?: T[] }).data ?? []);
  return [];
}

type DestructiveAction = { type: 'archive' | 'restore' | 'force'; component: ComponentDefinition } | null;

export default function ComponentsView() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasRole = useAuthStore((state) => state.hasRole);
  const [components, setComponents] = useState<ComponentDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<ComponentDefinition | null>(null);
  const [action, setAction] = useState<DestructiveAction>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.admin.componentDefinitions.list({ include_archived: true });
      setComponents(unwrapArray<ComponentDefinition>(response.data));
    } catch (error) {
      alertActions.error('Component gagal dimuat', getErrorMessage(error, 'Katalog component tidak tersedia.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id-ID');
    return components.filter((component) => {
      if (!showArchived && component.deleted_at) return false;
      return !query || `${component.name} ${component.code} ${component.handler_template}`.toLocaleLowerCase('id-ID').includes(query);
    });
  }, [components, search, showArchived]);

  const save = async (payload: ComponentDefinitionPayload) => {
    setLoading(true);
    try {
      if (selected) await apiClient.admin.componentDefinitions.update(selected.id, payload);
      else await apiClient.admin.componentDefinitions.create(payload);
      await load();
      setFormOpen(false);
      setSelected(null);
      alertActions.success('Component tersimpan', `${payload.name} langsung tersedia di pilihan Program dalam keadaan tidak tercentang.`);
    } catch (error) {
      alertActions.error('Component gagal disimpan', getErrorMessage(error, 'Periksa kembali konfigurasi component.'));
      setLoading(false);
    }
  };

  const confirmAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!action) return;
    setLoading(true);
    try {
      if (action.type === 'archive') await apiClient.admin.componentDefinitions.archive(action.component.id, reason);
      if (action.type === 'restore') await apiClient.admin.componentDefinitions.restore(action.component.id, reason);
      if (action.type === 'force') await apiClient.admin.componentDefinitions.forceDelete(action.component.id, reason);
      await load();
      setAction(null);
      setReason('');
      alertActions.success('Katalog diperbarui', `${action.component.name} berhasil diproses.`);
    } catch (error) {
      alertActions.error('Aksi gagal', getErrorMessage(error, 'Component tidak dapat diproses.'));
      setLoading(false);
    }
  };

  const openForm = (component?: ComponentDefinition) => {
    setSelected(component ?? null);
    setFormOpen(true);
  };

  const canCreate = hasPermission('component-definition.create');
  const canUpdate = hasPermission('component-definition.update');
  const canArchive = hasPermission('component-definition.delete');
  const canRestore = hasPermission('component-definition.restore');
  const canForce = hasRole('superadmin') && hasPermission('component-definition.force-delete');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Capability registry</p>
          <h1 className="text-3xl font-semibold tracking-tight">Component Catalog</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">Jenis component menentukan renderer dan validasi. Isi aktual dikelola pada masing-masing Program.</p>
        </div>
        {canCreate && <Button className="min-h-11" onClick={() => openForm()}><Plus className="mr-2 size-4" />Tambah component</Button>}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="p-5"><p className="text-sm text-zinc-500">Tersedia</p><p className="mt-1 text-2xl font-semibold">{components.filter((item) => item.is_available && !item.deleted_at).length}</p></CardContent></Card>
        <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="p-5"><p className="text-sm text-zinc-500">Roadmap</p><p className="mt-1 text-2xl font-semibold">{components.filter((item) => !item.is_available && !item.deleted_at).length}</p></CardContent></Card>
        <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="p-5"><p className="text-sm text-zinc-500">Terpasang</p><p className="mt-1 text-2xl font-semibold">{components.reduce((total, item) => total + item.usage_count, 0)}</p></CardContent></Card>
      </div>

      <Card className="border-zinc-200 shadow-none dark:border-zinc-800">
        <CardHeader className="gap-4 border-b border-zinc-200 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-lg">Registry component</CardTitle>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-700"><input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} className="size-4 accent-primary" />Tampilkan arsip</label>
            <div className="relative sm:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, kode, atau handler" className="min-h-11 pl-9" /></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && components.length === 0 ? (
            <div className="grid gap-3 p-6" role="status">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-64 place-items-center p-8 text-center"><div><Blocks className="mx-auto mb-3 size-8 text-zinc-400" /><p className="font-medium">Component tidak ditemukan</p><p className="mt-1 text-sm text-zinc-500">Ubah filter atau tambahkan component generic baru.</p></div></div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((component) => (
                <article key={component.id} className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6">
                  <div className="flex min-w-0 gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Blocks className="size-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{component.name}</h2><Badge variant="outline">{component.code}</Badge>{component.is_system && <Badge variant="secondary"><ShieldCheck className="mr-1 size-3" />System</Badge>}</div><p className="mt-1 line-clamp-2 text-sm text-zinc-500">{component.description || 'Tanpa deskripsi'}</p></div></div>
                  <div className="flex flex-wrap items-center gap-2"><Badge variant={component.is_available ? 'default' : 'secondary'}>{component.deleted_at ? 'Archived' : component.is_available ? 'Available' : 'Roadmap'}</Badge><span className="text-xs text-zinc-500">{component.handler_template} · {component.usage_count} Program</span></div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={`Aksi ${component.name}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuLabel>Aksi component</DropdownMenuLabel>{canUpdate && !component.deleted_at && <DropdownMenuItem onClick={() => openForm(component)}><Edit3 className="mr-2 size-4" />Edit metadata</DropdownMenuItem>}{canArchive && !component.deleted_at && !component.is_system && <DropdownMenuItem onClick={() => { setAction({ type: 'archive', component }); setReason(''); }}><Archive className="mr-2 size-4" />Arsipkan</DropdownMenuItem>}{canRestore && component.deleted_at && <DropdownMenuItem onClick={() => { setAction({ type: 'restore', component }); setReason(''); }}><RefreshCcw className="mr-2 size-4" />Pulihkan</DropdownMenuItem>}{canForce && component.deleted_at && !component.is_system && component.usage_count === 0 && <><DropdownMenuSeparator /><DropdownMenuItem className="text-red-600" onClick={() => { setAction({ type: 'force', component }); setReason(''); }}><Trash2 className="mr-2 size-4" />Hapus permanen</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={(open) => !loading && setFormOpen(open)}><DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto bg-white dark:bg-zinc-950"><DialogHeader><DialogTitle>{selected ? `Edit ${selected.name}` : 'Tambah component'}</DialogTitle></DialogHeader><ComponentDefinitionForm initial={selected} loading={loading} onCancel={() => setFormOpen(false)} onSubmit={save} /></DialogContent></Dialog>

      <Dialog open={Boolean(action)} onOpenChange={(open) => !loading && !open && setAction(null)}><DialogContent className="bg-white dark:bg-zinc-950"><DialogHeader><DialogTitle>{action?.type === 'archive' ? 'Arsipkan component' : action?.type === 'restore' ? 'Pulihkan component' : 'Hapus permanen component'}</DialogTitle></DialogHeader><form onSubmit={confirmAction} className="grid gap-5"><p className="text-sm text-zinc-500">{action?.type === 'force' ? 'Tindakan ini tidak dapat dibatalkan dan hanya diizinkan bila tidak ada histori pemasangan.' : 'Perubahan berlaku pada katalog. Histori Program tetap dipertahankan.'}</p><div className="grid gap-2"><Label htmlFor="component-reason">Alasan</Label><textarea id="component-reason" required minLength={5} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-24 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-950" /></div><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setAction(null)}>Batal</Button><Button type="submit" variant={action?.type === 'force' ? 'destructive' : 'default'} disabled={loading}>{loading ? 'Memproses…' : 'Konfirmasi'}</Button></div></form></DialogContent></Dialog>
    </motion.div>
  );
}
