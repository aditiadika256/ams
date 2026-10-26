# Developer Guide: Database Manager (System & Maintenance)
# Arkanin Management System (AMS)

Panduan teknis dan operasional untuk modul **Database Manager & System Maintenance**.

---

## 1. Skema Database & Relasi Eloquent

Tabel: `database_maintenance_logs`
- `action`: Jenis rutinitas yang dijalankan (`clear_cache`, `reindex_transactions`, `vacuum_analyze`, `backup_snapshot`).
- `execution_time_ms`: Durasi eksekusi dalam milidetik.
- `status`: Enum status (`success`, `failed`, `running`).
- `output_details`: JSON detail log keluaran.
- `triggered_by`: Foreign key ke user aktor admin.
- Standar Kolom Audit: `created_at`, `created_by`, `updated_at`, `updated_by`, dan `row_status` dikelola otomatis oleh `App\Traits\UserStamps`.

---

## 2. PostgreSQL Cloud Optimizations

Semua query tabel metrics menggunakan optimasi non-blocking:
- Perhitungan row count cepat menggunakan PostgreSQL catalog view atau counting terisolasi.
- Seluruh eksekusi pemeliharaan tercatat di audit trail permanen untuk kepatuhan tata kelola data.

---

## 3. Frontend Architecture

- Tampilan Admin: `apps/web/src/components/admin/views/DatabaseManager/view.tsx`
- Layout Key: `'database-manager'`
- Menampilkan metrik grid dengan status pulse, action toolbar cepat, dan log timeline eksekusi.
