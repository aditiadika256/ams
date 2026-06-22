# Developer Guide: Struktur Modul Admin View & Form

Panduan ini menjelaskan arsitektur refaktorisasi terbaru untuk modul admin di aplikasi web Arkanin. Semua modul admin baru atau yang sudah ada harus mengikuti standar ini untuk menjaga keterbacaan, kebersihan kode (*clean code*), dan kemudahan pemeliharaan (*maintainability*).

## Prinsip Utama
1. **Pemisahan Tampilan & Form**: Berkas `view.tsx` bertanggung jawab untuk merender tabel data, kontrol pencarian, filter, dan pemicu dialog. Berkas `form.tsx` bertanggung jawab penuh atas keadaan input form, validasi awal, dan tata letak masukan data.
2. **Penggunaan Dialog Glassmorphism**: Semua form tambah/ubah data ditampilkan menggunakan overlay modal/dialog dengan gaya *glassmorphism* modern.
3. **Penyelarasan Store Zustand**: Semua aksi CRUD (Create, Read, Update, Delete) dikoordinasikan melalui Zustand store khusus (seperti `useSalesStore`, `useLearningStore`, dll.).

## Contoh Struktur Folder Modul
Setiap modul admin diletakkan dalam folder dengan penamaan PascalCase di bawah direktori `apps/web/src/components/admin/views/`:

```
CMSPosts/
├── view.tsx    # Komponen utama penampil data
└── form.tsx    # Komponen form tambah & edit data
```

---

## Implementasi Form (`form.tsx`)
Komponen form menerima properti berikut:
- `initialData`: Data awal untuk mode sunting (ubah). Bernilai `null` atau `undefined` untuk mode tambah.
- `onSubmit`: Fungsi *callback* asinkron untuk menangani pengiriman data.
- `onCancel`: Fungsi untuk menutup modal.
- `isLoading`: Keadaan pemuatan/loading dari komponen utama untuk menonaktifkan tombol kirim.

### Contoh Template `form.tsx`
```tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EntityFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function EntityForm({ initialData, onSubmit, onCancel, isLoading }: EntityFormProps) {
  const [name, setName] = useState(initialData?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="entity-name">Nama</Label>
        <Input
          id="entity-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
        />
      </div>
      
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
        <Button type="button" variant="outline" onClick={onCancel} className="border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
```

---

## Implementasi View (`view.tsx`)
Komponen view mengontrol status visual dialog, menampilkan data tabel, dan memanggil aksi API dari store zustand.

### Contoh Template `view.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EntityForm } from './form';

export default function EntityView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  const handleOpenAdd = () => {
    setSelectedEntity(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entity: any) => {
    setSelectedEntity(entity);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedEntity) {
      // Panggil aksi edit dari store
    } else {
      // Panggil aksi tambah dari store
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Tombol pemicu tambah */}
      <Button onClick={handleOpenAdd}>Tambah Data</Button>

      {/* Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEntity ? 'Edit Data' : 'Tambah Baru'}</DialogTitle>
          </DialogHeader>
          <EntityForm 
            initialData={selectedEntity}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```
