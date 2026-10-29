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
  initialData?: {
    title: string;
    slug: string;
    content: string;
    status: string;
  };
  onCancel: () => void;
  onSave: (data: { title: string; content: string; status: string }) => void | Promise<void>;
}

export function CMSPostForm({ editingId, initialData, onCancel, onSave }: CMSPostFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [status, setStatus] = useState(initialData?.status ?? 'Draft');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const nextStatus = submitter?.value || status;
    setStatus(nextStatus);
    setIsSaving(true);
    try {
      await onSave({ title, content, status: nextStatus });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="hover:bg-accent rounded-xl"
            aria-label="Kembali ke daftar pos"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {editingId ? 'Edit Post' : 'New Post'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Buat atau perbarui konten artikel.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="submit"
            name="status"
            value="Draft"
            disabled={isSaving}
            variant="outline" 
            className="border-border/70 hover:bg-accent hover:text-accent-foreground min-h-11 sm:min-h-10 text-xs font-medium"
          >
            Save Draft
          </Button>
          <Button 
            type="submit" 
            name="status"
            value="Published"
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-11 sm:min-h-10 text-xs font-semibold shadow-xs"
          >
            <Save className="h-4 w-4 mr-2" />
            <span>Publish</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <GlassCard>
            <GlassCardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input 
                  placeholder="Enter post title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                  className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Slug</label>
                <Input 
                  value={initialData?.slug || 'Dibuat otomatis setelah post disimpan'}
                  disabled
                  className="bg-muted/40 border-input/60 text-muted-foreground" 
                />
                <p className="text-xs text-muted-foreground">
                  Slug dibuat otomatis dari judul untuk menjaga URL tetap konsisten.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here..."
                  className="w-full min-h-[400px] p-4 rounded-xl border border-input/60 bg-background/70 font-mono text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none text-foreground placeholder:text-muted-foreground leading-relaxed"
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
                <span className="text-sm text-foreground">Status</span>
                <Badge 
                  variant={status === 'Published' ? 'default' : 'secondary'}
                  className={status === 'Published' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'}
                >
                  {status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Visibility</span>
                <span className="text-sm text-muted-foreground">Public</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Author</span>
                <span className="text-sm text-muted-foreground">Admin</span>
              </div>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Featured Image</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="aspect-video rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 cursor-pointer transition-colors">
                <ImageIcon className="h-8 w-8 mb-2 text-primary" />
                <span className="text-xs font-medium">Click to upload</span>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </form>
  );
}
