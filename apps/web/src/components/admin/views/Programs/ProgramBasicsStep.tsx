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
        <Label htmlFor="program-name" className="text-foreground">Nama program</Label>
        <Input id="program-name" value={state.name} required onChange={handleNameChange} className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Nama resmi program yang terlihat di katalog dan portal siswa.</p>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="program-slug" className="text-foreground">Tautan Publik (Slug URL)</Label>
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
        <div className="flex rounded-xl border border-input/60 bg-background/70 overflow-hidden focus-within:ring-2 focus-within:ring-ring/40 transition-all">
          <span className="inline-flex items-center px-3 text-xs text-muted-foreground border-r border-border/60 bg-muted/60 select-none font-mono">
            /programs/
          </span>
          <input
            id="program-slug"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground font-mono"
            value={state.slug}
            placeholder="nama-program-anda"
            required
            pattern="[a-z0-9\-]+"
            onChange={handleSlugChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            Alamat web unik program (otomatis dibuat dari nama, hanya huruf kecil, angka, dan tanda strip).
          </p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">
            URL: arkanin.my.id/programs/<span className="text-primary font-medium">{state.slug || 'nama-program'}</span>
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program-price" className="text-foreground">Harga dasar</Label>
        <Input id="program-price" type="number" min="0" step="0.01" value={state.basePrice} required onChange={(event) => update('basePrice', event.target.value)} className="h-10 bg-background/70 border-input/60 text-foreground" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program-visibility" className="text-foreground">Visibilitas</Label>
        <Select value={state.visibility} onValueChange={(value) => update('visibility', value)}>
          <SelectTrigger id="program-visibility" className="h-10 bg-background/70 border-input/60 text-foreground"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card/95 border-border/60">
            <SelectItem value="PUBLIC">Publik</SelectItem>
            <SelectItem value="UNLISTED">Tautan langsung</SelectItem>
            <SelectItem value="PRIVATE">Privat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program-thumbnail" className="text-foreground">URL thumbnail</Label>
        <Input id="program-thumbnail" type="url" value={state.thumbnailUrl} onChange={(event) => update('thumbnailUrl', event.target.value)} className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="program-completion" className="text-foreground">Aturan kelulusan</Label>
        <Select value={state.completionMode} onValueChange={(value) => setState((current) => ({ ...current, completionMode: value as ProgramWizardState['completionMode'] }))}>
          <SelectTrigger id="program-completion" className="h-10 bg-background/70 border-input/60 text-foreground"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card/95 border-border/60">
            <SelectItem value="NONE">Tidak otomatis</SelectItem>
            <SelectItem value="MATERIAL">Semua materi selesai</SelectItem>
            <SelectItem value="ASSESSMENT">Minimal satu assessment disubmit</SelectItem>
            <SelectItem value="BOTH">Materi dan assessment selesai</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Access menjadi completed hanya dari aktivitas component, bukan angka manual.</p>
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="program-summary" className="text-foreground">Deskripsi singkat</Label>
        <Input id="program-summary" maxLength={500} value={state.shortDescription} onChange={(event) => update('shortDescription', event.target.value)} className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="program-description" className="text-foreground">Deskripsi lengkap</Label>
        <textarea id="program-description" className="min-h-28 w-full rounded-xl border border-input/60 bg-background/70 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40" value={state.description} onChange={(event) => update('description', event.target.value)} />
      </div>
    </div>
  );
}
