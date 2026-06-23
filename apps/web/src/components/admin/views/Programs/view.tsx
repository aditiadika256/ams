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
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';
import { PaginationControls } from '@/components/ui/pagination-controls';

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
import { ProgramForm } from './form';

export default function ProgramsView() {
  const { programs, fetchPrograms, createProgram, updateProgram, deleteProgram, isLoading, error } = useSalesStore();
  const { addTab } = useAdminStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [page, setPage] = React.useState(1);
  const perPage = 6;
  const fetchedRef = useRef(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState<any>(null);

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

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const paginatedPrograms = filteredPrograms.slice((page - 1) * perPage, page * perPage);

  const handleOpenAdd = () => {
    setSelectedProgram(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (program: any) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedProgram) {
        await updateProgram(selectedProgram.id, data);
      } else {
        await createProgram(data);
      }
      setIsModalOpen(false);
      setSelectedProgram(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      try {
        await deleteProgram(id);
      } catch (err) {
        console.error(err);
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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Programs</h2>
          <p className="text-muted-foreground">Manage training programs, courses, and curriculum.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
          <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Add New Program</span></Button>
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
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search programs..."
                    className="pl-8 w-[200px] lg:w-[300px] bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isLoading && programs.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">Loading programs...</div>
            ) : filteredPrograms.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">No programs found.</div>
            ) : (
               <div className={viewMode === 'list' ? "overflow-x-auto" : ""}>
                 {viewMode === 'list' ? (
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
                      {paginatedPrograms.map((program) => (
                        <motion.tr 
                          key={program.id} 
                          className="hover:bg-white/5 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-white/10">
                                <BookOpen className="h-4 w-4 text-primary" />
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
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-white/5">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleOpenEdit(program)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addTab({ 
                                  title: `Curriculum: ${program.name}`, 
                                  view: 'curriculum-builder', 
                                  data: { programId: program.id, programName: program.name } 
                                })}>
                                    <Layers className="mr-2 h-4 w-4" /> Manage Curriculum
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(program.id)} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                 ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedPrograms.map((program) => (
                      <motion.div 
                        key={program.id} 
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-white/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-white/5">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenEdit(program)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => addTab({ 
                                title: `Curriculum: ${program.name}`, 
                                view: 'curriculum-builder', 
                                data: { programId: program.id, programName: program.name } 
                              })}>
                                  <Layers className="mr-2 h-4 w-4" /> Manage Curriculum
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(program.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{program.name}</h3>
                        <div className="flex gap-2 mb-4">
                          <Badge variant="outline" className="border-white/20 bg-white/5 text-xs">{program.level}</Badge>
                          <span className="text-xs text-muted-foreground capitalize flex items-center">{program.type}</span>
                        </div>
                        <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5">
                          <div className="font-medium text-sm">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(program.price)}
                          </div>
                          <Badge variant={program.active ? 'default' : 'secondary'} className={program.active ? "bg-green-500/20 text-green-400" : "text-xs"}>
                            {program.active ? 'Active' : 'Draft'}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                 )}
               </div>
            )}
            <PaginationControls
              currentPage={page}
              lastPage={Math.ceil(filteredPrograms.length / perPage) || 1}
              total={filteredPrograms.length}
              from={filteredPrograms.length > 0 ? (page - 1) * perPage + 1 : 0}
              to={filteredPrograms.length > 0 ? Math.min(page * perPage, filteredPrograms.length) : 0}
              onPageChange={setPage}
              itemLabel="programs"
              isLoading={isLoading}
            />
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedProgram ? 'Edit Program' : 'Tambah Program Baru'}</DialogTitle>
          </DialogHeader>
          <ProgramForm 
            initialData={selectedProgram}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
