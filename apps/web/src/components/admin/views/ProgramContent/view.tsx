'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Blocks, BookOpen, CalendarDays, ClipboardCheck, FileBadge, Files } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Program, ProgramComponent } from '@/types/sales';
import { GenericContentEditor } from './GenericContentEditor';
import { MaterialEditor } from './MaterialEditor';

interface ProgramContentViewProps { data?: { programId?: number; programName?: string } }

const nativeGuidance: Record<string, { title: string; description: string; icon: typeof Blocks }> = {
  meeting: { title: 'Jadwal pertemuan', description: 'Isi Meeting dikelola lewat Batch & sesi pada menu aksi Program.', icon: CalendarDays },
  assessment: { title: 'Paket assessment', description: 'Paket ujian dipilih pada konfigurasi Program dan dijalankan oleh domain CBT.', icon: ClipboardCheck },
  certificate: { title: 'Sertifikat otomatis', description: 'Sertifikat diterbitkan otomatis saat completion rule Program terpenuhi.', icon: FileBadge },
};

export default function ProgramContentView({ data }: ProgramContentViewProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [program, setProgram] = useState<Program | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const programId = Number(data?.programId || 0);
  const canManage = hasPermission('program-content.manage');
  const canPublish = hasPermission('program-content.publish');
  const canUpload = hasPermission('media-asset.upload');

  const load = useCallback(async () => {
    if (!programId) return;
    setLoading(true);
    try {
      const response = await apiClient.admin.programs.get(programId);
      const loaded = response.data;
      if (!loaded) throw new Error('Respons Program kosong.');
      setProgram(loaded);
      const first = (loaded.components ?? []).find((component) => component.is_enabled && component.id);
      setSelectedId((current) => current && loaded.components?.some((component) => component.id === current) ? current : first?.id ?? null);
    } catch (error) {
      alertActions.error('Program gagal dimuat', getErrorMessage(error, 'Program tidak tersedia atau Anda tidak memiliki akses.'));
    } finally { setLoading(false); }
  }, [programId]);

  useEffect(() => { void load(); }, [load]);

  const components = useMemo(() => (program?.components ?? []).filter((component) => component.is_enabled && component.id), [program]);
  const selected = components.find((component) => component.id === selectedId) ?? null;

  if (!programId) return <div className="grid min-h-64 place-items-center text-sm text-red-600">Program ID tidak tersedia. Buka editor isi dari menu aksi Program.</div>;

  return (
    <div className="grid gap-6">
      <header><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Program content</p><h1 className="text-3xl font-semibold tracking-tight">Kelola isi Program</h1><p className="mt-2 max-w-2xl text-sm text-zinc-500">{program?.name || data?.programName || 'Program'} · Definition menentukan jenis fitur, sedangkan halaman ini menyimpan isi untuk pemasangan component pada Program.</p></header>
      {loading && !program ? <div className="grid gap-3" role="status">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />)}</div> : components.length === 0 ? <Card className="border-dashed border-zinc-300 shadow-none dark:border-zinc-700"><CardContent className="grid min-h-64 place-items-center p-8 text-center"><div><Blocks className="mx-auto mb-3 size-8 text-zinc-400" /><p className="font-medium">Belum ada component aktif</p><p className="mt-1 max-w-md text-sm text-zinc-500">Aktifkan component melalui Edit konfigurasi Program. Component baru dari katalog selalu muncul dalam keadaan tidak tercentang.</p></div></CardContent></Card> : <><div className="flex gap-2 overflow-x-auto pb-2" aria-label="Pilih component Program">{components.map((component) => <Button key={component.id} variant={selectedId === component.id ? 'default' : 'outline'} className="min-h-11 shrink-0" onClick={() => setSelectedId(component.id as number)}><Files className="mr-2 size-4" />{component.label || component.name}<Badge variant="secondary" className="ml-2">{component.handler_template || 'NATIVE'}</Badge></Button>)}</div>{selected && <ComponentEditor programId={programId} component={selected} canManage={canManage} canPublish={canPublish} canUpload={canUpload} />}</>}
    </div>
  );
}

function ComponentEditor({ programId, component, canManage, canPublish, canUpload }: { programId: number; component: ProgramComponent; canManage: boolean; canPublish: boolean; canUpload: boolean }) {
  if (component.handler_template !== 'NATIVE') return <GenericContentEditor programId={programId} component={component} canManage={canManage} canPublish={canPublish} canUpload={canUpload} />;
  if (component.code === 'material') return <MaterialEditor programId={programId} canManage={canManage} canPublish={canPublish} canUpload={canUpload} />;
  const guidance = nativeGuidance[component.code] ?? { title: component.label || component.name, description: 'Component native ini dikelola melalui domain khusus aplikasi.', icon: BookOpen };
  const Icon = guidance.icon;
  return <Card className="border-zinc-200 shadow-none dark:border-zinc-800"><CardContent className="grid min-h-64 place-items-center p-8 text-center"><div><div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><h2 className="font-semibold">{guidance.title}</h2><p className="mt-2 max-w-lg text-sm text-zinc-500">{guidance.description}</p></div></CardContent></Card>;
}
