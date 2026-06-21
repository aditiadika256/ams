'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, FileText, ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { CMSPostForm } from './form';

const postsData = [
  { id: 1, title: 'Getting Started with Arkanin', author: 'Admin', status: 'Published', date: '2023-12-01' },
  { id: 2, title: 'New Features in v2.0', author: 'Admin', status: 'Draft', date: '2023-12-05' },
  { id: 3, title: 'Best Practices for Learning', author: 'Editor', status: 'Published', date: '2023-12-10' },
  { id: 4, title: 'Community Guidelines', author: 'Admin', status: 'Published', date: '2023-12-15' },
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

export default function CMSPostsView() {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [posts, setPosts] = useState(postsData);

  const handleEdit = (id: number | null) => {
    setEditingId(id);
    setView('editor');
  };

  const handleSave = (data: { title: string; slug: string; content: string; status: string }) => {
    if (editingId) {
      setPosts(prev => prev.map(p => p.id === editingId ? { ...p, title: data.title, status: data.status } : p));
    } else {
      const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
      const today = new Date().toISOString().split('T')[0];
      setPosts(prev => [...prev, { id: newId, title: data.title, author: 'Admin', status: data.status, date: today }]);
    }
    setView('list');
  };

  if (view === 'editor') {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <CMSPostForm 
          editingId={editingId}
          onCancel={() => setView('list')}
          onSave={handleSave}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Blog Posts</h2>
          <p className="text-muted-foreground">Manage articles and content.</p>
        </motion.div>
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleEdit(null)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-linear-to-r from-blue-600 to-indigo-600 text-primary-foreground hover:from-blue-700 hover:to-indigo-700 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Post
        </motion.button>
      </div>
      
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <GlassCardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <GlassCardTitle>All Posts</GlassCardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  className="pl-8 w-[200px] lg:w-[300px] bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
                />
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, index) => (
                    <motion.tr 
                      key={post.id} 
                      className="border-b border-border/20 last:border-0 hover:bg-muted/40 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-foreground">{post.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{post.author}</td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={post.status === 'Published' ? 'default' : 'secondary'}
                          className={post.status === 'Published' ? 'bg-green-500/20 text-green-500 dark:text-green-400 hover:bg-green-500/30 border-green-500/20' : 'bg-muted text-muted-foreground hover:bg-muted/70 border-muted'}
                        >
                          {post.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{post.date}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(post.id)} className="hover:bg-primary/20 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
