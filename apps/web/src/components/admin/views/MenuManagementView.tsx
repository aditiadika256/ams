'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu as MenuIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Menu } from '@/types/system';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MenuIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Menu Management</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Menu' : 'Tambah Menu'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Layout</Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="layout"
                    value="users"
                    checked={(form.layout || 'users') === 'users'}
                    onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as any, section: 'topbar', parent_id: null }))}
                  />
                  <span>Users</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="layout"
                    value="admin"
                    checked={(form.layout || 'users') === 'admin'}
                    onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as any, section: 'sidebar', parent_id: null }))}
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
                <SelectTrigger>
                  <SelectValue placeholder="Pilih section" />
                </SelectTrigger>
                <SelectContent>
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
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={form.url || ''}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Parent</Label>
              <Select
                value={form.parent_id ? String(form.parent_id) : 'none'}
                onValueChange={(v) => setForm((f) => ({ ...f, parent_id: v === 'none' ? null : Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tidak ada (Top-level)" />
                </SelectTrigger>
                <SelectContent>
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
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              )}
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {editingId ? 'Simpan Perubahan' : 'Tambah Menu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Menu</CardTitle>
        </CardHeader>
          <CardContent>
            {loading ? (
              <div>Memuat...</div>
            ) : (
              <div className="space-y-4">
              {menus
                .filter(m => !m.parent_id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((m) => (
                  <div key={m.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-sm text-muted-foreground">{m.url}</div>
                        <div className="text-xs text-muted-foreground">Layout: {m.layout} • Section: {m.section}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(m)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeMenu(m.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                    {menus
                      .filter(c => c.parent_id === m.id)
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((c) => (
                        <div key={c.id} className="mt-3 ml-6 border-l pl-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div>{c.name}</div>
                              <div className="text-sm text-muted-foreground">{c.url}</div>
                              <div className="text-xs text-muted-foreground">Layout: {c.layout} • Section: {c.section}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => startEdit(c)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => removeMenu(c.id)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Hapus
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
      </Card>
    </div>
  );
}
