'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Video, FileText, GripVertical } from 'lucide-react';
import { useLearningStore } from '@/store/useLearningStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface CurriculumBuilderViewProps {
  data?: {
    programId: number;
    programName: string;
  };
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

export default function CurriculumBuilderView({ data }: CurriculumBuilderViewProps) {
  const { fetchCurriculum, createModule, createLesson, deleteModule, deleteLesson } = useLearningStore();
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const programId = data?.programId;
  const programName = data?.programName || 'Program';

  const loadCurriculum = async () => {
    if (!programId) return;
    setIsLoading(true);
    const result = await fetchCurriculum(programId);
    setModules(result);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCurriculum();
  }, [programId]);

  const handleAddModule = async () => {
    if (!programId || !newTitle) return;
    await createModule(programId, { title: newTitle, order: modules.length + 1, is_published: true });
    setNewTitle('');
    setIsAddModuleOpen(false);
    loadCurriculum();
  };

  const handleAddLesson = async () => {
    if (!selectedModuleId || !newTitle) return;
    
    // Calculate new order
    const currentModule = modules.find(m => m.id === selectedModuleId);
    const maxOrder = currentModule?.lessons?.reduce((max: number, l: any) => Math.max(max, l.order || 0), 0) || 0;

    await createLesson(selectedModuleId, { 
      title: newTitle, 
      content_type: 'text', 
      order: maxOrder + 1,
      is_published: true 
    });
    setNewTitle('');
    setIsAddLessonOpen(false);
    loadCurriculum();
  };

  const handleDeleteModule = async (id: number) => {
    if (confirm('Are you sure you want to delete this module?')) {
      await deleteModule(id);
      loadCurriculum();
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      await deleteLesson(id);
      loadCurriculum();
    }
  };

  if (!programId) {
    return <div className="p-8 text-center text-red-500">Error: No Program ID provided.</div>;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Curriculum Builder</h2>
          <p className="text-muted-foreground">Managing curriculum for <span className="font-semibold text-primary">{programName}</span></p>
        </motion.div>
        <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
          <DialogTrigger asChild>
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-linear-to-r from-blue-600 to-indigo-600 text-primary-foreground hover:from-blue-700 hover:to-indigo-700 h-10 px-4 py-2"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Module
            </motion.button>
          </DialogTrigger>
          <DialogContent className="bg-black/80 backdrop-blur-xl border-white/10">
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
              <DialogDescription>Create a new section for your program.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="module-title">Module Title</Label>
              <Input 
                id="module-title" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                placeholder="e.g. Introduction to React" 
                className="bg-white/5 border-white/10 mt-2"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAddModule} className="bg-blue-600 hover:bg-blue-700">Create Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="max-w-4xl mx-auto"
      >
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading curriculum...</div>
        ) : modules.length === 0 ? (
          <GlassCard className="py-12 text-center border-dashed border-white/10 bg-white/5">
            <GlassCardContent>
              <p className="text-muted-foreground mb-4">This program has no content yet.</p>
              <Button variant="outline" onClick={() => setIsAddModuleOpen(true)} className="border-white/10 hover:bg-white/5">Start Adding Content</Button>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionItem value={`module-${module.id}`} className="border border-white/10 rounded-lg bg-white/5 px-4 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center py-2">
                    <div className="cursor-grab text-muted-foreground mr-2 hover:text-white transition-colors">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <AccordionTrigger className="flex-1 hover:no-underline py-2 hover:text-blue-400 transition-colors">
                      <span className="font-medium text-lg">{module.title}</span>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2 ml-4">
                       <Badge variant="outline" className="border-white/10 bg-white/5">{module.lessons?.length || 0} Lessons</Badge>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(module.id)} className="hover:bg-red-500/20 hover:text-red-400">
                         <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </div>
                  </div>
                  <AccordionContent className="pt-2 pb-4 border-t border-white/5">
                    <div className="space-y-2 pl-6">
                      {module.lessons && module.lessons.map((lesson: any) => (
                        <motion.div 
                          key={lesson.id} 
                          className="flex items-center justify-between p-3 bg-black/20 hover:bg-white/5 rounded-md group border border-transparent hover:border-white/5 transition-all"
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center gap-3">
                            {lesson.content_type === 'video' ? (
                              <Video className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                            {lesson.is_preview && <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">Preview</Badge>}
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-red-500/20 hover:text-red-400" onClick={() => handleDeleteLesson(lesson.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      
                      <Dialog open={isAddLessonOpen && selectedModuleId === module.id} onOpenChange={(open: boolean) => {
                        setIsAddLessonOpen(open);
                        if (!open) setSelectedModuleId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2 border border-dashed border-white/10 text-muted-foreground hover:text-primary hover:bg-white/5"
                            onClick={() => {
                              setSelectedModuleId(module.id);
                              setNewTitle('');
                            }}
                          >
                            <Plus className="mr-2 h-3 w-3" /> Add Lesson
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/80 backdrop-blur-xl border-white/10">
                          <DialogHeader>
                            <DialogTitle>Add Lesson to {module.title}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label>Lesson Title</Label>
                              <Input 
                                value={newTitle} 
                                onChange={(e) => setNewTitle(e.target.value)} 
                                placeholder="e.g. Installing Node.js" 
                                className="bg-white/5 border-white/10"
                              />
                            </div>
                            {/* Content Type selection could go here */}
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddLesson} className="bg-blue-600 hover:bg-blue-700">Add Lesson</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        )}
      </motion.div>
    </motion.div>
  );
}
