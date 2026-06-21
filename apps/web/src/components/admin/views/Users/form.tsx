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

interface UserFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function UserForm({ initialData, onSubmit, onCancel, isLoading }: UserFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialData?.roles && initialData.roles.length > 0 ? initialData.roles[0].name : 'user');
  const [branchId, setBranchId] = useState<string>(initialData?.branch?.id?.toString() || 'none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name,
      email,
      role,
      branch_id: branchId === 'none' ? null : Number(branchId)
    };
    if (password) {
      payload.password = password;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="user-name">Nama Lengkap</Label>
        <Input
          id="user-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Masukkan nama lengkap"
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="user@arkanin.id"
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="user-password">Password</Label>
          <Input
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!initialData}
            placeholder="••••••••"
            className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="user-role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="user-role" className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10">
              <SelectValue placeholder="Pilih Role" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-white/10">
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-branch">Cabang / Branch</Label>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger id="user-branch" className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10">
              <SelectValue placeholder="Pilih Cabang" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-white/10">
              <SelectItem value="none">Tidak Ada</SelectItem>
              <SelectItem value="1">Cabang Utama</SelectItem>
              <SelectItem value="2">Cabang Pembantu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
        <Button type="button" variant="outline" onClick={onCancel} className="border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? 'Menyimpan...' : 'Simpan User'}
        </Button>
      </div>
    </form>
  );
}
