'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DoorClosed,
  Plus,
  Users,
  Search,
  Building2,
  Tv,
  Wifi,
  Wind,
  ShieldCheck,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiService } from '@/lib/api';

interface PhysicalRoomItem {
  id: number;
  branch_id?: number | null;
  room_number: string;
  room_name: string;
  capacity: number;
  facilities: string[];
  is_active: boolean;
  branch?: {
    id: number;
    name: string;
    code: string;
  };
  created_at: string;
}

const AVAILABLE_FACILITIES = [
  'AC',
  'Projector',
  'Whiteboard',
  'Sound System',
  'High-speed WiFi',
  'CCTV 360',
  'PC CBT Unit',
  'Podium Tentor',
];

export default function SchedulePhysicalRoomView() {
  const [rooms, setRooms] = useState<PhysicalRoomItem[]>([]);
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState<number>(30);
  const [facilities, setFacilities] = useState<string[]>(['AC', 'Projector', 'Whiteboard']);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await apiService.auth.getBranches();
      if (res?.data) {
        setBranches(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { per_page: 30 };
      if (selectedBranchId !== 'all') params.branch_id = Number(selectedBranchId);
      if (search.trim()) params.search = search.trim();

      const res = await apiService.physicalRooms.list(params);
      if (res?.data) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch physical rooms', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId, search]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const openCreateModal = () => {
    setEditingId(null);
    setBranchId(branches.length > 0 ? branches[0].id : null);
    setRoomNumber('');
    setRoomName('');
    setCapacity(30);
    setFacilities(['AC', 'Projector', 'Whiteboard', 'High-speed WiFi']);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (room: PhysicalRoomItem) => {
    setEditingId(room.id);
    setBranchId(room.branch_id ?? null);
    setRoomNumber(room.room_number);
    setRoomName(room.room_name);
    setCapacity(room.capacity);
    setFacilities(room.facilities || []);
    setIsActive(room.is_active);
    setIsModalOpen(true);
  };

  const toggleFacility = (fac: string) => {
    setFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        branch_id: branchId,
        room_number: roomNumber.trim(),
        room_name: roomName.trim(),
        capacity,
        facilities,
        is_active: isActive,
      };

      if (editingId) {
        await apiService.physicalRooms.update(editingId, payload);
      } else {
        await apiService.physicalRooms.create(payload);
      }

      setIsModalOpen(false);
      await fetchRooms();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan ruangan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus inventaris ruangan ini?')) return;
    try {
      await apiService.physicalRooms.delete(id);
      await fetchRooms();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus ruangan');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <DoorClosed className="size-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Inventaris Ruang Fisik Cabang
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                  Schedule Tool
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengelolaan ruang kelas tatap muka, alokasi kapasitas kursi, dan mitigasi bentrok jadwal
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRooms}
            disabled={isLoading}
            className="w-full sm:w-auto min-h-11 sm:min-h-9 text-xs bg-card/85 backdrop-blur-xl border-border/60 hover:bg-muted"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Segarkan
          </Button>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="w-full sm:w-auto min-h-11 sm:min-h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Plus className="size-3.5 mr-1.5" /> Tambah Ruangan Baru
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor atau nama ruangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <select
          value={selectedBranchId}
          aria-label="Filter kantor cabang"
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="h-10 px-3 rounded-xl text-xs bg-background/70 border border-input/60 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 w-full sm:w-auto min-w-[200px]"
        >
          <option value="all">Semua Kantor Cabang</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
          Memuat inventaris ruangan fisik…
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-sm">
          <DoorClosed className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <div className="text-sm font-semibold text-foreground">Belum Ada Ruang Kelas</div>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Mulai tambahkan inventaris ruang kelas untuk mendukung pelaksanaan program belajar offline tatap muka.
          </p>
          <Button size="sm" onClick={openCreateModal} className="mt-4 text-xs min-h-10">
            <Plus className="size-3.5 mr-1" /> Tambah Ruangan Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-primary px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                      {room.room_number}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      <Building2 className="size-3 mr-1" /> {room.branch?.name || 'Cabang Pusat'}
                    </Badge>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      room.is_active
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-muted text-muted-foreground border-border/60'
                    }`}
                  >
                    {room.is_active ? 'TERSEDIA' : 'NON-AKTIF'}
                  </Badge>
                </div>

                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {room.room_name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <Users className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground">{room.capacity}</span> Kursi Siswa
                </div>

                {/* Facilities Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                  {room.facilities?.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-muted/50 text-muted-foreground border border-border/40"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(room)}
                  className="h-8 px-2.5 text-[11px] bg-card hover:bg-muted border-border/60 text-foreground"
                >
                  <Edit2 className="size-3 mr-1" /> Ubah
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(room.id)}
                  className="h-8 px-2.5 text-[11px] bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Room */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <DoorClosed className="size-4 text-primary" />{' '}
              {editingId ? 'Perbarui Ruang Kelas' : 'Tambah Ruang Kelas Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Kantor Cabang</Label>
              <select
                value={branchId ?? ''}
                aria-label="Pilih kantor cabang"
                onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-10 px-3 rounded-xl text-xs bg-background/70 border border-input/60 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">Pusat / Tanpa Cabang Khusus</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground">Kode / Nomor Ruang</Label>
                <Input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="misal: R.101"
                  className="h-10 text-xs font-mono bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-foreground">Kapasitas Kursi</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="h-10 text-xs font-mono bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Nama Deskriptif Ruang</Label>
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="misal: Ruang Teori Al-Khawarizmi"
                className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Facilities Selector */}
            <div className="space-y-2">
              <Label className="text-xs text-foreground">Fasilitas Tersedia</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_FACILITIES.map((fac) => {
                  const checked = facilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFacility(fac)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs transition-all border ${
                        checked
                          ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                          : 'bg-background/60 border-border/50 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div
                        className={`size-4 rounded flex items-center justify-center border ${
                          checked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/40'
                        }`}
                      >
                        {checked && <Check className="size-3" />}
                      </div>
                      <span className="truncate">{fac}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
              <div>
                <div className="text-xs font-semibold text-foreground">Status Ruangan Aktif</div>
                <div className="text-[10px] text-muted-foreground">
                  Ruangan aktif dapat dipilih untuk penjadwalan kelas tatap muka
                </div>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <DialogFooter className="pt-2 flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium">
                {isSubmitting ? 'Menyimpan…' : editingId ? 'Perbarui Ruang' : 'Simpan Ruangan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
