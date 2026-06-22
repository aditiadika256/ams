import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export interface RoleFormProps {
  newRoleName: string;
  setNewRoleName: (name: string) => void;
  createRole: () => void;
  isLoading: boolean;
}

export function RoleForm({ newRoleName, setNewRoleName, createRole, isLoading }: RoleFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Role Name</Label>
        <Input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="e.g. supervisor"
          className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10"
        />
      </div>
      <Button
        onClick={createRole}
        disabled={isLoading || !newRoleName.trim()}
        className="w-full bg-primary/10 dark:bg-primary/20 hover:bg-blue-200 dark:hover:bg-primary/40 text-primary dark:text-primary-foreground border border-primary/30 dark:border-primary/30"
      >
        Create Role
      </Button>
    </div>
  );
}
