'use client';

import { MaterialEditor } from '../ProgramContent/MaterialEditor';
import { useAuthStore } from '@/store/useAuthStore';

interface CurriculumBuilderViewProps { data?: { programId?: number; programName?: string } }

export default function CurriculumBuilderView({ data }: CurriculumBuilderViewProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!data?.programId) return <div className="grid min-h-64 place-items-center text-sm text-red-600">Program ID tidak tersedia. Buka kurikulum dari menu aksi Program.</div>;
  return <div className="grid gap-6"><header><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Material</p><h1 className="text-3xl font-semibold tracking-tight">{data.programName || 'Kurikulum Program'}</h1><p className="mt-2 text-sm text-zinc-500">Editor material menggunakan penyimpanan privat dan validasi publish yang sama dengan Program Content.</p></header><MaterialEditor programId={data.programId} canManage={hasPermission('program-content.manage')} canPublish={hasPermission('program-content.publish')} canUpload={hasPermission('media-asset.upload')} /></div>;
}
