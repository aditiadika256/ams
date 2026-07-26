'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Menu as MenuIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Menu } from '@/types/system';
import { motion } from 'framer-motion';
import { MenuForm } from './form';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
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

export default function MenuManagementView() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Menu>>({
    name: '',
    icon: '',
    url: '',
    layout: 'users',
    section: 'topbar',
    parent_id: null,
    order: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const res = await apiClient.admin.menus.list();
      setMenus(res.data || []);
    } catch (error) {
      console.error(error);
      window.alert(getErrorMessage(error, 'Gagal memuat daftar menu.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const parentOptions = useMemo(() => {
    return menus.filter(m => !m.parent_id && m.layout === (form.layout || 'users') && m.section === (form.section || 'topbar'));
  }, [menus, form.layout, form.section]);

  const resetForm = () => {
    setForm({ name: '', icon: '', url: '', parent_id: null, order: 0 });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.admin.menus.update(editingId, form);
      } else {
        await apiClient.admin.menus.create(form);
      }
      resetForm();
      await loadMenus();
    } catch (error) {
      console.error(error);
      window.alert(getErrorMessage(error, 'Gagal menyimpan menu.'));
    }
  };

  const startEdit = (m: Menu) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      icon: m.icon || '',
      url: m.url,
      layout: m.layout,
      section: m.section,
      parent_id: m.parent_id || null,
      order: m.order,
    });
    setIsModalOpen(true);
  };

  const removeMenu = async (id: number) => {
    if (deletingId !== null) return;
    if (!confirm('Hapus menu ini? Submenu akan ikut terhapus.')) return;

    setDeletingId(id);
    try {
      await apiClient.admin.menus.remove(id);
      await loadMenus();
    } catch (error) {
      console.error(error);
      window.alert(getErrorMessage(error, 'Gagal menghapus menu.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Menu Management</h2>
          <p className="text-muted-foreground">Atur navigasi dan menu untuk tampilan Admin maupun Users.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          else setIsModalOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg">
              <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Tambah Menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Menu' : 'Tambah Menu'}</DialogTitle>
            </DialogHeader>
            <MenuForm 
              form={form}
              setForm={setForm}
              editingId={editingId}
              handleSubmit={handleSubmit}
              setIsModalOpen={setIsModalOpen}
              parentOptions={parentOptions}
            />
          </DialogContent>
        </Dialog>
      </div>

      <motion.div variants={itemVariants}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Daftar Menu</GlassCardTitle>
          </GlassCardHeader>
            <GlassCardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Memuat...</div>
              ) : (
                <div className="space-y-4">
                {menus
                  .filter(m => !m.parent_id)
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((m, index) => (
                    <motion.div 
                      key={m.id} 
                      className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary/80 border border-primary/20">
                              {m.order}
                            </span>
                            {m.name}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 ml-8">{m.url}</div>
                          <div className="text-xs text-muted-foreground ml-8 flex gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">Layout: {m.layout}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">Section: {m.section}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEdit(m)} className="border-white/10 hover:bg-white/10">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => removeMenu(m.id)} disabled={deletingId !== null} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                      {menus
                        .filter(c => c.parent_id === m.id)
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((c) => (
                          <div key={c.id} className="mt-3 ml-6 border-l border-white/10 pl-4">
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition-colors">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="h-5 w-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px] text-pink-300 border border-pink-500/20">
                                    {c.order}
                                  </span>
                                  {c.name}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1 ml-7">{c.url}</div>
                                <div className="text-xs text-muted-foreground ml-7 flex gap-2 mt-1">
                                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">Layout: {c.layout}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">Section: {c.section}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => startEdit(c)} className="h-8 border-white/10 hover:bg-white/10">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => removeMenu(c.id)} disabled={deletingId !== null} className="h-8 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Hapus
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCardContent>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
