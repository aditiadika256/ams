import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BatchDraft, ProgramStepProps } from './wizard-types';

const emptyBatch = (): BatchDraft => ({
  name: '', code: '', mode: 'ONLINE', capacity: '', timezone: 'Asia/Makassar',
  location: '', registration_starts_at: '', registration_ends_at: '',
  starts_at: '', ends_at: '', price_override: '', allow_retakes: false,
});

export function ProgramBatchesStep({ state, setState }: ProgramStepProps) {
  const update = (index: number, patch: Partial<BatchDraft>) => setState((current) => ({
    ...current,
    batches: current.batches.map((batch, batchIndex) => batchIndex === index ? { ...batch, ...patch } : batch),
  }));

  return (
    <div className="grid gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Batch opsional. Program on-demand dapat disimpan tanpa Batch.</p>
        <Button type="button" variant="outline" className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs" onClick={() => setState((current) => ({ ...current, batches: [...current.batches, emptyBatch()] }))}>
          <Plus className="mr-2 size-4" />Tambah batch
        </Button>
      </div>
      {state.batches.map((batch, index) => (
        <section key={`${batch.id ?? 'new'}-${index}`} className="grid gap-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`batch-name-${index}`} className="text-foreground">Nama</Label>
            <Input id={`batch-name-${index}`} value={batch.name} onChange={(event) => update(index, { name: event.target.value })} className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-code-${index}`} className="text-foreground">Kode</Label>
            <Input id={`batch-code-${index}`} value={batch.code} onChange={(event) => update(index, { code: event.target.value.toUpperCase() })} className="h-10 font-mono bg-background/70 border-input/60 text-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-mode-${index}`} className="text-foreground">Mode</Label>
            <Select value={batch.mode} onValueChange={(mode) => update(index, { mode: mode as BatchDraft['mode'] })}>
              <SelectTrigger id={`batch-mode-${index}`} className="h-10 bg-background/70 border-input/60 text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card/95 border-border/60">
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-location-${index}`} className="text-foreground">Lokasi</Label>
            <Input id={`batch-location-${index}`} required={batch.mode !== 'ONLINE'} value={batch.location} onChange={(event) => update(index, { location: event.target.value })} className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-registration-start-${index}`} className="text-foreground">Registrasi mulai</Label>
            <Input id={`batch-registration-start-${index}`} type="datetime-local" value={batch.registration_starts_at} onChange={(event) => update(index, { registration_starts_at: event.target.value })} className="h-10 bg-background/70 border-input/60 text-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-registration-end-${index}`} className="text-foreground">Registrasi selesai</Label>
            <Input id={`batch-registration-end-${index}`} type="datetime-local" value={batch.registration_ends_at} onChange={(event) => update(index, { registration_ends_at: event.target.value })} className="h-10 bg-background/70 border-input/60 text-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-start-${index}`} className="text-foreground">Mulai</Label>
            <Input id={`batch-start-${index}`} type="datetime-local" value={batch.starts_at} onChange={(event) => update(index, { starts_at: event.target.value })} className="h-10 bg-background/70 border-input/60 text-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-end-${index}`} className="text-foreground">Selesai</Label>
            <Input id={`batch-end-${index}`} type="datetime-local" value={batch.ends_at} onChange={(event) => update(index, { ends_at: event.target.value })} className="h-10 bg-background/70 border-input/60 text-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-capacity-${index}`} className="text-foreground">Kapasitas</Label>
            <Input id={`batch-capacity-${index}`} type="number" min="1" value={batch.capacity} onChange={(event) => update(index, { capacity: event.target.value })} className="h-10 bg-background/70 border-input/60 text-foreground" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`batch-price-${index}`} className="text-foreground">Harga override</Label>
            <Input id={`batch-price-${index}`} type="number" min="0" step="0.01" value={batch.price_override} onChange={(event) => update(index, { price_override: event.target.value })} className="h-10 bg-background/70 border-input/60 text-foreground" />
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={batch.allow_retakes} onChange={(event) => update(index, { allow_retakes: event.target.checked })} className="size-4 accent-primary" />
            Izinkan retake
          </label>
          <div className="flex items-end justify-end">
            <Button type="button" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 min-h-10 text-xs" onClick={() => setState((current) => ({ ...current, batches: current.batches.filter((_, batchIndex) => batchIndex !== index) }))}>
              <Trash2 className="mr-2 size-4" />{batch.id ? 'Hapus dari editor' : 'Hapus'}
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
