import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ModuleFormProps {
  newTitle: string;
  setNewTitle: (val: string) => void;
  handleAddModule: () => void;
}

export function ModuleForm({ newTitle, setNewTitle, handleAddModule }: ModuleFormProps) {
  return (
    <>
      <div className="py-4">
        <Label htmlFor="module-title">Module Title</Label>
        <Input 
          id="module-title" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder="e.g. Introduction to React" 
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10 mt-2"
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleAddModule} className="bg-blue-600 hover:bg-blue-700">Create Module</Button>
      </div>
    </>
  );
}

export interface LessonFormProps {
  newTitle: string;
  setNewTitle: (val: string) => void;
  handleAddLesson: () => void;
}

export function LessonForm({ newTitle, setNewTitle, handleAddLesson }: LessonFormProps) {
  return (
    <>
      <div className="py-4 space-y-4">
        <div className="space-y-2">
          <Label>Lesson Title</Label>
          <Input 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.target.value)} 
            placeholder="e.g. Installing Node.js" 
            className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
          />
        </div>
        {/* Content Type selection could go here */}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleAddLesson} className="bg-blue-600 hover:bg-blue-700">Add Lesson</Button>
      </div>
    </>
  );
}
