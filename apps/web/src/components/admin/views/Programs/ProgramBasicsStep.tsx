import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProgramStepProps, ProgramWizardState } from './wizard-types';

export function ProgramBasicsStep({ state, setState }: ProgramStepProps) {
  const update = (field: string, value: string) => setState((current) => ({
    ...current,
    [field]: value,
  }));

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="program-name">Nama program</Label>
        <Input id="program-name" value={state.name} required onChange={(event) => update('name', event.target.value)} />
        <p className="text-xs text-zinc-500">Nama yang terlihat di katalog dan Workspace.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program-slug">Slug</Label>
        <Input id="program-slug" value={state.slug} required pattern="[a-z0-9-]+" onChange={(event) => update('slug', event.target.value.toLowerCase())} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program-price">Harga dasar</Label>
        <Input id="program-price" type="number" min="0" step="0.01" value={state.basePrice} required onChange={(event) => update('basePrice', event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program-visibility">Visibilitas</Label>
        <Select value={state.visibility} onValueChange={(value) => update('visibility', value)}>
          <SelectTrigger id="program-visibility"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLIC">Publik</SelectItem>
            <SelectItem value="UNLISTED">Tautan langsung</SelectItem>
            <SelectItem value="PRIVATE">Privat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program-thumbnail">URL thumbnail</Label>
        <Input id="program-thumbnail" type="url" value={state.thumbnailUrl} onChange={(event) => update('thumbnailUrl', event.target.value)} />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="program-completion">Aturan kelulusan</Label>
        <Select value={state.completionMode} onValueChange={(value) => setState((current) => ({ ...current, completionMode: value as ProgramWizardState['completionMode'] }))}>
          <SelectTrigger id="program-completion"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">Tidak otomatis</SelectItem>
            <SelectItem value="MATERIAL">Semua materi selesai</SelectItem>
            <SelectItem value="ASSESSMENT">Minimal satu assessment disubmit</SelectItem>
            <SelectItem value="BOTH">Materi dan assessment selesai</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-zinc-500">Access menjadi completed hanya dari aktivitas component, bukan angka manual.</p>
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="program-summary">Deskripsi singkat</Label>
        <Input id="program-summary" maxLength={500} value={state.shortDescription} onChange={(event) => update('shortDescription', event.target.value)} />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="program-description">Deskripsi lengkap</Label>
        <textarea id="program-description" className="min-h-28 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" value={state.description} onChange={(event) => update('description', event.target.value)} />
      </div>
    </div>
  );
}
