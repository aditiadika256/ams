'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Shield, User } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/loaders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';
import { PaginationControls } from '@/components/ui/pagination-controls';

// Types based on backend data
interface Role {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  branch: Branch | null;
  status?: string; // Not from DB currently
}

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserForm } from './form';

export default function UsersView() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Pagination and search state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const fetchUsers = async (currentPage = 1, searchQuery = '') => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.admin.users.list({ 
        page: currentPage, 
        search: searchQuery 
      });
      
      const paginatedData = response.data;
      if (paginatedData && Array.isArray(paginatedData.data)) {
        setUsers(paginatedData.data);
        setTotalPages(paginatedData.last_page || 1);
        setTotalUsers(paginatedData.total || 0);
        setPerPage(paginatedData.per_page || 15);
      } else {
        setUsers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(page, search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      if (selectedUser) {
        await apiClient.admin.users.update(selectedUser.id, data);
      } else {
        await apiClient.admin.users.create(data);
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchUsers(page, search);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menyimpan user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        await apiClient.admin.users.remove(id);
        fetchUsers(page, search);
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Gagal menghapus user');
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage users, roles, and branch assignments.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
          <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Add New User</span></Button>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>All Users</GlassCardTitle>
              <div className="flex items-center gap-2">
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    value={search}
                    onChange={handleSearch}
                    className="pl-8 w-[200px] lg:w-[300px] bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
                  />
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isLoading ? (
               <div className="py-8 text-center text-muted-foreground"><Spinner className="mx-auto mb-2" />Loading users...</div>
            ) : error ? (
               <div className="py-8 text-center text-red-400">{error}</div>
            ) : users.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">No users found.</div>
            ) : (
               <div className={viewMode === 'list' ? "overflow-x-auto" : ""}>
                 {viewMode === 'list' ? (
                   <table className="w-full text-sm text-left">
                     <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                       <tr>
                         <th className="px-4 py-3 font-medium">Name</th>
                         <th className="px-4 py-3 font-medium">Role</th>
                         <th className="px-4 py-3 font-medium">Status</th>
                         <th className="px-4 py-3 font-medium">Branch</th>
                         <th className="px-4 py-3 font-medium text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {users.map((user) => {
                         const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'User';
                         const userStatus = user.status || 'Active'; // Mock status if not returned
                         const userBranch = user.branch?.name || '-';
 
                         return (
                           <motion.tr 
                             key={user.id} 
                             className="hover:bg-white/5 transition-colors"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ duration: 0.3 }}
                           >
                             <td className="px-4 py-3">
                               <div className="flex items-center gap-3">
                                 <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-white/10">
                                   {user.name.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                   <div className="font-medium text-foreground">{user.name}</div>
                                   <div className="text-xs text-muted-foreground">{user.email}</div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-4 py-3">
                               <div className="flex items-center gap-2">
                                 {userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'superadmin' ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3" />}
                                 <span className="capitalize">{userRole.replace('_', ' ')}</span>
                               </div>
                             </td>
                             <td className="px-4 py-3">
                               <Badge variant={userStatus === 'Active' ? 'default' : 'secondary'} className={userStatus === 'Active' ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                                 {userStatus}
                               </Badge>
                             </td>
                             <td className="px-4 py-3 text-muted-foreground">
                               {userBranch}
                             </td>
                             <td className="px-4 py-3 text-right">
                               <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-white/5">
                                     <MoreHorizontal className="h-4 w-4" />
                                   </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                   <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                   <DropdownMenuItem onClick={() => handleOpenEdit(user)} className="cursor-pointer">
                                     <Edit className="mr-2 h-4 w-4" /> Edit
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive cursor-pointer">
                                     <Trash2 className="mr-2 h-4 w-4" /> Delete
                                   </DropdownMenuItem>
                                 </DropdownMenuContent>
                               </DropdownMenu>
                             </td>
                           </motion.tr>
                         );
                       })}
                     </tbody>
                   </table>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                     {users.map((user) => {
                       const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'User';
                       const userStatus = user.status || 'Active'; // Mock status if not returned
                       const userBranch = user.branch?.name || '-';
 
                       return (
                         <motion.div 
                           key={user.id} 
                           className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col hover:bg-white/10 transition-colors"
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ duration: 0.3 }}
                         >
                           <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-white/10">
                                 {user.name.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                 <h3 className="font-semibold text-base line-clamp-1">{user.name}</h3>
                                 <p className="text-xs text-muted-foreground line-clamp-1">{user.email}</p>
                               </div>
                             </div>
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-white/5 shrink-0">
                                   <MoreHorizontal className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                 <DropdownMenuItem onClick={() => handleOpenEdit(user)} className="cursor-pointer">
                                   <Edit className="mr-2 h-4 w-4" /> Edit
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator />
                                 <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive cursor-pointer">
                                   <Trash2 className="mr-2 h-4 w-4" /> Delete
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                           </div>
                           
                           <div className="flex gap-2 mb-4">
                             <Badge variant="outline" className="border-white/20 bg-white/5 text-xs flex items-center gap-1">
                               {userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'superadmin' ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3" />}
                               <span className="capitalize">{userRole.replace('_', ' ')}</span>
                             </Badge>
                             {userBranch !== '-' && <Badge variant="outline" className="border-white/20 bg-white/5 text-xs">{userBranch}</Badge>}
                           </div>
                           
                           <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5">
                             <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                             <Badge variant={userStatus === 'Active' ? 'default' : 'secondary'} className={userStatus === 'Active' ? "bg-green-500/20 text-green-400" : "text-xs"}>
                               {userStatus}
                             </Badge>
                           </div>
                         </motion.div>
                       );
                     })}
                   </div>
                 )}
               </div>
            )}
            <PaginationControls
              currentPage={page}
              lastPage={totalPages}
              total={totalUsers}
              from={totalUsers > 0 ? (page - 1) * perPage + 1 : 0}
              to={totalUsers > 0 ? Math.min(page * perPage, totalUsers) : 0}
              onPageChange={setPage}
              itemLabel="users"
              isLoading={isLoading}
            />
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
          </DialogHeader>
          <UserForm 
            initialData={selectedUser}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
