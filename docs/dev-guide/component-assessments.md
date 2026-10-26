# Developer Guide: Component Assessments (Layer 2 Blueprint Builder)
# Arkanin Management System (AMS)

Panduan teknis dan arsitektur pengembangan untuk modul **Component Assessments / Blueprint Builder** (Layer 2 CBT).

---

## 1. Skema Database & Relasi Eloquent

Layer 2 Blueprint Builder mengelola struktur paket ujian bertingkat:
1. `ExamPackage` (`exam_packages`): Header paket ujian (nama, mode visual, metode scoring, durasi total, sistem minus).
2. `ExamSection` (`exam_sections`): Sub-tes di dalam paket (sort order, mode transisi, durasi istirahat, timer section).
3. `exam_section_questions`: Tabel pivot relasi Many-to-Many antara `exam_sections` dan `questions` dengan kolom urutan `sort_order`.

### Mandatory Audit Columns & Trait
Seluruh tabel wajib memiliki dan memelihara kolom audit:
- `created_at`, `created_by`, `updated_at`, `updated_by`
- `row_status` (1 = aktif, 0 = soft deleted)
- Di-handle secara otomatis oleh trait `App\Traits\UserStamps` pada saat operasi Eloquent `create` dan `update`.

### PostgreSQL Optimizations & Indexes
Migration: `2026_10_26_000003_upgrade_exam_packages_and_sections_for_blueprint_builder.php`
- `idx_exam_packages_visual_scoring` pada `(visual_mode, scoring_mode, row_status)` untuk query filter instan.
- `idx_exam_packages_creator` & `idx_exam_packages_editor` pada kolom audit `created_by` dan `updated_by`.
- `idx_exam_sections_pkg_order` pada `(exam_package_id, sort_order)` untuk penyusunan subtes berurutan tanpa filesort overhead.
- `idx_exam_sec_q_pivot` pada `(exam_section_id, question_id)` dengan unique constraint.

---

## 2. Backend Architecture (`App\Domain\CBT\ExamBlueprintController`)

### Atomic Transaction Execution
Penyimpanan blueprint paket beserta seluruh child sub-tes dilakukan di dalam `DB::transaction()` untuk menjamin integritas data (ACID). Jika salah satu sub-tes gagal divalidasi, seluruh operasi di-rollback.

```php
DB::transaction(function () use ($validated, $user) {
    $blueprint = ExamPackage::create([
        'name' => $validated['name'],
        'visual_mode' => $validated['visual_mode'],
        'scoring_mode' => $validated['scoring_mode'],
        'negative_marking' => $validated['negative_marking'] ?? false,
        'duration_minutes' => $validated['duration_minutes'],
        'level' => $validated['level'] ?? 'all',
        'randomize' => $validated['randomize'] ?? false,
        'row_status' => 1,
    ]);

    foreach ($validated['sections'] as $sec) {
        $blueprint->sections()->create([
            'subject' => $sec['subject'],
            'sort_order' => $sec['sort_order'],
            'transition_mode' => $sec['transition_mode'] ?? 'direct_continuous',
            'break_duration_seconds' => $sec['break_duration_seconds'] ?? 0,
            'section_timer_minutes' => $sec['section_timer_minutes'] ?? null,
            'row_status' => 1,
        ]);
    }
});
```

### OpenAPI / Swagger Annotations
Controller dilengkapi anotasi L5-Swagger / zircote/swagger-php:
- Path: `GET`, `POST`, `PUT`, `DELETE` `/api/v1/assessment/blueprints`
- Response schemas: `BlueprintResource`, `SectionResource`
- Header authentication: `BearerToken`

---

## 3. Frontend Architecture (`apps/web`)

### View Component
- File: `apps/web/src/components/admin/views/ComponentAssessments/view.tsx`
- Layout Registration: `apps/web/src/components/admin/layout/AdminLayout.tsx` di key `'component-assessments'`.
- Theme & Style: Glassmorphism (`backdrop-blur-md`, subtle border glows, dynamic badges).

### Visual Mode & Scoring Preview Engine
Frontend menyediakan live badge indikator yang merefleksikan mode visual CBT (BKN CAT, UTBK, AKM, OSN, OMI) dan kalkulasi estimasi total waktu ujian dari akumulasi sub-tes.

### Form State Handling
- Mendukung penambahan dinamis sub-tes dengan reordering (*drag or sort buttons*).
- Menghitung agregat total butir soal dan durasi langsung di sisi klien sebelum submit.
- Validasi instan form: minimal 1 sub-tes, durasi $> 0$, dan nama blueprint unik.
