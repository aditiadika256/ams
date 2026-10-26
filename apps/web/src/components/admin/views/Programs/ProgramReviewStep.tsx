import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { ProgramStepProps } from './wizard-types';

export function ProgramReviewStep({ state, setState, tags, definitions }: ProgramStepProps) {
  const isScheduleActive = state.components.some((c) => {
    if (!c.isEnabled) return false;
    const def = definitions.find((d) => d.id === c.componentDefinitionId);
    return def?.code?.toLowerCase().includes('schedule') || def?.code?.toLowerCase().includes('meeting');
  });

  const activeComponents = state.components.filter((c) => c.isEnabled);

  return (
    <div className="grid gap-6">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-zinc-200/80 bg-white/60 p-5 text-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <dt className="text-zinc-500">Program</dt>
        <dd className="font-medium">{state.name || 'Belum diisi'}</dd>

        <dt className="text-zinc-500">Mode Belajar</dt>
        <dd>
          <Badge variant={isScheduleActive ? 'default' : 'secondary'} className="text-xs">
            {isScheduleActive ? 'Mode Kelas Terjadwal (Live/Offline)' : 'Mode Course Mandiri (Self-Paced)'}
          </Badge>
        </dd>

        <dt className="text-zinc-500">Harga Dasar</dt>
        <dd className="font-medium">Rp {Number(state.basePrice || 0).toLocaleString('id-ID')}</dd>

        <dt className="text-zinc-500">Tag Terpilih</dt>
        <dd className="font-medium">
          {tags.filter((tag) => state.tagIds.includes(tag.id)).map((tag) => tag.name).join(', ') || (state.tagIds.length > 0 ? `${state.tagIds.length} tag terpilih` : 'Tanpa tag')}
        </dd>

        <dt className="text-zinc-500">Komponen ({activeComponents.length})</dt>
        <dd className="font-medium">
          {activeComponents.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {activeComponents.map((c, idx) => (
                <span key={c.instanceKey || idx} className="rounded-md border border-zinc-200 bg-zinc-100/70 px-2 py-0.5 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                  {c.label || definitions.find((d) => d.id === c.componentDefinitionId)?.name || 'Komponen'}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-zinc-400">Belum ada komponen aktif</span>
          )}
        </dd>

        <dt className="text-zinc-500">Collection</dt>
        <dd className="font-medium">{state.childIds.length} program turunan</dd>

        <dt className="text-zinc-500">Batch baru</dt>
        <dd className="font-medium">{state.batches.filter((batch) => !batch.id).length}</dd>
      </dl>

      <div className="grid gap-2">
        <Label htmlFor="program-reason">Alasan perubahan konfigurasi</Label>
        <textarea
          id="program-reason"
          required
          minLength={5}
          maxLength={1000}
          className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-950/80"
          value={state.reason}
          onChange={(event) => setState((current) => ({ ...current, reason: event.target.value }))}
          placeholder="Masukkan catatan alasan pembuatan/perubahan program untuk audit log..."
        />
        <p className="text-xs text-zinc-500">Alasan akan dicatat pada audit untuk komposisi Program.</p>
      </div>
    </div>
  );
}
