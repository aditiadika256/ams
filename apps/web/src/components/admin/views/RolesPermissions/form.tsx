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
    <div className="space-y-4 py-3">
      <div className="space-y-2">
        <Label htmlFor="role-name-input">Role Name</Label>
        <Input
          id="role-name-input"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="e.g. supervisor"
          className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <Button
        onClick={createRole}
        disabled={isLoading || !newRoleName.trim()}
        className="w-full min-h-11 sm:min-h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
      >
        {isLoading ? 'Creating Role...' : 'Create Role'}
      </Button>
    </div>
  );
}
