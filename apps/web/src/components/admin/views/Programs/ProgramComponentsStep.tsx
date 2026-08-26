import { Blocks } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ProgramStepProps } from './wizard-types';

export function ProgramComponentsStep({ state, setState, definitions }: ProgramStepProps) {
  const toggle = (id: number) => setState((current) => ({
    ...current,
    componentIds: current.componentIds.includes(id)
      ? current.componentIds.filter((componentId) => componentId !== id)
      : [...current.componentIds, id],
  }));

  return (
    <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {definitions.map((definition) => {
        const checked = state.componentIds.includes(definition.id);
        const unavailable = !definition.is_available;
        return (
          <div key={definition.id} className="grid gap-3 p-4 md:grid-cols-[1fr_240px] md:items-center">
            <label className={`flex min-h-11 items-center gap-3 ${unavailable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <input type="checkbox" checked={checked && !unavailable} disabled={unavailable} onChange={() => toggle(definition.id)} className="size-4 accent-primary" />
              <Blocks className="size-4 text-primary" aria-hidden="true" />
              <span><span className="flex flex-wrap items-center gap-2 text-sm font-medium">{definition.name}{unavailable && <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">Belum tersedia</span>}</span><span className="block text-xs text-zinc-500">{definition.description || definition.code}</span></span>
            </label>
            <Input aria-label={`Label ${definition.name}`} disabled={!checked || unavailable} placeholder="Label navigasi (opsional)" value={state.componentLabels[definition.id] ?? ''} onChange={(event) => setState((current) => ({ ...current, componentLabels: { ...current.componentLabels, [definition.id]: event.target.value } }))} />
          </div>
        );
      })}
    </div>
  );
}
