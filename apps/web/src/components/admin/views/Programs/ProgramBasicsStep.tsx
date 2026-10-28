import { useState, type ChangeEvent } from 'react';
import { Sparkles } from 'lucide-react';
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProgramBasicsStep({ state, setState }: ProgramStepProps) {
  const [isManualSlug, setIsManualSlug] = useState(() => {
    if (!state.slug) return false;
    return state.slug !== slugify(state.name);
  });

  const update = (field: string, value: string) => setState((current) => ({
    ...current,
    [field]: value,
  }));

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    if (!isManualSlug) {
      const autoSlug = slugify(newName);
      setState((current) => ({
        ...current,
        name: newName,
        slug: autoSlug,
      }));
    } else {
      update('name', newName);
    }
  };

  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsManualSlug(true);
    const raw = event.target.value.toLowerCase().replace(/\s+/g, '-');
    const sanitized = raw.replace(/[^a-z0-9\-]/g, '');
    update('slug', sanitized);
  };

  const handleAutoSlug = () => {
    setIsManualSlug(false);
    update('slug', slugify(state.name));
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="program-name">Nama program</Label>
        <Input id="program-name" value={state.name} required onChange={handleNameChange} />
        <p className="text-xs text-zinc-500">Nama resmi program yang terlihat di katalog dan portal siswa.</p>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="program-slug">Tautan Publik (Slug URL)</Label>
          {isManualSlug && (
            <button
              type="button"
              onClick={handleAutoSlug}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium transition-colors"
            >
              <Sparkles className="size-3" />
              Otomatis dari nama
            </button>
          )}
        </div>
        <div className="flex rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
          <span className="inline-flex items-center px-3 text-xs text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/50 select-none font-mono">
            /programs/
          </span>
          <input
            id="program-slug"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400 font-mono"
            value={state.slug}
            placeholder="nama-program-anda"
            required
            pattern="[a-z0-9\-]+"
            onChange={handleSlugChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-zinc-500">
            Alamat web unik program (otomatis dibuat dari nama, hanya huruf kecil, angka, dan tanda strip).
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
            URL: arkanin.my.id/programs/<span className="text-primary font-medium">{state.slug || 'nama-program'}</span>
          </p>
        </div>
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
