'use client';

import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Plus, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RoleForm } from './form';
import { alertActions } from '@/store/useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';

type Role = {
  id: number;
  name: string;
  guard_name?: string;
  permissions: { id?: number; name: string }[];
};

type Permission = {
  id: number;
  name: string;
  guard_name?: string;
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
  const [selectedRolePerms, setSelectedRolePerms] = React.useState<Set<string>>(new Set());
  const [activeGuard, setActiveGuard] = React.useState<string>('web');
  const [isAddRoleOpen, setIsAddRoleOpen] = React.useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiClient.admin.roles.list(),
        apiClient.admin.roles.permissions.list(),
      ]);
      setRoles((rolesRes.data || []) as Role[]);
      setPermissions((permsRes.data || []) as Permission[]);
      const loadedRoles = (rolesRes.data || []) as Role[];
      if (!selectedRoleId && loadedRoles.length > 0) {
        const guardRoles = loadedRoles.filter(r => (r.guard_name || 'web') === activeGuard);
        setSelectedRoleId(guardRoles.length > 0 ? guardRoles[0].id : loadedRoles[0].id);
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

  React.useEffect(() => {
    if (selectedRole) {
      setSelectedRolePerms(new Set(selectedRole.permissions.map(p => p.name)));
    } else {
      setSelectedRolePerms(new Set());
    }
  }, [selectedRole]);

  const roleHasPermission = (permName: string) => {
    return selectedRolePerms.has(permName);
  };

  const togglePermission = (permName: string) => {
    const next = new Set(selectedRolePerms);
    if (next.has(permName)) {
      next.delete(permName);
    } else {
      next.add(permName);
    }
    setSelectedRolePerms(next);
  };

  const toggleAllGroup = (groupPerms: Permission[]) => {
    const next = new Set(selectedRolePerms);
    const allSelected = groupPerms.every(p => next.has(p.name));

    groupPerms.forEach(p => {
      if (allSelected) {
        next.delete(p.name);
      } else {
        next.add(p.name);
      }
    });
    setSelectedRolePerms(next);
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      const payload = {
        permissions: Array.from(selectedRolePerms),
      };
      await apiClient.admin.roles.update(selectedRole.id, payload);
      await loadData();
      alertActions.success(
        'Permission berhasil diperbarui',
        `Hak akses role ${selectedRole.name} berhasil disimpan.`
      );
    } catch (error) {
      alertActions.error(
        'Gagal memperbarui permission',
        getErrorMessage(error, `Hak akses role ${selectedRole.name} gagal disimpan.`)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) {
      alertActions.error('Nama role diperlukan', 'Masukkan nama role sebelum menyimpan.');
      return;
    }
    const roleName = newRoleName.trim();
    setIsLoading(true);
    try {
      await apiClient.admin.roles.create({ name: roleName });
      setNewRoleName('');
      setIsAddRoleOpen(false);
      await loadData();
      alertActions.success('Role berhasil ditambahkan', `Role ${roleName} berhasil dibuat.`);
    } catch (error) {
      alertActions.error(
        'Gagal menambahkan role',
        getErrorMessage(error, `Role ${roleName} gagal dibuat.`)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (permName: string) => {
    if (permName.includes('dashboard')) return 'Dashboard';
    if (permName.includes('user')) return 'Users';
    if (permName.includes('branch') && !permName.includes('dashboard')) return 'Branches';
    if (permName.includes('activit')) return 'Activities';
    if (permName.includes('setting')) return 'Settings';
    if (permName.includes('menu')) return 'Menus';
    if (permName.includes('role')) return 'Roles';
    if (permName.includes('permission')) return 'Permissions';
    if (permName.includes('finance')) return 'Finance';
    if (permName.includes('student') || permName.includes('learning')) return 'Learning';
    if (permName.includes('profile')) return 'Profile';
    return 'General';
  };

  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    const filteredPerms = permissions.filter(p => (p.guard_name || 'web') === activeGuard);
    filteredPerms.forEach(p => {
      const cat = getCategoryName(p.name);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [permissions, activeGuard]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Roles & Permissions</h2>
          <p className="text-muted-foreground">Manage user access levels and system permissions.</p>
        </div>
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0  shadow-lg">
              <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Tambah Role Baru</span></Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <RoleForm 
              newRoleName={newRoleName}
              setNewRoleName={setNewRoleName}
              createRole={createRole}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="md:col-span-1">
          <GlassCard className="h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5" />
          <GlassCardHeader className="relative z-10 flex flex-row items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
            <GlassCardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Daftar Role
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="p-0 relative z-10">
            <Tabs value={activeGuard} onValueChange={(val) => {
              setActiveGuard(val);
              const guardRoles = roles.filter(r => (r.guard_name || 'web') === val);
              if (guardRoles.length > 0) setSelectedRoleId(guardRoles[0].id);
              else setSelectedRoleId(null);
            }} className="w-full flex flex-col h-full">
              <div className="px-6 pt-4">
                <TabsList className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <TabsTrigger value="web" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10">Akses Web</TabsTrigger>
                  <TabsTrigger value="sanctum" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10">Akses API</TabsTrigger>
                </TabsList>
              </div>

              <div className="space-y-2 mt-4 px-6 pb-6 max-h-[60vh] overflow-y-auto">
                {roles.filter(r => (r.guard_name || 'web') === activeGuard).map((r) => (
                  <Button
                    key={r.id}
                    variant={selectedRoleId === r.id ? 'default' : 'outline'}
                    className={`w-full justify-start transition-all duration-200 ${selectedRoleId === r.id
                      ? 'bg-primary/10 dark:bg-primary/20 hover:bg-blue-200 dark:hover:bg-primary/30 text-primary dark:text-primary-foreground border-primary/30 dark:border-primary/50'
                      : 'bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    onClick={() => setSelectedRoleId(r.id)}
                  >
                    <Shield className={`mr-2 h-4 w-4 ${selectedRoleId === r.id ? 'text-primary dark:text-primary' : 'text-muted-foreground'}`} />
                    {r.name}
                  </Button>
                ))}
                {roles.filter(r => (r.guard_name || 'web') === activeGuard).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">No roles found for this platform.</div>
                )}
              </div>
            </Tabs>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants} className="md:col-span-2">
        <GlassCard className="h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <GlassCardHeader className="relative z-10">
            <GlassCardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
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
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div>
                    <div className="text-sm text-muted-foreground">Selected Role</div>
                    <div className="text-lg font-semibold text-primary dark:text-primary-foreground">{selectedRole.name}</div>
                  </div>
                  <Shield className="h-8 w-8 text-purple-200 dark:text-primary/20" />
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, perms]) => {
                    const groupSelectedCount = perms.filter(p => roleHasPermission(p.name)).length;
                    const isAllSelected = groupSelectedCount === perms.length;

                    return (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-primary dark:text-primary-foreground">{category}</h3>
                            <Badge variant="outline" className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10">
                              {groupSelectedCount} / {perms.length}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAllGroup(perms)}
                            className="text-xs text-muted-foreground hover:text-slate-800 dark:hover:text-white"
                          >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {perms.map((p) => {
                            const checked = roleHasPermission(p.name);
                            return (
                              <motion.label
                                key={p.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${checked
                                  ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/50 text-primary dark:text-primary-foreground shadow-[0_0_10px_rgba(168,85,247,0.05)] dark:shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                                  : 'bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/10 text-muted-foreground'
                                  }`}
                              >
                                <div className={`flex items-center justify-center w-5 h-5 rounded border ${checked ? 'bg-primary border-primary' : 'border-slate-300 dark:border-white/30'
                                  }`}>
                                  {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
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
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
                  <Button
                    variant="outline"
                    onClick={loadData}
                    className="border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Reset</span></Button>
                  <Button
                    onClick={savePermissions}
                    disabled={isLoading}
                    className="bg-primary/10 dark:bg-primary/20 hover:bg-purple-200 dark:hover:bg-primary/40 text-primary dark:text-primary-foreground border border-primary/30 dark:border-primary/30"
                  >
                    <Save className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Save Changes</span></Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground space-y-4">
                <Shield className="h-16 w-16 text-slate-200 dark:text-white/10" />
                <p>Select a role to manage permissions</p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </motion.div>
      </div>
    </motion.div>
  );
}
