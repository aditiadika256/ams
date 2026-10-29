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
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl p-5 text-sm shadow-sm">
        <dt className="text-muted-foreground">Program</dt>
        <dd className="font-semibold text-foreground">{state.name || 'Belum diisi'}</dd>

        <dt className="text-muted-foreground">Mode Belajar</dt>
        <dd>
          <Badge variant={isScheduleActive ? 'default' : 'secondary'} className="text-xs">
            {isScheduleActive ? 'Mode Kelas Terjadwal (Live/Offline)' : 'Mode Course Mandiri (Self-Paced)'}
          </Badge>
        </dd>

        <dt className="text-muted-foreground">Harga Dasar</dt>
        <dd className="font-semibold text-foreground">Rp {Number(state.basePrice || 0).toLocaleString('id-ID')}</dd>

        <dt className="text-muted-foreground">Tag Terpilih</dt>
        <dd className="font-medium text-foreground">
          {tags.filter((tag) => state.tagIds.includes(tag.id)).map((tag) => tag.name).join(', ') || (state.tagIds.length > 0 ? `${state.tagIds.length} tag terpilih` : 'Tanpa tag')}
        </dd>

        <dt className="text-muted-foreground">Komponen ({activeComponents.length})</dt>
        <dd className="font-medium text-foreground">
          {activeComponents.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {activeComponents.map((c, idx) => (
                <span key={c.instanceKey || idx} className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-xs text-foreground">
                  {c.label || definitions.find((d) => d.id === c.componentDefinitionId)?.name || 'Komponen'}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground italic">Belum ada komponen aktif</span>
          )}
        </dd>

        <dt className="text-muted-foreground">Collection</dt>
        <dd className="font-medium text-foreground">{state.childIds.length} program turunan</dd>

        <dt className="text-muted-foreground">Batch baru</dt>
        <dd className="font-medium text-foreground">{state.batches.filter((batch) => !batch.id).length}</dd>
      </dl>

      <div className="grid gap-2">
        <Label htmlFor="program-reason" className="text-foreground">Alasan perubahan konfigurasi</Label>
        <textarea
          id="program-reason"
          required
          minLength={5}
          maxLength={1000}
          className="min-h-24 w-full rounded-xl border border-input/60 bg-background/70 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          value={state.reason}
          onChange={(event) => setState((current) => ({ ...current, reason: event.target.value }))}
          placeholder="Masukkan catatan alasan pembuatan/perubahan program untuk audit log..."
        />
        <p className="text-xs text-muted-foreground">Alasan akan dicatat pada audit untuk komposisi Program.</p>
      </div>
    </div>
  );
}
