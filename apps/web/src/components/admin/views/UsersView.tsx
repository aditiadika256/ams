'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', branch: 'Head Office' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Manager', status: 'Active', branch: 'Jakarta Branch' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Inactive', branch: 'Bandung Branch' },
  { id: 4, name: 'David Lee', email: 'david@example.com', role: 'User', status: 'Active', branch: 'Surabaya Branch' },
  { id: 5, name: 'Eve Wilson', email: 'eve@example.com', role: 'Manager', status: 'Active', branch: 'Bali Branch' },
];

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

export default function UsersView() {
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
        <Button className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0">
          <Plus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>All Users</GlassCardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 w-[200px] lg:w-[300px] bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="overflow-x-auto">
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
                  {users.map((user) => (
                    <motion.tr 
                      key={user.id} 
                      className="hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-primary font-medium border border-white/10">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {user.role === 'Admin' ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3" />}
                          <span>{user.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className={user.status === 'Active' ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.branch}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-xl border-white/10">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="focus:bg-white/10">
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/20">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
               <div>Showing 1-5 of 20 users</div>
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" disabled className="bg-transparent border-white/10">Previous</Button>
                 <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5">Next</Button>
               </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
