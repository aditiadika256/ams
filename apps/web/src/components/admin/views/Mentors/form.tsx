import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { Mentor } from '@/store/useLearningStore';

interface MentorFormProps {
  initialData?: Mentor | null;
  onSubmit: (data: MentorFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface MentorCandidate {
  id: number;
  name: string;
  email: string;
  roles: Array<{ id: number; name: string }>;
}

interface MentorFormData {
  user_id?: number;
  specialization: string;
  experience_years: number;
  bio: string;
  is_active: boolean;
}

export function MentorForm({ initialData, onSubmit, onCancel, isLoading }: MentorFormProps) {
  const [users, setUsers] = useState<MentorCandidate[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(initialData?.user_id?.toString() || '');
  const [email, setEmail] = useState(initialData?.user?.email || '');
  const [specialization, setSpecialization] = useState(initialData?.specialization || '');
  const [experienceYears, setExperienceYears] = useState(initialData?.experience_years ?? 0);
  const [bio, setBio] = useState(initialData?.bio || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    if (initialData) {
      setIsLoadingUsers(false);
      return;
    }

    let active = true;

    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await apiClient.learning.mentors.candidates();
        if (!active) return;

        if (!response.success) {
          return;
        }

        const usersData = Array.isArray(response.data) ? response.data : [];

        setUsers(usersData);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        if (active) {
          setIsLoadingUsers(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, [initialData]);

  useEffect(() => {
    if (!selectedUserId || users.length === 0) {
      return;
    }

    const user = users.find((item) => item.id.toString() === selectedUserId);
    if (user) {
      setEmail(user.email);
    }
  }, [selectedUserId, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: MentorFormData = {
      specialization,
      experience_years: Number(experienceYears),
      bio,
      is_active: isActive,
    };

    if (!initialData && selectedUserId) {
      payload.user_id = Number(selectedUserId);
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="mentor-name">Nama Lengkap</Label>
        {initialData ? (
          <Input
            id="mentor-name"
            value={initialData.user?.name || ''}
            readOnly
            className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
          />
        ) : (
          <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={isLoadingUsers}>
            <SelectTrigger id="mentor-name" className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10">
              <SelectValue placeholder={isLoadingUsers ? 'Loading users...' : 'Pilih user'} />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-white/10">
              {isLoadingUsers ? (
                <SelectItem value="loading" disabled className="cursor-not-allowed opacity-50">
                  Memuat user...
                </SelectItem>
              ) : users.length === 0 ? (
                <SelectItem value="none" disabled className="cursor-default opacity-50">
                  Tidak ada user tersedia
                </SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} — {user.email}
                    {user.roles.length > 0 ? ` (${user.roles.map((role) => role.name).join(', ')})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mentor-email">Email</Label>
        <Input
          id="mentor-email"
          type="email"
          value={email}
          required
          placeholder="mentor@arkanin.id"
          readOnly
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
        <Button
          type="submit"
          disabled={isLoading || isLoadingUsers || (!initialData && !selectedUserId)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Mentor'}
        </Button>
      </div>
    </form>
  );
}
