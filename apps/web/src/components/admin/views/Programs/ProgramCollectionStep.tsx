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
      <p className="text-sm text-zinc-500">Kosongkan jika program ini bukan collection. Cycle akan ditolak oleh backend.</p>
      {programs.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-zinc-500">Belum ada program lain yang dapat dipilih.</p>
      ) : programs.map((program) => (
        <label key={program.id} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <input type="checkbox" checked={state.childIds.includes(program.id)} onChange={() => toggle(program.id)} className="size-4 accent-primary" />
          <PackageOpen className="size-4 text-primary" aria-hidden="true" />
          <span className="min-w-0"><span className="block truncate text-sm font-medium">{program.name}</span><span className="block truncate text-xs text-zinc-500">{program.slug}</span></span>
        </label>
      ))}
    </div>
  );
}
