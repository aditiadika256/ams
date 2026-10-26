# Developer Guide: Physical Rooms (Schedule Tool)
# Arkanin Management System (AMS)

Panduan arsitektur teknis dan pengembangan modul **Physical Rooms Inventory**.

---

## 1. Skema Database & Relasi Eloquent

Tabel: `physical_rooms`
- `branch_id`: Relasi ke kantor cabang `branches(id)`.
- `room_number`: Kode unik ruangan di tingkat cabang.
- `room_name`: Nama deskriptif ruangan.
- `capacity`: Integer batas maksimal kursi peserta.
- `facilities`: JSON list fitur pendukung.
- Standard Audit Columns: `created_at`, `created_by`, `updated_at`, `updated_by`, dan `row_status` dikelola oleh `App\Traits\UserStamps`.

---

## 2. PostgreSQL Indexing & Constraint Strategy

- Index composite: `(branch_id, is_active, row_status)` untuk query inventaris aktif per cabang tanpa table scan.
- Index audit: `(created_by)` dan `(updated_by)`.
- Unique check: `Rule::unique('physical_rooms')->where('branch_id', ...)->where('row_status', 1)` menjamin nomor ruangan unik per cabang untuk data aktif.

---

## 3. Frontend Architecture

- Tampilan Admin: `apps/web/src/components/admin/views/SchedulePhysicalRoom/view.tsx`
- Layout Key: `'schedule-physical-room'`
- Desain Glassmorphism dengan indikator kartu okupansi, badge fasilitas dinamis, dan modal CRUD.
