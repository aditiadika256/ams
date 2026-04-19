'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu as MenuIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Menu } from '@/types/system';
import { motion } from 'framer-motion';

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

  const loadMenus = async () => {
    setLoading(true);
    try {
      const res = await apiClient.admin.menus.list();
      setMenus(res.data || []);
    } catch (e) {
      console.error(e);
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
    } catch (err) {
      console.error(err);
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
  };

  const removeMenu = async (id: number) => {
    if (!confirm('Hapus menu ini? Submenu akan ikut terhapus.')) return;
    try {
      await apiClient.admin.menus.remove(id);
      await loadMenus();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/10">
            <MenuIcon className="h-5 w-5 text-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Menu Management</h2>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5" />
          <GlassCardHeader className="relative z-10">
            <GlassCardTitle>{editingId ? 'Edit Menu' : 'Tambah Menu'}</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="relative z-10">
            <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input
                  value={form.name || ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 focus:border-purple-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Layout</Label>
                <div className="flex items-center gap-6 p-2 rounded-md border border-white/10 bg-white/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="layout"
                      value="users"
                      checked={(form.layout || 'users') === 'users'}
                      onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as any, section: 'topbar', parent_id: null }))}
                      className="accent-purple-500"
                    />
                    <span>Users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="layout"
                      value="admin"
                      checked={(form.layout || 'users') === 'admin'}
                      onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as any, section: 'sidebar', parent_id: null }))}
                      className="accent-purple-500"
                    />
                    <span>Admin</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Pilih layout target: Users atau Admin.</p>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select
                  value={form.section || (form.layout === 'admin' ? 'sidebar' : 'topbar')}
                  onValueChange={(v) => setForm((f) => ({ ...f, section: v as any, parent_id: null }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Pilih section" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                    {(form.layout === 'admin' ? ['sidebar', 'header'] : ['topbar', 'bottomnavigation']).map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {opt === 'sidebar' && 'Sidebar (Admin)'}
                        {opt === 'header' && 'Header (Admin)'}
                        {opt === 'topbar' && 'TopBar (Users)'}
                        {opt === 'bottomnavigation' && 'BottomNavigation (Users)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Menentukan posisi menu sesuai layout.</p>
              </div>
              <div className="space-y-2">
                <Label>Icon (lucide)</Label>
                <Input
                  value={form.icon || ''}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="Contoh: Home, LayoutGrid"
                  className="bg-white/5 border-white/10 focus:border-purple-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={form.url || ''}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 focus:border-purple-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent</Label>
                <Select
                  value={form.parent_id ? String(form.parent_id) : 'none'}
                  onValueChange={(v) => setForm((f) => ({ ...f, parent_id: v === 'none' ? null : Number(v) }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Tidak ada (Top-level)" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                    <SelectItem value="none">Top-level</SelectItem>
                    {parentOptions.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={form.order ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className="bg-white/5 border-white/10 focus:border-purple-500/50"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 mt-4">
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm} className="border-white/10 hover:bg-white/5">
                    Batal
                  </Button>
                )}
                <Button type="submit" className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingId ? 'Simpan Perubahan' : 'Tambah Menu'}
                </Button>
              </div>
            </form>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

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
                            <span className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300 border border-purple-500/20">
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
                          <Button variant="destructive" size="sm" onClick={() => removeMenu(m.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
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
                                <Button variant="destructive" size="sm" onClick={() => removeMenu(c.id)} className="h-8 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
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
