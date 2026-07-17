import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { Mentor } from '@/store/useLearningStore';

interface MentorFormProps {
  initialData?: Mentor | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function MentorForm({ initialData, onSubmit, onCancel, isLoading }: MentorFormProps) {
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(initialData?.user_id?.toString() || '');
  const [name, setName] = useState(initialData?.user?.name || '');
  const [email, setEmail] = useState(initialData?.user?.email || '');
  const [specialization, setSpecialization] = useState(initialData?.specialization || '');
  const [experienceYears, setExperienceYears] = useState(initialData?.experience_years ?? 0);
  const [bio, setBio] = useState(initialData?.bio || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await apiClient.admin.users.list({ limit: 10, page: 1, fields: 'id,name,email' });
        if (!active) return;

        if (!response.success) {
          return;
        }

        const responseData = response.data;
        const usersData = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

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
  }, []);

  useEffect(() => {
    if (!selectedUserId || users.length === 0) {
      return;
    }

    const user = users.find((item) => item.id.toString() === selectedUserId);
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [selectedUserId, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      specialization,
      experience_years: Number(experienceYears),
      bio,
      is_active: isActive,
    };

    if (selectedUserId) {
      payload.user_id = Number(selectedUserId);
    } else {
      payload.name = name;
      payload.email = email;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="mentor-name">Nama Lengkap</Label>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
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
                  {user.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
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
          readOnly={Boolean(selectedUserId)}
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
