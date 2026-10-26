# Developer Guide: Installment & Drip Lock (Layer 3)
# Arkanin Management System (AMS)

Panduan teknis dan arsitektur pengembangan untuk modul **Installment Tracking & Drip Payment Lock**.

---

## 1. Skema Database & Relasi Eloquent

1. `ProgramInstallment` (`program_installments`): Definisi termin per program (jumlah cicilan, nominal, jatuh tempo offset, milestone section).
2. `EnrollmentInstallmentTracker` (`enrollment_installment_trackers`): Catatan riwayat pembayaran per termin per enrollment siswa.

### Mandatory Audit Columns
Semua tabel menyertakan:
- `id`, `row_status`, `created_at`, `created_by`, `updated_at`, `updated_by`
- Di-handle secara otomatis oleh trait `App\Traits\UserStamps`.

---

## 2. Gatekeeper Logic (Drip Access Interceptor)

Dalam menentukan apakah siswa berhak mengakses suatu komponen materi program:
1. Periksa relasi `ProgramAccess` siswa.
2. Periksa apakah `ProgramInstallment` memiliki `milestone_section_id`.
3. Jika modul yang diminta berada di atas milestone dan terdapat `EnrollmentInstallmentTracker` yang berstatus `pending` dan telah melewati `due_date`, interceptor melempar pengecualian `HttpException(403, 'Content locked due to overdue installment payment')`.
4. Jika tracker memiliki status `bypassed` (diverifikasi oleh admin cabang melalui `bypassed_by`), interceptor mengizinkan akses.

---

## 3. Frontend Architecture

- Tampilan Admin: `apps/web/src/components/admin/views/Enrollments/view.tsx`
- Layout Key: `'enrollments'`
- Menyediakan visualisasi progress pelunasan cicilan, tagihan jatuh tempo, dan trigger modal bypass.
