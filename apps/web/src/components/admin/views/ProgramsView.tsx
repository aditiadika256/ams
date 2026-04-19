'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Search, Plus, MoreHorizontal, Edit, Trash2, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';

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

export default function ProgramsView() {
  const { programs, fetchPrograms, isLoading, error } = useSalesStore();
  const { addTab } = useAdminStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    console.log('[ProgramsView] Fetching programs...');
    fetchPrograms({});
  }, []);  // Empty deps - run only once

  const filteredPrograms = programs.filter(program => 
    program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Programs</h2>
          <p className="text-muted-foreground">Manage training programs, courses, and curriculum.</p>
        </div>
        <Button className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
          <Plus className="mr-2 h-4 w-4" /> Add New Program
        </Button>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm border border-destructive/20 backdrop-blur-sm">
          {error}
        </motion.div>
      )}
      
      <motion.div variants={itemVariants}>
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>All Programs</GlassCardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search programs..."
                    className="pl-8 w-[200px] lg:w-[300px] bg-white/5 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isLoading ? (
               <div className="py-8 text-center text-muted-foreground">Loading programs...</div>
            ) : filteredPrograms.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">No programs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-medium">Program Name</th>
                      <th className="px-4 py-3 font-medium">Level</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPrograms.map((program) => (
                      <motion.tr 
                        key={program.id} 
                        className="hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-primary border border-white/10">
                              <BookOpen className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{program.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="border-white/20 bg-white/5">{program.level}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize">{program.type}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(program.price)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={program.active ? 'default' : 'secondary'} className={program.active ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                            {program.active ? 'Active' : 'Draft'}
                          </Badge>
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
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => addTab({ 
                                title: `Curriculum: ${program.name}`, 
                                view: 'curriculum-builder', 
                                data: { programId: program.id, programName: program.name } 
                              })} className="focus:bg-white/10">
                                 <Layers className="mr-2 h-4 w-4" /> Manage Curriculum
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
            )}
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
