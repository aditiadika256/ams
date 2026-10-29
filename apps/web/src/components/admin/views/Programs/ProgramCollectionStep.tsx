import { PackageOpen } from 'lucide-react';
import type { ProgramStepProps } from './wizard-types';

export function ProgramCollectionStep({ state, setState, programs }: ProgramStepProps) {
  const toggle = (id: number) => setState((current) => ({
    ...current,
    childIds: current.childIds.includes(id)
      ? current.childIds.filter((programId) => programId !== id)
      : [...current.childIds, id],
  }));

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">Kosongkan jika program ini bukan collection. Cycle akan ditolak oleh backend.</p>
      {programs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-sm p-6 text-sm text-muted-foreground text-center">
          Belum ada program lain yang dapat dipilih.
        </p>
      ) : programs.map((program) => (
        <label key={program.id} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-3 hover:bg-muted/40 transition-colors">
          <input type="checkbox" checked={state.childIds.includes(program.id)} onChange={() => toggle(program.id)} className="size-4 accent-primary rounded" />
          <PackageOpen className="size-4 text-primary" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{program.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{program.slug}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
