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
  const [searchQuery, setSearchQuery] = React.useState('');
  
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
        <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
          <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Add New Mentor</span></Button>
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
              <GlassCardTitle>All Mentors</GlassCardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search mentors..."
                    className="pl-8 w-[200px] lg:w-[300px] bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
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
               <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Specialization</th>
                      <th className="px-4 py-3 font-medium">Experience</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMentors.map((mentor) => (
                      <motion.tr 
                        key={mentor.id} 
                        className="hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-white/10">
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
                            <span>{mentor.specialization}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                             <Clock className="h-3 w-3 text-muted-foreground" />
                             <span>{mentor.experience_years} Years</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={mentor.is_active ? 'default' : 'secondary'} className={mentor.is_active ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                            {mentor.is_active ? 'Active' : 'Inactive'}
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
                              <DropdownMenuItem onClick={() => handleOpenEdit(mentor)} className="focus:bg-white/10">
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-white/10">
                                 <Clock className="mr-2 h-4 w-4" /> Manage Schedule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem onClick={() => handleDelete(mentor.id)} className="text-destructive focus:bg-destructive/20">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete / Deactivate
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

      {/* Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMentor ? 'Edit Mentor' : 'Tambah Mentor Baru'}</DialogTitle>
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
