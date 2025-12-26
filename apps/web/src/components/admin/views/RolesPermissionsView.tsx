'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';

type Role = {
  id: number;
  name: string;
  permissions: { id?: number; name: string }[];
};

type Permission = {
  id: number;
  name: string;
};

export default function RolesPermissionsView() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = React.useState<number | null>(null);
  const [newRoleName, setNewRoleName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiClient.admin.roles.list(),
        apiClient.admin.roles.permissions.list(),
      ]);
      setRoles((rolesRes.data || []) as Role[]);
      setPermissions((permsRes.data || []) as Permission[]);
      if (!selectedRoleId && rolesRes.data && (rolesRes.data as any[]).length > 0) {
        setSelectedRoleId((rolesRes.data as any[])[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRole = React.useMemo(
    () => roles.find(r => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const roleHasPermission = (permName: string) => {
    if (!selectedRole) return false;
    return selectedRole.permissions?.some(p => p.name === permName) || false;
  };

  const togglePermission = (permName: string) => {
    if (!selectedRole) return;
    const next = roles.map(r => {
      if (r.id !== selectedRole.id) return r;
      const has = r.permissions.some(p => p.name === permName);
      return {
        ...r,
        permissions: has
          ? r.permissions.filter(p => p.name !== permName)
          : [...r.permissions, { name: permName }],
      };
    });
    setRoles(next);
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      const payload = {
        permissions: selectedRole.permissions.map(p => p.name),
      };
      await apiClient.admin.roles.update(selectedRole.id, payload);
      await loadData();
    } finally {
      setIsLoading(false);
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    setIsLoading(true);
    try {
      await apiClient.admin.roles.create({ name: newRoleName.trim() });
      setNewRoleName('');
      await loadData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {roles.map((r) => (
              <Button
                key={r.id}
                variant={selectedRoleId === r.id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedRoleId(r.id)}
              >
                {r.name}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label>Nama</Label>
            <Input
              className="col-span-2"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Role baru"
            />
          </div>
          <Button onClick={createRole} disabled={isLoading || !newRoleName.trim()}>
            Tambah Role
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Memuat...</div>
          ) : selectedRole ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Role: {selectedRole.name}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {permissions.map((p) => {
                  const checked = roleHasPermission(p.name);
                  return (
                    <label key={p.id} className="flex items-center gap-2 p-2 rounded-md border">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(p.name)}
                      />
                      <span className="text-sm">{p.name}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={loadData}>Reset</Button>
                <Button onClick={savePermissions} disabled={isLoading}>Simpan</Button>
              </div>
            </div>
          ) : (
            <div>Pilih role untuk mengelola permissions.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
