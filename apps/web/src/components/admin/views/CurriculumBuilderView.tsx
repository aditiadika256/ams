'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Video, FileText, CheckCircle2, GripVertical } from 'lucide-react';
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

interface CurriculumBuilderViewProps {
  data?: {
    programId: number;
    programName: string;
  };
}

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Curriculum Builder</h2>
          <p className="text-muted-foreground">Managing curriculum for <span className="font-semibold text-primary">{programName}</span></p>
        </div>
        <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
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
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAddModule}>Create Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading curriculum...</div>
        ) : modules.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
            <p className="text-muted-foreground mb-4">This program has no content yet.</p>
            <Button variant="outline" onClick={() => setIsAddModuleOpen(true)}>Start Adding Content</Button>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {modules.map((module) => (
              <AccordionItem key={module.id} value={`module-${module.id}`} className="border rounded-lg bg-card px-4">
                <div className="flex items-center py-2">
                  <div className="cursor-grab text-muted-foreground mr-2">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <AccordionTrigger className="flex-1 hover:no-underline py-2">
                    <span className="font-medium text-lg">{module.title}</span>
                  </AccordionTrigger>
                  <div className="flex items-center gap-2 ml-4">
                     <Badge variant="outline">{module.lessons?.length || 0} Lessons</Badge>
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(module.id)}>
                       <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                  </div>
                </div>
                <AccordionContent className="pt-2 pb-4 border-t">
                  <div className="space-y-2 pl-6">
                    {module.lessons && module.lessons.map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md group">
                        <div className="flex items-center gap-3">
                          {lesson.content_type === 'video' ? (
                            <Video className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-orange-500" />
                          )}
                          <span>{lesson.title}</span>
                          {lesson.is_preview && <Badge variant="secondary" className="text-xs">Preview</Badge>}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Dialog open={isAddLessonOpen && selectedModuleId === module.id} onOpenChange={(open: boolean) => {
                      setIsAddLessonOpen(open);
                      if (!open) setSelectedModuleId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2 border border-dashed text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setSelectedModuleId(module.id);
                            setNewTitle('');
                          }}
                        >
                          <Plus className="mr-2 h-3 w-3" /> Add Lesson
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
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
                            />
                          </div>
                          {/* Content Type selection could go here */}
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddLesson}>Add Lesson</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
