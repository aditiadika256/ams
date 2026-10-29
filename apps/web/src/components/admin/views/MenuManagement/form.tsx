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
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="menu-name">Nama</Label>
        <Input
          id="menu-name"
          value={form.name || ''}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <div className="flex items-center gap-6 p-2 rounded-xl border border-input/60 bg-background/70 text-foreground">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="layout"
              value="users"
              checked={(form.layout || 'users') === 'users'}
              onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as any, section: 'topbar', parent_id: null }))}
              className="accent-primary size-4"
            />
            <span className="text-sm font-medium">Users</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="layout"
              value="admin"
              checked={(form.layout || 'users') === 'admin'}
              onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as any, section: 'sidebar', parent_id: null }))}
              className="accent-primary size-4"
            />
            <span className="text-sm font-medium">Admin</span>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Pilih layout target: Users atau Admin.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="menu-section">Section</Label>
        <Select
          value={form.section || (form.layout === 'admin' ? 'sidebar' : 'topbar')}
          onValueChange={(v) => setForm((f) => ({ ...f, section: v as any, parent_id: null }))}
        >
          <SelectTrigger id="menu-section" className="bg-background/70 border-input/60 text-foreground">
            <SelectValue placeholder="Pilih section" />
          </SelectTrigger>
          <SelectContent className="border-border/60 bg-popover text-popover-foreground">
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
        <Label htmlFor="menu-icon">Icon (lucide)</Label>
        <Input
          id="menu-icon"
          value={form.icon || ''}
          onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          placeholder="Contoh: Home, LayoutGrid"
          className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="menu-url">URL</Label>
        <Input
          id="menu-url"
          value={form.url || ''}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          required
          className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="menu-parent">Parent</Label>
        <Select
          value={form.parent_id ? String(form.parent_id) : 'none'}
          onValueChange={(v) => setForm((f) => ({ ...f, parent_id: v === 'none' ? null : Number(v) }))}
        >
          <SelectTrigger id="menu-parent" className="bg-background/70 border-input/60 text-foreground">
            <SelectValue placeholder="Tidak ada (Top-level)" />
          </SelectTrigger>
          <SelectContent className="border-border/60 bg-popover text-popover-foreground">
            <SelectItem value="none">Top-level</SelectItem>
            {parentOptions.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="menu-order">Urutan</Label>
        <Input
          id="menu-order"
          type="number"
          value={form.order ?? 0}
          onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
          className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-2 mt-4 pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(false)}
          className="w-full sm:w-auto min-h-11 sm:min-h-10 border-border/70 hover:bg-accent hover:text-accent-foreground"
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto min-h-11 sm:min-h-10 bg-primary hover:bg-primary/90 text-primary-foreground border-0"
        >
          {editingId ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          <span>{editingId ? 'Simpan Perubahan' : 'Tambah Menu'}</span>
        </Button>
      </div>
    </form>
  );
}
