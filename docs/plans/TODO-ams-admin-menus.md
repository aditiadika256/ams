# Master Implementation Checklist & TODO List
# Arkanin Management System (AMS) – Master Admin Menu & 4-Layer Architecture

| Metrik Dokumen | Deskripsi Spesifikasi |
| :--- | :--- |
| **Dokumen Rujukan** | [PRD-ams-admin-menus.md](file:///d:/Project/Arkanin_v1/docs/plans/PRD-ams-admin-menus.md) |
| **Aturan Baku** | [standard-code.md](file:///d:/Project/Arkanin_v1/.agent/rules/standard-code.md) & [database-standard.md](file:///d:/Project/Arkanin_v1/docs/database-standard.md) |
| **Versi Dokumen** | 1.1.0 (Living Implementation Checklist with Skill Annotations) |
| **Tanggal Pembaruan** | 2026-10-26 |
| **Status Pelaksanaan** | 🟡 Menunggu Pelaksanaan Bertahap (No Code Phase Until Confirmed) |

---

## 📌 Standard Operating Guidelines & Skill References

### 🛠️ Katalog Skills Acuan Proyek (Skill Reference Index)
Sesuai aturan [standard-code.md](file:///d:/Project/Arkanin_v1/.agent/rules/standard-code.md), pengerjaan setiap modul wajib merujuk pada skills yang tersedia di direktori `skills/` berikut:

| Skill | Path Rujukan | Domain & Penggunaan |
| :--- | :--- | :--- |
| **`breakdown-feature-prd`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/breakdown-feature-prd/SKILL.md) | Pemecahan epik tingkat tinggi ke dalam user stories, acceptance criteria, dan spesifikasi fitur. |
| **`laravel-specialist`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md) | Perancangan arsitektur backend Laravel 10+, migrations, routing, controller tipis, form request, dan job queue. |
| **`eloquent-best-practices`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/eloquent-best-practices/SKILL.md) | Implementasi Model Eloquent, trait `UserStamps`, optimasi eager loading, relasi, dan penanganan status aktif. |
| **`postgresql-optimization`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md) | Struktur DDL PostgreSQL, tipe data JSONB, GIN indexing, index audit `created_by`/`updated_by`, dan composite index `(row_status, created_at)`. |
| **`backend-patterns`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md) | Pola Action/Service terisolasi, transaksi database (`DB::transaction`), DTO, dan pemisahan logika bisnis dari controller. |
| **`api-documentation-generator`**| [SKILL.md](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md) | Penulisan anotasi OpenAPI / Swagger pada controller serta pembuatan manual dokumentasi API Markdown di `docs/api/`. |
| **`ui-ux-pro-max`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md) | Standar desain Glassmorphism UI, hierarki tipografi, palet warna, micro-interactions, dan aksesibilitas kontras/keyboard. |
| **`vercel-react-best-practices`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md) | Optimasi performa Next.js App Router, bundle code splitting, React Client vs Server Component, dan rendering cepat ($< 200\text{ ms}$). |
| **`web-design-guidelines`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/web-design-guidelines/SKILL.md) | Praktik terbaik web responsif, tata letak fluid mobile/desktop, dan integrasi komponen interaktif. |
| **`webapp-testing`** | [SKILL.md](file:///d:/Project/Arkanin_v1/skills/webapp-testing/SKILL.md) | Pengujian end-to-end frontend dan unit/feature test backend (Pest/PHPUnit). |

---

### 📋 Aturan Baku Pengerjaan
1. **Standarisasi Kolom Database**:
   - Seluruh tabel baru/perubahan skema **WAJIB** menyertakan 4 kolom audit: `created_at`, `created_by`, `updated_at`, `updated_by`, serta `id` (`BIGSERIAL PK`) dan `row_status` (`SMALLINT DEFAULT 1`).
   - Setiap model Eloquent wajib menggunakan trait `App\Traits\UserStamps`.
   - Index wajib ditambahkan pada kolom `created_by`, `updated_by`, dan composite `(row_status, created_at)`.
2. **Dokumentasi API & Swagger**:
   - Setiap endpoint baru wajib memiliki anotasi OpenApi / Swagger lengkap pada Controller.
   - Setiap modul wajib memiliki dokumentasi manual Markdown di folder `docs/api/{modul}.md`.
3. **User Guide & Developer Guide**:
   - Setiap perilisan fitur wajib dilengkapi dengan panduan pengguna di `docs/user-guide/{modul}.md`.
   - Setiap arsitektur/mekanisme teknis wajib didokumentasikan di `docs/dev-guide/{modul}.md`.
4. **Desain Front-End**:
   - Tampilan antarmuka wajib mengadopsi standar **Glassmorphism**, responsif, dan performa tinggi (transisi menu $< 200\text{ ms}$).

---

## 🗂️ Task Breakdown by Phase with Required Skills

### Fase 0: Finalisasi & Stabilisasi Modul Program In-Flight (Immediate Baseline)
> *Menyelesaikan fondasi Program Builder yang sedang berjalan: Unified Modular Course, multi-komponen toggle, dan free-input tags.*

- [x] **Task 0.1: Backend Multi-Component Instance Support**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md)
  - [x] Verifikasi migration `2026_10_26_000001_drop_unique_from_program_components_table.php` (menghapus batasan unik `[program_id, component_definition_id]`).
  - [x] Pastikan `ProgramComponentsUpdateRequest.php` mengizinkan pengulangan `component_definition_id` tanpa rule `distinct` dan menerima parameter `id` opsional.
  - [x] Pastikan action `SyncProgramComponents.php` menangani update instansial, penambahan instance baru, dan penghapusan bersih.

