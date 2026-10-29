'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Search, Plus, MoreHorizontal, Edit, Trash2, GraduationCap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLearningStore } from '@/store/useLearningStore';
import { useAuthStore } from '@/store/useAuthStore';
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
import { MentorForm } from './form';

export default function MentorsView() {
  const { mentors, fetchMentors, createMentor, updateMentor, deleteMentor, isLoading, error } = useLearningStore();
  const canManageMentors = useAuthStore((state) => state.hasPermission('manage_learning_content'));
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [page, setPage] = React.useState(1);
  const perPage = 6;
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedMentor, setSelectedMentor] = React.useState<any>(null);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchMentors();
  }, [fetchMentors]);

  const filteredMentors = mentors.filter(mentor => 
    (mentor.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mentor.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const paginatedMentors = filteredMentors.slice((page - 1) * perPage, page * perPage);

  const handleOpenAdd = () => {
    setSelectedMentor(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mentor: any) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedMentor) {
        await updateMentor(selectedMentor.id, data);
      } else {
        await createMentor(data);
      }
      setIsModalOpen(false);
      setSelectedMentor(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menonaktifkan/menghapus mentor ini?')) {
      try {
        await deleteMentor(id);
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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Mentors</h2>
          <p className="text-muted-foreground">Manage mentor profiles, schedules, and assignments.</p>
        </div>
        {canManageMentors && (
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium">
            <Plus className="h-4 w-4 mr-2" />
            <span>Add New Mentor</span>
          </Button>
        )}
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="bg-destructive/15 text-destructive px-4 py-3 rounded-xl text-sm border border-destructive/20 backdrop-blur-sm">
          {error}
        </motion.div>
      )}
      
      <motion.div variants={itemVariants}>
        <GlassCard>
          <GlassCardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <GlassCardTitle>All Mentors</GlassCardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search mentors..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px] h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isLoading && mentors.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">Loading mentors...</div>
            ) : filteredMentors.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">No mentors found.</div>
            ) : (
               <div className={viewMode === 'list' ? "overflow-x-auto" : ""}>
                 {viewMode === 'list' ? (
                   <table className="w-full text-sm text-left">
                     <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border/60">
                       <tr>
                         <th className="px-4 py-3 font-medium">Name</th>
                         <th className="px-4 py-3 font-medium">Specialization</th>
                         <th className="px-4 py-3 font-medium">Experience</th>
                         <th className="px-4 py-3 font-medium">Status</th>
                         <th className="px-4 py-3 font-medium text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border/40">
                       {paginatedMentors.map((mentor) => (
                         <motion.tr 
                           key={mentor.id} 
                           className="hover:bg-muted/30 transition-colors"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ duration: 0.3 }}
                         >
                           <td className="px-4 py-3">
                             <div className="flex items-center gap-3">
                               <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-border/60">
                                 {mentor.user?.name ? mentor.user.name.charAt(0) : 'M'}
                               </div>
                               <div>
                                 <div className="font-medium text-foreground">{mentor.user?.name || 'Unknown User'}</div>
                                 <div className="text-xs text-muted-foreground">{mentor.user?.email || 'No Email'}</div>
                               </div>
                             </div>
                           </td>
                           <td className="px-4 py-3">
                             <div className="flex items-center gap-2">
                               <GraduationCap className="h-3 w-3 text-muted-foreground" />
                               <span className="text-foreground">{mentor.specialization}</span>
                             </div>
                           </td>
                           <td className="px-4 py-3">
                             <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-foreground">{mentor.experience_years} Years</span>
                             </div>
                           </td>
                           <td className="px-4 py-3">
                             <Badge variant={mentor.is_active ? 'default' : 'secondary'} className={mentor.is_active ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : ""}>
                               {mentor.is_active ? 'Active' : 'Inactive'}
                             </Badge>
                           </td>
                           <td className="px-4 py-3 text-right">
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                   <MoreHorizontal className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="bg-card/95 border-border/60">
                                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                 {canManageMentors && (
                                   <DropdownMenuItem onClick={() => handleOpenEdit(mentor)} className="cursor-pointer">
                                     <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                   </DropdownMenuItem>
                                 )}
                                 <DropdownMenuItem className="cursor-pointer">
                                    <Clock className="mr-2 h-4 w-4" /> Manage Schedule
                                 </DropdownMenuItem>
                                 {canManageMentors && (
                                   <>
                                     <DropdownMenuSeparator className="bg-border/60" />
                                     <DropdownMenuItem onClick={() => handleDelete(mentor.id)} className="text-destructive cursor-pointer">
                                       <Trash2 className="mr-2 h-4 w-4" /> Delete / Deactivate
                                     </DropdownMenuItem>
                                   </>
                                 )}
                               </DropdownMenuContent>
                             </DropdownMenu>
                           </td>
                         </motion.tr>
                       ))}
                     </tbody>
                   </table>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {paginatedMentors.map((mentor) => (
                       <motion.div 
                         key={mentor.id} 
                         className="bg-card/80 border border-border/60 rounded-2xl p-4 flex flex-col hover:bg-muted/30 transition-colors shadow-sm"
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ duration: 0.3 }}
                       >
                         <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-border/60">
                               {mentor.user?.name ? mentor.user.name.charAt(0) : 'M'}
                             </div>
                             <div>
                               <h3 className="font-semibold text-base text-foreground line-clamp-1">{mentor.user?.name || 'Unknown User'}</h3>
                               <p className="text-xs text-muted-foreground line-clamp-1">{mentor.user?.email || 'No Email'}</p>
                             </div>
                           </div>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted shrink-0 text-muted-foreground hover:text-foreground">
                                 <MoreHorizontal className="h-4 w-4" />
                               </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/60">
                               <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               {canManageMentors && (
                                 <DropdownMenuItem onClick={() => handleOpenEdit(mentor)} className="cursor-pointer">
                                   <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                 </DropdownMenuItem>
                               )}
                               <DropdownMenuItem className="cursor-pointer">
                                  <Clock className="mr-2 h-4 w-4" /> Manage Schedule
                               </DropdownMenuItem>
                               {canManageMentors && (
                                 <>
                                   <DropdownMenuSeparator className="bg-border/60" />
                                   <DropdownMenuItem onClick={() => handleDelete(mentor.id)} className="text-destructive focus:bg-destructive/20 cursor-pointer">
                                     <Trash2 className="mr-2 h-4 w-4" /> Delete / Deactivate
                                   </DropdownMenuItem>
                                 </>
                               )}
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </div>
                         
                         <div className="flex gap-2 mb-4">
                           <Badge variant="outline" className="border-border/60 bg-muted/40 text-xs flex items-center gap-1 text-foreground">
                             <GraduationCap className="h-3 w-3 text-muted-foreground" />
                             <span className="truncate max-w-[120px]">{mentor.specialization}</span>
                           </Badge>
                           <Badge variant="outline" className="border-border/60 bg-muted/40 text-xs flex items-center gap-1 text-foreground">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{mentor.experience_years} Yrs</span>
                           </Badge>
                         </div>
                         
                         <div className="mt-auto pt-4 flex justify-between items-center border-t border-border/40">
                           <div className="text-xs text-muted-foreground">ID: {mentor.id}</div>
                           <Badge variant={mentor.is_active ? 'default' : 'secondary'} className={mentor.is_active ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : "text-xs"}>
                             {mentor.is_active ? 'Active' : 'Inactive'}
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
              lastPage={Math.ceil(filteredMentors.length / perPage) || 1}
              total={filteredMentors.length}
              from={filteredMentors.length > 0 ? (page - 1) * perPage + 1 : 0}
              to={filteredMentors.length > 0 ? Math.min(page * perPage, filteredMentors.length) : 0}
              onPageChange={setPage}
              itemLabel="mentors"
              isLoading={isLoading}
            />
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg border border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedMentor ? 'Edit Mentor' : 'Tambah Mentor Baru'}</DialogTitle>
          </DialogHeader>
          <MentorForm 
            initialData={selectedMentor}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
