import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Plus } from 'lucide-react';
import { Menu } from '@/types/system';

interface MenuFormProps {
  form: Partial<Menu>;
  setForm: React.Dispatch<React.SetStateAction<Partial<Menu>>>;
  editingId: number | null;
  handleSubmit: (e: React.FormEvent) => void;
  setIsModalOpen: (open: boolean) => void;
  parentOptions: Menu[];
}

export function MenuForm({ form, setForm, editingId, handleSubmit, setIsModalOpen, parentOptions }: MenuFormProps) {
  return (
    <form className="grid md:grid-cols-2 gap-4 py-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label>Nama</Label>
        <Input
          value={form.name || ''}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <div className="flex items-center gap-6 p-2 rounded-md border border-input/50 bg-background/50 dark:border-white/10 dark:bg-white/5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="layout"
              value="users"
              checked={(form.layout || 'users') === 'users'}
              onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as any, section: 'topbar', parent_id: null }))}
              className="accent-primary"
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
              className="accent-primary"
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
          <SelectTrigger className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10">
            <SelectValue placeholder="Pilih section" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 dark:border-white/10">
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
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>
      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={form.url || ''}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          required
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>
      <div className="space-y-2">
        <Label>Parent</Label>
        <Select
          value={form.parent_id ? String(form.parent_id) : 'none'}
          onValueChange={(v) => setForm((f) => ({ ...f, parent_id: v === 'none' ? null : Number(v) }))}
        >
          <SelectTrigger className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10">
            <SelectValue placeholder="Tidak ada (Top-level)" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 dark:border-white/10">
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
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>

      <div className="md:col-span-2 flex items-center justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
          Batal
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
          {editingId ? <Edit className="h-4 w-4 sm:mr-2" /> : <Plus className="h-4 w-4 sm:mr-2" />}
          <span className="hidden sm:inline">{editingId ? 'Simpan Perubahan' : 'Tambah Menu'}</span>
        </Button>
      </div>
    </form>
  );
}
