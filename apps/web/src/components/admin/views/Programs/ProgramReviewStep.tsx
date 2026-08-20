import { Label } from '@/components/ui/label';
import type { ProgramStepProps } from './wizard-types';

export function ProgramReviewStep({ state, setState, tags, definitions }: ProgramStepProps) {
  return (
    <div className="grid gap-6">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-zinc-200 p-5 text-sm dark:border-zinc-800">
        <dt className="text-zinc-500">Program</dt><dd className="font-medium">{state.name || 'Belum diisi'}</dd>
        <dt className="text-zinc-500">Harga</dt><dd className="font-medium">Rp {Number(state.basePrice || 0).toLocaleString('id-ID')}</dd>
        <dt className="text-zinc-500">Tag</dt><dd className="font-medium">{tags.filter((tag) => state.tagIds.includes(tag.id)).map((tag) => tag.name).join(', ') || 'Tanpa tag'}</dd>
        <dt className="text-zinc-500">Component</dt><dd className="font-medium">{definitions.filter((item) => state.componentIds.includes(item.id)).map((item) => item.name).join(', ') || 'Belum dipilih'}</dd>
        <dt className="text-zinc-500">Collection</dt><dd className="font-medium">{state.childIds.length} program</dd>
        <dt className="text-zinc-500">Batch baru</dt><dd className="font-medium">{state.batches.filter((batch) => !batch.id).length}</dd>
      </dl>
      <div className="grid gap-2">
        <Label htmlFor="program-reason">Alasan perubahan</Label>
        <textarea id="program-reason" required minLength={5} maxLength={1000} className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-950" value={state.reason} onChange={(event) => setState((current) => ({ ...current, reason: event.target.value }))} />
        <p className="text-xs text-zinc-500">Alasan akan dicatat pada audit untuk komposisi Program.</p>
      </div>
    </div>
  );
}
