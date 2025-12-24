'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, FileText, ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

const posts = [
  { id: 1, title: 'Getting Started with Arkanin', author: 'Admin', status: 'Published', date: '2023-12-01' },
  { id: 2, title: 'New Features in v2.0', author: 'Admin', status: 'Draft', date: '2023-12-05' },
  { id: 3, title: 'Best Practices for Learning', author: 'Editor', status: 'Published', date: '2023-12-10' },
  { id: 4, title: 'Community Guidelines', author: 'Admin', status: 'Published', date: '2023-12-15' },
];

export default function CMSPostsView() {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (id: number | null) => {
    setEditingId(id);
    setView('editor');
  };

  if (view === 'editor') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setView('list')}>
               <ArrowLeft className="h-4 w-4" />
             </Button>
             <div>
               <h2 className="text-3xl font-bold tracking-tight">{editingId ? 'Edit Post' : 'New Post'}</h2>
               <p className="text-muted-foreground">Create or edit your content.</p>
             </div>
           </div>
           <div className="flex gap-2">
             <Button variant="outline">Save Draft</Button>
             <Button>
               <Save className="mr-2 h-4 w-4" /> Publish
             </Button>
           </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
           <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Enter post title" defaultValue={editingId ? "Getting Started with Arkanin" : ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slug</label>
                    <Input placeholder="getting-started-with-arkanin" defaultValue={editingId ? "getting-started-with-arkanin" : ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <div className="min-h-[400px] p-4 rounded-md border bg-muted/20 font-mono text-sm focus-within:ring-1 focus-within:ring-ring">
                      <p className="text-muted-foreground">// Markdown editor would go here...</p>
                      <br />
                      <p># Hello World</p>
                      <p>This is a sample content.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
           </div>
           <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-sm">Status</span>
                     <Badge>Draft</Badge>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm">Visibility</span>
                     <span className="text-sm text-muted-foreground">Public</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm">Author</span>
                     <span className="text-sm text-muted-foreground">Admin</span>
                   </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-xs">Click to upload</span>
                   </div>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground">Manage articles and content.</p>
        </div>
        <Button onClick={() => handleEdit(null)}>
          <Plus className="mr-2 h-4 w-4" /> Create New Post
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Posts</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                className="pl-8 w-[200px] lg:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded bg-muted flex items-center justify-center">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{post.author}</td>
                    <td className="px-4 py-3">
                      <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{post.date}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(post.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