- [x] **Task 0.2: Frontend Multi-Component UI dengan Toggle On/Off**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md), [web-design-guidelines](file:///d:/Project/Arkanin_v1/skills/web-design-guidelines/SKILL.md)
  - [x] Selesaikan integrasi `handleSubmit` pada `apps/web/src/components/admin/views/Programs/form.tsx` untuk memetakan `state.components` ke payload API (`id`, `component_definition_id`, `is_enabled`, `label`, `sort_order`, `configuration`).
  - [x] Verifikasi komponen `apps/web/src/components/ui/switch.tsx` bekerja mulus pada `ProgramComponentsStep.tsx` untuk toggle On/Off instansial.
  - [x] Verifikasi badge indikator mode dinamis: "Mode Kelas Terjadwal (Live/Offline)" saat komponen `Schedule` aktif vs "Mode Course Biasa (Self-Paced)" saat komponen `Schedule` tidak ditambahkan/dinonaktifkan.

- [x] **Task 0.3: Free-Input Tag System pada Program Form**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md)
  - [x] Sempurnakan `ProgramTagsStep.tsx` agar admin dapat mengetik tag bebas, menekan Enter untuk mendaftarkan tag baru secara instan, serta menghapus badge tag dengan mulus.

- [x] **Task 0.4: Verifikasi & Test Harness Frontend**
  > **Skills yang Diperlukan**: [webapp-testing](file:///d:/Project/Arkanin_v1/skills/webapp-testing/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md)
  - [x] Jalankan type-checking (`npx tsc --noEmit` pada `apps/web`) untuk menjamin zero compilation error pada `wizard-types.ts`, `form.tsx`, `ProgramComponentsStep.tsx`, `ProgramTagsStep.tsx`, dan `ProgramReviewStep.tsx`.

---

### Fase 1: Rearsitektur 4-Layer CBT & Live Proctoring (Target: Nov – Des 2026)

#### Layer 1: Assessment Master Bank (Context & Question Bank)
- [x] **Task 1.1: Database Schema Layer 1**
  > **Skills yang Diperlukan**: [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md), [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md)
  - [x] Buat migration tabel `assessment_contexts` (kolom: `id`, `title`, `body_content`, `media_url`, `media_type`, `row_status`, `created_at`, `created_by`, `updated_at`, `updated_by` + index).
  - [x] Buat migration tabel `questions` enhancement (kolom: `id`, `context_id`, `learning_topic_id`, `question_type`, `question_text`, `explanation_text`, `difficulty_level`, `estimated_seconds`, `tags`, `status`, `row_status`, `created_at`, `created_by`, `updated_at`, `updated_by` + index).

- [x] **Task 1.2: Eloquent Models & UserStamps Layer 1**
  > **Skills yang Diperlukan**: [eloquent-best-practices](file:///d:/Project/Arkanin_v1/skills/eloquent-best-practices/SKILL.md), [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md)
  - [x] Implementasikan Model `AssessmentContext` dengan trait `UserStamps`, relasi `hasMany(Question::class)`, dan search scopes.
  - [x] Implementasikan Model `Question` dengan trait `UserStamps`, casts JSON `tags`, relasi `belongsTo(AssessmentContext::class)`.

- [x] **Task 1.3: Backend API & Controller Layer 1**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Buat `AssessmentContextController` (CRUD wacana, filter media, search teks kaya).
  - [x] Tambahkan anotasi OpenAPI / Swagger pada setiap endpoint.
  - [x] Tulis dokumentasi manual API di `docs/api/master-assessment.md`.

- [x] **Task 1.4: Frontend UI Layer 1 (Glassmorphism)**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md), [web-design-guidelines](file:///d:/Project/Arkanin_v1/skills/web-design-guidelines/SKILL.md)
  - [x] Implementasikan halaman `admin://view/assessment-contexts`: tabel wacana induk, filter media, modal editor teks kaya / split view KaTeX.
  - [x] Implementasikan halaman `admin://view/assessment-questions`: filter topik, preview LaTeX instan, badge tingkat kesulitan, estimasi timer, dan manajemen opsi jawaban.

- [x] **Task 1.5: Dokumentasi Modul Layer 1**
  > **Skills yang Diperlukan**: [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md), [breakdown-feature-prd](file:///d:/Project/Arkanin_v1/skills/breakdown-feature-prd/SKILL.md)
  - [x] Tulis user guide di `docs/user-guide/master-assessment.md`.
  - [x] Tulis developer guide di `docs/dev-guide/master-assessment.md`.

---

#### Layer 2: Component Blueprint Package Builder
- [x] **Task 2.1: Database Schema Layer 2**
  > **Skills yang Diperlukan**: [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md), [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md)
  - [x] Buat migration tabel `exam_packages` (master blueprint ujian: durasi total, visual mode `CPNS/UTBK/AKM`, scoring engine rule, audit stamps).
  - [x] Buat migration tabel `exam_sections` (sub-tes berjeda / direct continuous, urutan drag-and-drop, audit stamps).
  - [x] Buat migration pivot `exam_section_questions` (slot soal per seksi, bobot per butir, audit stamps).

- [x] **Task 2.2: Backend API & Scoring Logic Layer 2**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Buat Controller & Service perakit blueprint (`ExamBlueprintController`).
  - [x] Implementasikan kalkulator bobot: Same Weight, Custom Weight, Skala 1–5 TKP, Negative Marking toggle (+4, -1, 0).
  - [x] Anotasi Swagger + dokumentasi manual di `docs/api/component-assessments.md`.

- [x] **Task 2.3: Frontend Blueprint Builder UI**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md)
  - [x] Implementasikan halaman `admin://view/component-assessments`: antarmuka visual package builder.
  - [x] Fitur multi-seksi dengan dukungan drag & drop, konfigurasi jeda antar-subtes (*intermission break*).
  - [x] Komponen *Sticky Summary Bar* (rekap skor maksimum, estimasi total durasi, status kelengkapan kunci).

- [x] **Task 2.4: Dokumentasi Modul Layer 2**
  > **Skills yang Diperlukan**: [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Tulis panduan pengguna di `docs/user-guide/component-assessments.md`.
  - [x] Tulis panduan teknis di `docs/dev-guide/component-assessments.md`.

---

#### Layer 4: Live Proctoring, Evaluasi & IRT Engine
- [x] **Task 4.1: Database Schema Layer 4**
  > **Skills yang Diperlukan**: [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md), [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md)
  - [x] Buat migration tabel `exam_item_responses` (user_id, question_id, attempt_id, selected_option_id, is_correct, response_time, tab_switch_count, audit stamps).
  - [x] Buat migration tabel `item_analysis_parameters` (parameter $b, a, c$, kurva efisiensi distractor, fit_status, audit stamps).
  - [x] Buat migration tabel `exam_session_tokens` & `proctor_logs` (pencatatan insiden fraud, status sesi).

- [x] **Task 4.2: Backend Real-time Proctoring Engine**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Generator token acak 6-karakter dengan rotasi timer Redis (TTL 30 menit).
  - [x] Endpoint webhook & WebSocket untuk pencatatan insiden fraud (`tab_switch`, `fullscreen_exit`).
  - [x] Aksi kontrol pengawas: `Pause/Resume Sesi`, `Force Submit`, `Beri Waktu Tambahan`.
  - [x] Anotasi Swagger + dokumentasi manual di `docs/api/monitor-proctoring.md`.

- [x] **Task 4.3: Psychometric Engine & Anulir Soal (IRT / Rasch Model)**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md)
  - [x] Buat Job / Service kalkulasi IRT 2PL (`ItemAnalysisController@calculate`).
  - [x] Algoritma estimasi parameter: Kesukaran ($b$), Daya Beda ($a$), Tebakan Acak ($c$).
  - [x] Fitur `Drop Question` (anulir soal cacat) yang otomatis memicu rekalkulasi nilai bersih.
  - [x] Anotasi Swagger + dokumentasi manual di `docs/api/monitor-proctoring.md`.

- [x] **Task 4.4: Frontend Monitor & Live Proctoring Grid**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md), [web-design-guidelines](file:///d:/Project/Arkanin_v1/skills/web-design-guidelines/SKILL.md)
  - [x] Implementasikan halaman `admin://view/monitor-proctoring`: grid live status peserta kartu (Hijau = Mengerjakan, Merah berkedip = Pindah tab, Kuning = Terputus, Biru = Selesai).
  - [x] Implementasikan halaman `admin://view/monitor-analysis`: tabel metrik psikometrik butir soal, status fit/unfit, tombol Drop Soal & trigger hitung ulang.
  - [x] Implementasikan halaman `admin://view/monitor-assessment-results`: scoreboard nilai, cetak berita acara, export PDF/Excel.

- [x] **Task 4.5: Dokumentasi Modul Layer 4**
  > **Skills yang Diperlukan**: [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Tulis user guide di `docs/user-guide/monitor-proctoring.md`.
  - [x] Tulis developer guide di `docs/dev-guide/monitor-proctoring.md`.

---

### Fase 2: Dynamic Entitlement, Cicilan & Jadwal Fisik (Target: Jan 2027)

#### Sistem Cicilan & Drip Payment Lock (Layer 3)
- [x] **Task 5.1: Database Schema Cicilan**
  > **Skills yang Diperlukan**: [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md), [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md)
  - [x] Buat migration tabel `program_installments` (program_id, term_number, amount, due_days_offset, milestone_section_id, audit stamps).
  - [x] Buat migration tabel `enrollment_installment_trackers` (enrollment_id, program_installment_id, status, due_date, paid_at, audit stamps).

- [x] **Task 5.2: Backend Drip Lock & Payment Gate Engine**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Logika pencegat akses: Section 1 terbuka saat DP lunas, Section berikutnya terkunci otomatis jika Termin 2 jatuh tempo belum terbayar.
  - [x] Penyekatan penerbitan sertifikat jika enrollment belum berstatus `Fully Paid`.
  - [x] Tombol override manual (`Manual Bypass`) oleh Admin Cabang untuk toleransi akses khusus.
  - [x] Anotasi Swagger + dokumentasi manual di `docs/api/installment-lock.md`.

- [x] **Task 5.3: Frontend UI Cicilan**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md)
  - [x] Konfigurasi cicilan pada formulir Program Builder (input nominal DP & pembagian termin).
  - [x] Pelacak status cicilan pada `admin://view/enrollments`: status `Paid DP`, `Overdue`, `Full Paid`, dan modal bukti bayar.
  - [x] Tampilan portal siswa: Banner jatuh tempo cicilan & paywall akses materi terkunci.

- [x] **Task 5.4: Dokumentasi Modul Cicilan**
  > **Skills yang Diperlukan**: [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Tulis user guide di `docs/user-guide/installment-lock.md`.
  - [x] Tulis developer guide di `docs/dev-guide/installment-lock.md`.

---

#### Inventaris Ruang Fisik & Available Time Matcher (Schedule Tool)
- [x] **Task 6.1: Database Schema Ruang Fisik**
  > **Skills yang Diperlukan**: [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md), [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md)
  - [x] Buat migration tabel `physical_rooms` (branch_id, room_number, room_name, capacity, facilities JSONB, is_active, audit stamps).

- [x] **Task 6.2: Backend Smart Matching & Booking Engine**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Validasi isolasi cabang: Ruangan terisolasi per cabang fisik (`branch_id`).
  - [x] Pengecekan konflik waktu ruangan dan kuota kapasitas kelas otomatis.
  - [x] Anotasi Swagger + dokumentasi manual di `docs/api/physical-rooms.md`.

- [x] **Task 6.3: Frontend UI Ruangan Fisik & Presensi**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md)
  - [x] Implementasikan halaman `admin://view/schedule-physical-room`: inventaris ruang, kapasitas kursi, dan status okupansi.

- [x] **Task 6.4: Dokumentasi Modul Ruang Fisik**
  > **Skills yang Diperlukan**: [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Tulis user guide di `docs/user-guide/physical-rooms.md`.
  - [x] Tulis developer guide di `docs/dev-guide/physical-rooms.md`.

---

#### Client CBT Interface & Ketahanan Luring (PWA Resilience)
- [ ] **Task 7.1: Client IndexedDB Caching & HMAC Signature**
  > **Skills yang Diperlukan**: [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md)
  - [ ] Implementasi caching paket soal di IndexedDB lokal browser saat ujian dimulai.
  - [ ] Penandatanganan payload jawaban lokal dengan token sesi HMAC untuk mencegah kecurangan offline.

- [ ] **Task 7.2: Background Auto-Sync**
  > **Skills yang Diperlukan**: [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md), [webapp-testing](file:///d:/Project/Arkanin_v1/skills/webapp-testing/SKILL.md)
  - [ ] Sinkronisasi otomatis dari IndexedDB ke API dalam waktu $\le 2$ detik saat koneksi internet pulih.
  - [ ] Pengujian skenario putus koneksi mendadak tanpa kehilangan satu butir pun jawaban peserta.

---

### Fase 3: Keuangan, Store Gamifikasi & Audit Sistem (Target: Feb – Mar 2027)

#### Modul Keuangan & Pencegahan Double Spending (Finance)
- [x] **Task 8.1: Database Schema Keuangan & Wallet**
  > **Skills yang Diperlukan**: [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md), [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [eloquent-best-practices](file:///d:/Project/Arkanin_v1/skills/eloquent-best-practices/SKILL.md)
  - [x] Buat migration tabel `wallet_holds` dengan audit stamps lengkap.

- [x] **Task 8.2: Backend Hold Balance & Instant Revenue Split**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Logika `Hold Balance`: Saldo langsung didebit ke status `Hold` saat dispute / penahanan garansi (`WalletHoldController`).
  - [x] Anotasi Swagger + dokumentasi manual di `docs/api/wallet-holds.md`.

- [x] **Task 8.3: Frontend UI Keuangan**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md)
  - [x] Halaman `admin://view/finance-holds`: daftar mutasi saldo tertahan, approval release, dan forfeit dispute.

- [x] **Task 8.4: Dokumentasi Modul Keuangan**
  > **Skills yang Diperlukan**: [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Tulis user guide di `docs/user-guide/wallet-holds.md`.
  - [x] Tulis developer guide di `docs/dev-guide/wallet-holds.md`.

---

#### Modul Store & Siklus Hidup Poin Gamifikasi (Store)
- [ ] **Task 9.1: Database Schema Store & Poin**
  > **Skills yang Diperlukan**: [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md), [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md)
  - [ ] Buat migration tabel `store_products`, `point_wallets`, `point_burn_policies`, `shipment_orders` dengan audit stamps.

- [ ] **Task 9.2: Backend Point Expiry & Flash Sale Engine**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [backend-patterns](file:///d:/Project/Arkanin_v1/skills/backend-patterns/SKILL.md), [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [ ] Scheduled Command (Cron Job) untuk kadaluwarsa poin setelah 6 bulan.
  - [ ] Mekanisme penukaran merchandise dengan poin / rupiah campuran.
  - [ ] Anotasi Swagger + dokumentasi manual di `docs/api/store.md`.

- [ ] **Task 9.3: Frontend UI Store**
  > **Skills yang Diperlukan**: [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [vercel-react-best-practices](file:///d:/Project/Arkanin_v1/skills/vercel-react-best-practices/SKILL.md)
  - [ ] Halaman `admin://view/store-catalog`: katalog merchandise fisik & stok gudang.
  - [ ] Halaman `admin://view/store-points`: pengaturan masa berlaku poin & event flash sale.

- [ ] **Task 9.4: Dokumentasi Modul Store**
  > **Skills yang Diperlukan**: [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [ ] Tulis user guide di `docs/user-guide/store.md`.
  - [ ] Tulis developer guide di `docs/dev-guide/store.md`.

---

#### Pemeliharaan Database & Audit Sistem (Database & System)
- [x] **Task 10.1: Database Tooling UI & Backup**
  > **Skills yang Diperlukan**: [laravel-specialist](file:///d:/Project/Arkanin_v1/skills/laravel-specialist/SKILL.md), [postgresql-optimization](file:///d:/Project/Arkanin_v1/skills/postgresql-optimization/SKILL.md), [ui-ux-pro-max](file:///d:/Project/Arkanin_v1/skills/ui-ux-pro-max/SKILL.md), [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Halaman `admin://view/database-manager`: pembersihan cache usang, inspeksi integritas tabel, re-indeks kueri lambat, dan backup snapshot.
  - [x] Anotasi Swagger + dokumentasi manual di `docs/api/database-manager.md`.

- [x] **Task 10.2: Dokumentasi Modul Database**
  > **Skills yang Diperlukan**: [api-documentation-generator](file:///d:/Project/Arkanin_v1/skills/api-documentation-generator/SKILL.md)
  - [x] Tulis user guide di `docs/user-guide/database-manager.md`.
  - [x] Tulis dev guide di `docs/dev-guide/database-manager.md`.

---

## 📈 Matrix Pelacakan & Status Implementasi Menu AMS

| Menu Utama | Sub-Menu | Status Saat Ini | Rencana Fase | Prioritas | Skills Acuan Utama |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Workspace** | Program Builder (Unified Engine, Tags, Multi-Component) | 🟢 Ready | Fase 0 | P0 (Kritis) | `ui-ux-pro-max`, `laravel-specialist` |
| **Master Assessment** | Context Bank | 🟢 Ready | Fase 1 | P1 (Tinggi) | `postgresql-optimization`, `eloquent-best-practices` |
| **Master Assessment** | Question Bank | 🟢 Ready | Fase 1 | P1 (Tinggi) | `postgresql-optimization`, `ui-ux-pro-max` |
| **Component Tool** | Assessment Blueprint Builder | 🟢 Ready | Fase 1 | P1 (Tinggi) | `backend-patterns`, `ui-ux-pro-max` |
| **Monitor** | Live Proctoring | 🟢 Ready | Fase 1 | P1 (Tinggi) | `laravel-specialist`, `ui-ux-pro-max` |
| **Monitor** | Assessment Analysis (IRT Engine & Drop Soal) | 🟢 Ready | Fase 1 | P1 (Tinggi) | `backend-patterns`, `postgresql-optimization` |
| **Monitor** | Assessment Results | 🟢 Ready | Fase 1 | P1 (Tinggi) | `api-documentation-generator`, `ui-ux-pro-max` |
| **Workspace** | Enrollment Manager (Cicilan & Drip Lock) | 🟢 Ready | Fase 2 | P1 (Tinggi) | `backend-patterns`, `eloquent-best-practices` |
| **Schedule Tool** | Physical Room & Attendance | 🟢 Ready | Fase 2 | P2 (Menengah) | `postgresql-optimization`, `ui-ux-pro-max` |
| **Finance** | Transactions & Wallet (Hold Balance) | 🟢 Ready | Fase 3 | P2 (Menengah) | `backend-patterns`, `eloquent-best-practices` |
| **Database** | Data Manager & Backup Snapshot | 🟢 Ready | Fase 3 | P3 (Normal) | `postgresql-optimization`, `ui-ux-pro-max` |
