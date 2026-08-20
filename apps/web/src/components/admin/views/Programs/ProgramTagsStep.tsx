import { Tag } from 'lucide-react';
import type { ProgramStepProps } from './wizard-types';

export function ProgramTagsStep({ state, setState, tags }: ProgramStepProps) {
  const toggle = (id: number) => setState((current) => ({
    ...current,
    tagIds: current.tagIds.includes(id)
      ? current.tagIds.filter((tagId) => tagId !== id)
      : [...current.tagIds, id],
  }));

  if (tags.length === 0) {
    return <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">Belum ada tag aktif. Tambahkan tag melalui menu Tags.</p>;
  }

  return (
    <fieldset className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <legend className="sr-only">Pilih tag program</legend>
      {tags.map((tag) => (
        <label key={tag.id} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-primary/50 dark:border-zinc-800 dark:bg-zinc-950">
          <input type="checkbox" checked={state.tagIds.includes(tag.id)} onChange={() => toggle(tag.id)} className="size-4 accent-primary" />
          <Tag className="size-4 text-primary" aria-hidden="true" />
          <span><span className="block text-sm font-medium">{tag.name}</span><span className="block text-xs text-zinc-500">{tag.code}</span></span>
        </label>
      ))}
    </fieldset>
  );
}
