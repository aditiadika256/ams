import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Program } from '@/types/sales';

interface ProgramFormProps {
  initialData?: Program | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function ProgramForm({ initialData, onSubmit, onCancel, isLoading }: ProgramFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [level, setLevel] = useState<Program['level']>(initialData?.level || 'umum');
  const [type, setType] = useState<Program['type']>(initialData?.type || 'tryout');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [active, setActive] = useState(initialData?.active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      level,
      type,
      price: Number(price),
      active,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="program-name">Nama Program</Label>
        <Input
          id="program-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Masukkan nama program"
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="program-level">Jenjang / Level</Label>
          <Select value={level} onValueChange={(val: any) => setLevel(val)}>
            <SelectTrigger id="program-level" className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10">
              <SelectValue placeholder="Pilih level" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-white/10">
              <SelectItem value="sd">SD</SelectItem>
              <SelectItem value="smp">SMP</SelectItem>
              <SelectItem value="sma">SMA</SelectItem>
              <SelectItem value="cpns">CPNS</SelectItem>
              <SelectItem value="umum">Umum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="program-type">Tipe Program</Label>
          <Select value={type} onValueChange={(val: any) => setType(val)}>
            <SelectTrigger id="program-type" className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10">
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-white/10">
              <SelectItem value="tryout">Tryout</SelectItem>
              <SelectItem value="bimbel">Bimbel</SelectItem>
              <SelectItem value="bootcamp">Bootcamp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="program-price">Harga (IDR)</Label>
        <Input
          id="program-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
          placeholder="0"
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      <div className="flex items-center gap-2 py-2">
        <input
          id="program-active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-input/50 bg-background/50 text-primary focus:ring-primary focus:ring-opacity-50 dark:border-white/10 dark:bg-white/5"
        />
        <Label htmlFor="program-active" className="cursor-pointer">Aktif / Publikasikan</Label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
        <Button type="button" variant="outline" onClick={onCancel} className="border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? 'Menyimpan...' : 'Simpan Program'}
        </Button>
      </div>
    </form>
  );
}
