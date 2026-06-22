import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Save, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface CMSPostFormProps {
  editingId: number | null;
  onCancel: () => void;
  onSave: (data: { title: string; slug: string; content: string; status: string }) => void;
}

export function CMSPostForm({ editingId, onCancel, onSave }: CMSPostFormProps) {
  const [title, setTitle] = useState(editingId ? "Getting Started with Arkanin" : "");
  const [slug, setSlug] = useState(editingId ? "getting-started-with-arkanin" : "");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, slug, content, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{editingId ? 'Edit Post' : 'New Post'}</h2>
            <p className="text-muted-foreground">Create or edit your content.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => { setStatus("Draft"); onSave({ title, slug, content, status: "Draft" }); }}
            className="bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Save Draft
          </Button>
          <Button 
            type="submit" 
            onClick={() => setStatus("Published")}
            className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
          >
            <Save className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Publish</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <GlassCard>
            <GlassCardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  placeholder="Enter post title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                  className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input 
                  placeholder="getting-started-with-arkanin" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here..."
                  className="w-full min-h-[400px] p-4 rounded-md border border-input/50 bg-background/50 font-mono text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 text-foreground"
                />
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-6">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Publishing</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge 
                  variant={status === 'Published' ? 'default' : 'secondary'}
                  className={status === 'Published' ? 'bg-green-500/20 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'}
                >
                  {status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Visibility</span>
                <span className="text-sm text-muted-foreground">Public</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Author</span>
                <span className="text-sm text-muted-foreground">Admin</span>
              </div>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Featured Image</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="aspect-video rounded-md border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/20 cursor-pointer transition-colors">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-xs">Click to upload</span>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </form>
  );
}
