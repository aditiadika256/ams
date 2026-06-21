import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mentor } from '@/store/useLearningStore';

interface MentorFormProps {
  initialData?: Mentor | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function MentorForm({ initialData, onSubmit, onCancel, isLoading }: MentorFormProps) {
  const [name, setName] = useState(initialData?.user?.name || '');
  const [email, setEmail] = useState(initialData?.user?.email || '');
  const [specialization, setSpecialization] = useState(initialData?.specialization || '');
  const [experienceYears, setExperienceYears] = useState(initialData?.experience_years ?? 0);
  const [bio, setBio] = useState(initialData?.bio || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      specialization,
      experience_years: Number(experienceYears),
      bio,
      is_active: isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="mentor-name">Nama Lengkap</Label>
        <Input
          id="mentor-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Masukkan nama lengkap"
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mentor-email">Email</Label>
        <Input
          id="mentor-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="mentor@arkanin.id"
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Spesialisasi</Label>
        <Input
          id="specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          required
          placeholder="Contoh: Frontend Development, UI/UX"
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Pengalaman (Tahun)</Label>
        <Input
          id="experience"
          type="number"
          value={experienceYears}
          onChange={(e) => setExperienceYears(Number(e.target.value))}
          required
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio / Deskripsi</Label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Ceritakan sedikit tentang mentor..."
          className="w-full p-2.5 rounded-md border border-input/50 bg-background/50 text-foreground text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5"
        />
      </div>

      <div className="flex items-center gap-2 py-2">
        <input
          id="is_active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-input/50 bg-background/50 text-primary focus:ring-primary focus:ring-opacity-50 dark:border-white/10 dark:bg-white/5"
        />
        <Label htmlFor="is_active" className="cursor-pointer">Status Aktif</Label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
        <Button type="button" variant="outline" onClick={onCancel} className="border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? 'Menyimpan...' : 'Simpan Mentor'}
        </Button>
      </div>
    </form>
  );
}
