'use client';

import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Shield, Lock, Plus, Save, RotateCcw } from 'lucide-react';

type Role = {
  id: number;
  name: string;
  permissions: { id?: number; name: string }[];
};

type Permission = {
  id: number;
  name: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <motion.div variants={itemVariants} className="md:col-span-1">
        <GlassCard className="h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5" />
          <GlassCardHeader className="relative z-10">
            <GlassCardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Roles
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-6 relative z-10">
            <div className="space-y-2">
              {roles.map((r) => (
                <Button
                  key={r.id}
                  variant={selectedRoleId === r.id ? 'default' : 'outline'}
                  className={`w-full justify-start transition-all duration-200 ${
                    selectedRoleId === r.id 
                      ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-500/50' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedRoleId(r.id)}
                >
                  <Shield className={`mr-2 h-4 w-4 ${selectedRoleId === r.id ? 'text-blue-400' : 'text-muted-foreground'}`} />
                  {r.name}
                </Button>
              ))}
            </div>
            
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="space-y-2">
                <Label>New Role</Label>
                <Input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Role Name"
                  className="bg-white/5 border-white/10 focus:border-blue-500/50"
                />
              </div>
              <Button 
                onClick={createRole} 
                disabled={isLoading || !newRoleName.trim()}
                className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-100 border border-blue-500/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants} className="md:col-span-2">
        <GlassCard className="h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5" />
          <GlassCardHeader className="relative z-10">
            <GlassCardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-400" />
              Permissions Management
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Loading...
              </div>
            ) : selectedRole ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <div className="text-sm text-muted-foreground">Selected Role</div>
                    <div className="text-lg font-semibold text-purple-100">{selectedRole.name}</div>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500/20" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((p) => {
                    const checked = roleHasPermission(p.name);
                    return (
                      <motion.label 
                        key={p.id} 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          checked 
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-100' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-5 h-5 rounded border ${
                          checked ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                        }`}>
                          {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={() => togglePermission(p.name)}
                        />
                        <span className="text-sm font-medium">{p.name}</span>
                      </motion.label>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <Button 
                    variant="outline" 
                    onClick={loadData}
                    className="border-white/10 hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button 
                    onClick={savePermissions} 
                    disabled={isLoading}
                    className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-100 border border-purple-500/30"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground space-y-4">
                <Shield className="h-16 w-16 text-white/10" />
                <p>Select a role to manage permissions</p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
