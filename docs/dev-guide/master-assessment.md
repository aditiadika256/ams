# Developer Guide: Master Assessment (Layer 1 CBT)
# Arkanin Management System (AMS)

Panduan arsitektur teknis dan pengembangan bagi pengembang backend dan frontend pada modul **Master Assessment** (Layer 1 CBT).

---

## 1. Arsitektur Data & Model

Layer 1 CBT terdiri dari dua entitas utama:
1. `AssessmentContext` (`assessment_contexts`): Model wacana/stimulus induk.
2. `Question` (`questions`): Model butir soal yang memiliki relasi `belongsTo(AssessmentContext::class, 'context_id')`.

### Standarisasi Audit & Performance
- **Standard Audit Trail**: Kolom `created_at`, `created_by`, `updated_at`, `updated_by`, dan `row_status` wajib ada dan di-handle otomatis melalui trait `App\Traits\UserStamps`.
- **Indexing Strategy**:
  - `idx_assessment_contexts_creator` pada `created_by`
  - `idx_assessment_contexts_editor` pada `updated_by`
  - `idx_assessment_contexts_status` pada `(row_status, created_at)` untuk pagination cepat data aktif.
  - Foreign key `context_id` pada tabel `questions` di-index untuk efisiensi kueri pemanggilan butir soal per wacana.

---

## 2. API & Routing

- Controller: `App\Domain\CBT\AssessmentContextController`
- Resource URI: `/api/v1/assessment/contexts`
- Middleware: `auth:sanctum`
- Validasi: Form Requests atau controller validation dengan sanitasi input teks kaya dan URL media.

---

## 3. Frontend Integration Guidelines

1. **Rendering LaTeX**:
   - Gunakan pustaka KaTeX (`katex` atau `react-katex`) untuk me-render rumus TeX yang diawali dan diakhiri dengan delimiter `$$` atau `$`.
2. **Split View Layout**:
   - Pada antarmuka ujian CBT siswa, jika soal memiliki `context_id`, render layar dalam mode belah dua:
     - Sisi Kiri: Wacana induk yang dapat di-scroll secara independen.
     - Sisi Kanan: Nomor butir soal, opsi jawaban (A, B, C, D, E), dan tombol navigasi.
3. **PWA Caching**:
   - Seluruh payload wacana dan gambar/audio di-cache ke IndexedDB lokal siswa sebelum timer ujian dimulai untuk menjamin pengerjaan bebas lag dan tahan gangguan jaringan.
