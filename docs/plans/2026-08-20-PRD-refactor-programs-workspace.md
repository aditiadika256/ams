# Product Requirements Document (PRD)

# Refactor Master Program dan User Workspace

| Informasi | Nilai |
| --- | --- |
| Project | Arkanin Education Platform |
| Versi | 2.0 |
| Tanggal | 20 Agustus 2026 |
| Status | Draft — keputusan inti tervalidasi |
| Strategi rilis | Big-bang, khusus lingkungan development |

---

## 1. Ringkasan Eksekutif

Arkanin akan mengganti mekanisme Master Program yang bergantung pada
`ProgramLevel` dan `ProgramType` menjadi arsitektur modular:

```text
Program
 ├── Tag
 ├── Component
 ├── Collection
 └── Batch
      └── Session

User
 └── ProgramAccess
      └── Personal Workspace
```

`Program` menjadi definisi produk pendidikan yang dapat dijual atau diberikan
kepada user. Perilakunya tidak lagi ditentukan oleh satu tipe statis, melainkan
oleh kumpulan komponen yang diaktifkan. Pelaksanaan program terjadwal dikelola
melalui `Batch` dan `Session`.

Di sisi user, program yang dimiliki tidak lagi diturunkan dari order berstatus
lunas. Semua hak akses berasal dari `ProgramAccess` dan disajikan sebagai satu
Workspace personal. Pembayaran, voucher, enrollment code, program gratis,
pemberian admin, dan paket memakai mekanisme grant yang sama.

Karena aplikasi masih development dan belum digunakan di production, refactor
dilakukan secara big-bang. Setelah cutover tidak ada dual-read, dual-write,
compatibility layer, atau kontrak `program_level`/`program_type`.

---

## 2. Latar Belakang

### 2.1 Kondisi saat ini

```text
ProgramLevel → ProgramType → Program → OrderItem
```

- `programs` menyimpan nilai legacy `level`/`type` dan foreign key lookup.
- Form Program mewajibkan satu level dan satu tipe.
- Katalog dan checkout masih menampilkan level/type.
- Dashboard student menyimpulkan program yang dimiliki dari paid order.
- Curriculum, CBT, mentor, order, dan program belum disatukan oleh lifecycle
  program dan entitlement yang konsisten.
- Belum ada sumber kebenaran akses untuk pembayaran, voucher, code, dan grant.

### 2.2 Masalah

- Program campuran seperti buku + ebook + tryout + bimbel sulit dimodelkan.
- Tipe menjadi klasifikasi sekaligus pemicu business logic.
- Penambahan layanan baru mengharuskan perubahan tipe atau struktur Program.
- Program yang sama sulit dijalankan pada beberapa batch atau diikuti ulang.
- Kepemilikan terlalu terikat pada transaksi pembayaran.
- Status katalog, pelaksanaan, akses, dan tampilan user berpotensi tercampur.
- Riwayat pemberian atau pencabutan akses sulit diaudit.

---

## 3. Visi Produk

Membangun **Education Program Platform**:

> Semua layanan yang dikonsumsi user diperlakukan sebagai Program. Kapabilitas
> disusun dari Component, pelaksanaan diatur melalui Batch dan Session, sedangkan
> hak akses dikelola oleh ProgramAccess dan ditampilkan dalam Personal Workspace.

Contoh yang harus dapat dibuat tanpa menambah tipe baru:

- Persiapan TKA SD.
- Pelatihan Mentor.
- Olimpiade Matematika.
- Tryout Nasional.
- Ebook Matematika Dasar.
- Paket TKA Premium berisi buku, ebook, tryout, bimbel, dan sertifikat.

---

## 4. Tujuan

### 4.1 Tujuan produk

1. Menjadikan Program sebagai unit bisnis utama.
2. Mengganti level/type dengan tag yang fleksibel.
3. Menentukan perilaku Program melalui komponen.
4. Mendukung Program tunggal dan collection/bundle.
5. Mendukung beberapa Batch per Program dan repeat enrollment.
6. Menyatukan seluruh sumber akses melalui ProgramAccess.
7. Menyediakan satu Workspace personal otomatis per user.
8. Memisahkan lifecycle katalog, pelaksanaan, entitlement, dan preferensi UI.
9. Menyediakan audit trail untuk perubahan penting dan pemberian akses.

### 4.2 Tujuan teknis

1. Menghapus seluruh ketergantungan pada ProgramLevel/ProgramType.
2. Menyediakan schema ternormalisasi dengan constraint jelas.
3. Memisahkan API katalog, administrasi, dan Workspace.
4. Membuat grant/revoke akses idempotent dan dapat diaudit.
5. Menghindari generic JSON sebagai tempat seluruh data domain.
6. Mengintegrasikan order, curriculum, CBT, mentor, dan permission yang relevan.

---

## 5. Non-Goal

- Workspace organisasi/sekolah/team multi-user.
- Marketplace pihak ketiga dan revenue sharing mentor.
- Subscription lintas Program.
- Dynamic plugin engine yang mengeksekusi kode dari database.
- Learning path adaptif berbasis AI.
- Payment gateway baru.
- Migrasi data production atau zero-downtime deployment.
- Kompatibilitas field atau endpoint level/type lama.
- Redesign seluruh halaman marketing di luar Program dan Workspace.

---

## 6. Keputusan yang Dikunci

| Area | Keputusan |
| --- | --- |
| Strategi refactor | Big-bang pada satu cutover development |
| Level/type | Dihapus, tanpa compatibility field |
| Klasifikasi | Tag; tidak memicu business logic |
| Perilaku | Component Definition + Program Component |
| Workspace | Personal dan otomatis per user |
| Tabel Workspace | Tidak dibuat pada tahap ini |
| Sumber Workspace | Projection dari ProgramAccess |
| Repeat enrollment | Beberapa ProgramAccess diperbolehkan |
| Pelaksanaan | Program → Batch → Session |
| Mentor | Ditugaskan ke Session |
| Penghapusan | Data referensial diarsipkan setelah digunakan |

### 6.1 Mengapa tidak ada tabel Workspace

Setiap user selalu memiliki tepat satu Workspace personal, tanpa anggota,
transfer kepemilikan, atau tenant. Tabel satu-ke-satu tidak menambah state bisnis.

```text
Authenticated User
      ↓
ProgramAccess milik user
      ↓
Program + Batch + Progress + Jadwal
      ↓
Workspace UI
```

Workspace organisasi kelak harus menjadi initiative terpisah dengan tenant,
membership, dan role internal.

---

## 7. Persona dan Hak Utama

### Member/Student

- Menjelajahi, membeli, atau menukarkan akses Program.
- Melihat semua entitlement pada Workspace.
- Mengakses component sesuai status dan periode akses.
- Mengikuti Batch/Session dan melihat progress.
- Mengarsipkan atau memulihkan kartu Workspace.

### Mentor

- Melihat Session yang ditugaskan.
- Melihat peserta hanya dalam scope assignment.
- Mengelola aktivitas Session sesuai permission.

### Admin/Staff

- Mengelola Program, Tag, Component, Collection, Batch, dan Session.
- Memberikan, memperpanjang, menangguhkan, atau mencabut akses sesuai permission.
- Menetapkan mentor dan melihat audit operasional.

### Owner

- Mengelola role/permission dan tindakan sensitif.

Satu user dapat memiliki beberapa role. Authorization berbasis permission/policy,
bukan nama role yang di-hard-code.

---

## 8. Glosarium

| Istilah | Definisi |
| --- | --- |
| Program | Definisi produk/layanan pendidikan reusable |
| Tag | Klasifikasi untuk search/filter; tanpa business logic |
| Component Definition | Registry kapabilitas yang didukung aplikasi |
| Program Component | Aktivasi dan konfigurasi component pada Program |
| Collection | Relasi Program paket dengan child Program |
| Batch | Pelaksanaan/cohort Program pada periode tertentu |
| Session | Satu kegiatan terjadwal dalam Batch |
| ProgramAccess | Entitlement/enrollment individual user |
| Workspace | Tampilan personal dari ProgramAccess user |
| Grant | Proses membuat/mengaktifkan ProgramAccess |

---

## 9. Model Domain Target

```text
USER
 ├── ROLE / PERMISSION
 └── PROGRAM ACCESS ───────────────────────────┐
      ├── source                               │
      ├── optional batch                       │
      ├── lifecycle                            │
      └── workspace preferences                │
                                               │
PROGRAM ◄──────────────────────────────────────┘
 ├── TAG (many-to-many)
 ├── COMPONENT (many-to-many + config)
 ├── CHILD PROGRAM (self many-to-many)
 └── BATCH
      └── SESSION
           ├── MENTOR ASSIGNMENT
           ├── ATTENDANCE
           ├── MATERIAL
           ├── ASSESSMENT
           └── CERTIFICATE
```

### Batas entitas

- Program: **apa yang ditawarkan**.
- Component: **kapabilitas yang tersedia**.
- Batch: **kapan dan dalam cohort mana Program dijalankan**.
- Session: **kegiatan pada waktu tertentu**.
- ProgramAccess: **siapa yang berhak atas instance Program**.
- Workspace: **bagaimana akses user disajikan**.

---

## 10. Functional Requirements — Master Program

### FR-PROG-001 Membuat Program

Admin berpermission dapat membuat draft dengan data minimum:

- Nama dan slug unik.
- Deskripsi singkat dan lengkap.
- Thumbnail/cover.
- Base price IDR.
- Visibility dan status.

### FR-PROG-002 Mengubah Program

- Harga tidak boleh negatif.
- Perubahan tidak boleh mengubah snapshot Order historis.
- Penghapusan component tidak boleh menghapus aktivitas user otomatis.
- Perubahan kritis masuk audit log.

### FR-PROG-003 Lifecycle Program

```text
DRAFT → PUBLISHED → UNPUBLISHED → ARCHIVED
  └────────────────────────────→ ARCHIVED
```

- `DRAFT`: hanya admin; belum dapat diakuisisi normal.
- `PUBLISHED`: tampil sesuai visibility dan dapat diakuisisi.
- `UNPUBLISHED`: acquisition baru ditutup; akses lama tetap sesuai policy.
- `ARCHIVED`: tidak tampil di katalog; dapat direstore.
- Program yang direferensikan Order/Access tidak boleh hard-delete.

### FR-PROG-004 Visibility

- `PUBLIC`: katalog publik.
- `UNLISTED`: melalui tautan/code langsung.
- `PRIVATE`: admin grant atau rule internal.

### FR-PROG-005 Clone

Clone menyalin metadata, tag, dan component. Batch, Session, Access, transaksi,
progress, dan audit tidak ikut.

### FR-PROG-006 Form Admin

Flow form:

1. Informasi dasar.
2. Tag dan segmentasi.
3. Component dan konfigurasi.
4. Collection bila berupa paket.
5. Batch dan availability.
6. Review dan publish.

Field level/type tidak boleh muncul lagi.

---

## 11. Functional Requirements — Tag

### FR-TAG-001 Master Tag

Admin dapat membuat, mengubah nama, mengurutkan, menonaktifkan, dan mengarsipkan
tag. Contoh: `SD`, `SMP`, `SMA`, `TKA`, `UTBK`, `Matematika`, `Online`, `Premium`.

### FR-TAG-002 Aturan

- Relasi Program–Tag many-to-many.
- `code` unik, stabil, dan immutable setelah digunakan.
- Tag nonaktif tidak dapat ditambahkan ke Program baru.
- Tag lama tetap terlihat pada Program existing.
- Tag hanya untuk klasifikasi, filter, search, dan reporting.
- Backend dilarang memakai tag sebagai feature flag.

---

## 12. Functional Requirements — Component

### 12.1 Registry awal

| Code | Nama | Fungsi |
| --- | --- | --- |
| `material` | Material | Materi terstruktur |
| `video` | Video | Video on-demand/rekaman |
| `meeting` | Meeting | Pertemuan online/offline |
| `attendance` | Attendance | Presensi manual |
| `qr_attendance` | QR Attendance | Presensi QR |
| `assessment` | Assessment | Tryout/kuis/ujian |
| `assignment` | Assignment | Tugas dan submission |
| `certificate` | Certificate | Penerbitan sertifikat |
| `discussion` | Discussion | Forum |
| `download` | Download | File unduhan |
| `shipping` | Shipping | Produk fisik |
| `consultation` | Consultation | Konsultasi terjadwal |
| `ai_tutor` | AI Tutor | Tutor AI |
| `live_chat` | Live Chat | Percakapan langsung |

### FR-COMP-001 Component Definition

Registry dikendalikan aplikasi. Menambah row tidak otomatis menciptakan fitur;
implementasi backend/frontend untuk code harus tersedia.

### FR-COMP-002 Aktivasi

Admin dapat mengaktifkan beberapa component dan mengatur urutan, status, label
opsional, dan configuration JSON tervalidasi berdasarkan schema component.

### FR-COMP-003 Dependency

- `qr_attendance` memerlukan `attendance`.
- `attendance` memerlukan `meeting` atau Session-enabled Program.
- `certificate` memerlukan completion rule.
- `shipping` memerlukan alamat dan fulfillment.
- `consultation` memerlukan Session/slot.

### FR-COMP-004 Menonaktifkan

- Penggunaan baru berhenti, data historis tidak dihapus.
- Aktivitas aktif memunculkan warning dan konfirmasi berpermission.
- Authorization tetap memeriksa ProgramAccess dan status component.

---

## 13. Functional Requirements — Collection

### FR-COLL-001 Program berisi Program

```text
Paket TKA Premium
 ├── Ebook TKA
 ├── Tryout Nasional
 ├── Bimbel TKA
 └── Webinar Strategi Ujian
```

### FR-COLL-002 Aturan relasi

- Parent-child eksplisit dan berurutan.
- Self-reference dan cycle langsung/tidak langsung ditolak.
- Child yang sama hanya sekali per parent.
- Archive child memperingatkan seluruh parent aktif.

### FR-COLL-003 Grant Collection

1. Buat ProgramAccess parent.
2. Buat derived ProgramAccess setiap child.
3. Derived access mereferensikan parent access.
4. Workspace menampilkan parent sebagai kartu utama dan child sebagai isi paket.
5. Akses child independen tidak ikut dicabut saat parent dicabut/kedaluwarsa.
6. Perubahan isi paket tidak retroaktif kecuali sinkronisasi eksplisit diaudit.

---

## 14. Functional Requirements — Batch dan Session

### FR-BATCH-001 Banyak Batch

Program dapat memiliki nol atau banyak Batch. Ebook dapat tanpa Batch; bimbel,
pelatihan, cohort, atau konsultasi dapat mewajibkannya.

### FR-BATCH-002 Data Batch

- Nama dan code unik dalam Program.
- Periode pendaftaran dan pelaksanaan.
- Kapasitas.
- Mode `ONLINE`, `OFFLINE`, atau `HYBRID`.
- Lokasi/timezone.
- Optional price override.
- Status.

### FR-BATCH-003 Lifecycle

```text
DRAFT → OPEN → RUNNING → COMPLETED
          └────────────→ CANCELLED
```

### FR-BATCH-004 Repeat Enrollment

User boleh memiliki beberapa ProgramAccess untuk Program sama jika Batch berbeda,
akses lama selesai/kedaluwarsa dan retake diizinkan, atau admin memberi exception.
Workspace mengelompokkan nama Program tetapi menampilkan setiap enrollment/Batch.

### FR-SESSION-001 Data Session

- Batch, judul, dan deskripsi.
- Waktu mulai/selesai dan timezone.
- Mode dan lokasi/meeting URL.
- Kapasitas opsional dan status.

### FR-SESSION-002 Lifecycle

```text
DRAFT → SCHEDULED → ONGOING → COMPLETED
                └───────────→ CANCELLED
```

Reschedule Session aktif harus tercatat dan menghasilkan state terbaru untuk
peserta/mentor.

---

## 15. Functional Requirements — Mentor Assignment

### FR-MENTOR-001 Scope

Mentor ditugaskan ke Session. Satu Session dapat memiliki beberapa mentor dengan
role `lead`, `co_mentor`, `reviewer`, atau `substitute`.

### FR-MENTOR-002 Mode

1. `ADMIN`: admin menentukan mentor dan jadwal.
2. `STUDENT`: student memilih mentor dan slot valid.
3. `HYBRID`: sistem menyaring berdasarkan policy/budget lalu student memilih.

### FR-MENTOR-003 Validasi

- Mentor aktif dan berpermission.
- Tidak ada konflik jadwal.
- Kapasitas mentor/slot dihormati.
- Penggantian tidak menghapus histori.
- Mentor hanya melihat peserta dalam assignment scope.

---

## 16. Functional Requirements — ProgramAccess

### 16.1 Sumber kebenaran

Order tidak memberi akses secara implisit. Order hanya salah satu sumber grant
setelah payment tervalidasi.

```text
Acquisition Source → Access Grant Service → ProgramAccess → Workspace
```

### FR-ACCESS-001 Sumber akses

- `PAYMENT`.
- `VOUCHER`.
- `ENROLLMENT_CODE`.
- `ADMIN_GRANT`.
- `COLLECTION`.
- `FREE_ENROLLMENT`.

### FR-ACCESS-002 Lifecycle entitlement

```text
WAITING → ACTIVE → COMPLETED
            ├────→ EXPIRED
            ├────→ SUSPENDED → ACTIVE
            └────→ REVOKED
```

- `WAITING`: syarat aktivasi belum terpenuhi.
- `ACTIVE`: entitlement valid.
- `COMPLETED`: completion rule terpenuhi.
- `EXPIRED`: periode habis.
- `SUSPENDED`: dibekukan sementara.
- `REVOKED`: dicabut permanen dengan alasan.

`ARCHIVED` bukan status entitlement. Archive adalah preferensi Workspace melalui
`archived_at`, sehingga tidak menghilangkan hak akses.

### FR-ACCESS-003 Periode

- Akses dapat tanpa batas atau memiliki `starts_at`/`ends_at`.
- Batch dapat menentukan periode default.
- Expiration otomatis dan tetap diverifikasi saat request.
- Perubahan periode manual memerlukan permission dan alasan.

### FR-ACCESS-004 Idempotency

- Setiap grant memiliki `grant_key` unik.
- Retry callback tidak membuat akses ganda.
- Redeem voucher/code aman dari concurrent request.
- Derived access paket tidak boleh duplikat.
- Grant berjalan dalam database transaction.

### FR-ACCESS-005 Authorization

Kapabilitas dapat dibuka hanya jika:

1. ProgramAccess caller valid untuk instance/Batch.
2. Status entitlement mengizinkan.
3. Periode masih valid.
4. Component aktif.
5. Policy component terpenuhi.

### FR-ACCESS-006 Admin Action

Admin berpermission dapat grant, activate, extend, suspend, restore, revoke, atau
memindahkan Batch melalui flow khusus. Actor, alasan, waktu, dan before/after
wajib diaudit.

---

## 17. Flow Akuisisi

### 17.1 Pembayaran

```text
Pilih Program/Batch
 → Checkout membuat Order + snapshot OrderItem
 → Payment confirmed (idempotent)
 → Access Grant Service
 → ProgramAccess ACTIVE/WAITING
 → Workspace
```

- Nama, harga, Program, dan Batch disimpan sebagai snapshot OrderItem.
- Payment gagal/kedaluwarsa tidak menghasilkan akses aktif.
- Refund tidak menghapus histori; policy menentukan suspend/revoke.

### 17.2 Voucher/Enrollment Code

```text
Input code
 → Validasi periode, quota, eligibility, Program/Batch
 → Atomic redemption
 → Access Grant Service
 → ProgramAccess
```

### 17.3 Admin Grant

```text
Pilih user + Program + optional Batch
 → Isi periode dan alasan
 → Permission/policy check
 → Access Grant Service
 → ProgramAccess + audit
```

### 17.4 Program Gratis

Harga nol tetap memakai flow grant backend; frontend tidak boleh melewati
entitlement service.

---

## 18. Functional Requirements — Personal Workspace

### FR-WS-001 Struktur

Workspace adalah landing utama setelah login dan minimal memiliki:

- Ringkasan Program aktif.
- Agenda/Session terdekat.
- Aksi “Lanjutkan”.
- Search, filter tag/status, dan sorting.
- Kelompok `Aktif`, `Menunggu`, `Selesai`, `Kedaluwarsa`, dan `Arsip`.

### FR-WS-002 Kartu

Data ditampilkan kondisional:

- Nama, thumbnail, dan Batch.
- Status akses, progress, dan component utama.
- Session berikutnya dan batas akses.
- CTA: `Mulai`, `Lanjutkan`, `Lihat Jadwal`, `Selesaikan Pembayaran`,
  `Lihat Hasil`, atau `Perpanjang`.

### FR-WS-003 Detail

Navigasi hanya untuk component aktif dan berhak diakses:

```text
Overview | Materi | Video | Jadwal | Tryout | Tugas | Diskusi | Sertifikat
```

### FR-WS-004 Archive Personal

- User dapat archive/restore kartu.
- Archive tidak mengubah Program atau entitlement.
- Item yang memerlukan tindakan penting tidak boleh disembunyikan tanpa policy.

### FR-WS-005 Empty/Error State

- Workspace kosong mengarah ke katalog atau redeem code.
- Error menyediakan retry tanpa menghilangkan data lama yang valid.
- Akses kedaluwarsa menjelaskan penyebab dan tindakan.

### FR-WS-006 Responsive/Accessibility

- Alur utama berfungsi di mobile, tablet, desktop, dan keyboard.
- Status tidak dibedakan dengan warna saja.
- Loading/error/perubahan async diumumkan secara aksesibel.

---

## 19. Progress dan Completion

### FR-PROGRESS-001 Progress

Progress dihitung dari aktivitas component, bukan angka yang diedit bebas, lalu
dapat dicache. Contoh: lesson selesai, assessment wajib, attendance minimum, dan
assignment wajib.

### FR-PROGRESS-002 Completion

Program memiliki completion rule tervalidasi. Saat terpenuhi, ProgramAccess dapat
menjadi `COMPLETED` dan certificate diterbitkan bila component/rule mengizinkan.

---

## 20. Model Data Konseptual

### 20.1 Tabel inti

| Tabel | Fungsi | Constraint penting |
| --- | --- | --- |
| `programs` | Definisi Program | slug unik; harga ≥ 0 |
| `tags` | Master klasifikasi | code unik/immutable |
| `program_tag` | Program–Tag | unik pasangan FK |
| `component_definitions` | Registry kapabilitas | code unik/immutable |
| `program_components` | Component + config | unik Program–Component |
| `program_relations` | Parent-child | unik; no cycle |
| `program_batches` | Cohort/pelaksanaan | code unik dalam Program |
| `program_sessions` | Pertemuan Batch | selesai > mulai |
| `session_mentor_assignments` | Mentor per Session | assignment aktif unik |
| `program_accesses` | Entitlement user | grant_key unik |
| `access_events` | Audit akses | append-only |

### 20.2 Field minimum ProgramAccess

```text
id
user_id
program_id
program_batch_id nullable
parent_program_access_id nullable
source_type
source_id nullable
grant_key unique
status
starts_at / ends_at nullable
activated_at / completed_at nullable
suspended_at / revoked_at nullable
archived_at / last_accessed_at nullable
metadata nullable
created_by / updated_by nullable
timestamps
```

### 20.3 Integritas

- Semua foreign key diindeks dan memiliki strategi delete.
- Program/Batch/Access yang digunakan memakai archive atau restricted delete.
- Audit actor dapat `SET NULL` dengan snapshot yang diperlukan.
- Uang memakai decimal, bukan float.
- Timestamp disimpan UTC; display mengikuti timezone user/Batch.
- JSON hanya untuk config component tervalidasi, bukan aktivitas utama.

### 20.4 Index minimum

- `programs(status, visibility, published_at)` dan unique `slug`.
- `program_tag(tag_id, program_id)`.
- `program_components(program_id, is_enabled, sort_order)`.
- `program_batches(program_id, status, starts_at)`.
- `program_sessions(program_batch_id, status, starts_at)`.
- `session_mentor_assignments(mentor_id, status)`.
- `program_accesses(user_id, status, archived_at, last_accessed_at)`.
- `program_accesses(user_id, program_id, program_batch_id)`.
- unique `program_accesses(grant_key)`.
- `access_events(program_access_id, created_at)`.

---

## 21. API Boundary

### Katalog

```text
GET /api/programs
GET /api/programs/{slug-or-id}
```

Search/filter tag, component, harga, visibility, dan pagination. Draft serta
config internal tidak boleh bocor.

### Administrasi

```text
GET|POST    /api/admin/programs
GET|PUT     /api/admin/programs/{program}
POST        /api/admin/programs/{program}/publish|archive|clone
GET|POST|PUT /api/admin/tags
GET         /api/admin/component-definitions
PUT         /api/admin/programs/{program}/components
GET|POST|PUT /api/admin/programs/{program}/batches
GET|POST|PUT /api/admin/batches/{batch}/sessions
```

### Workspace/Akses

```text
GET  /api/workspace
GET  /api/workspace/accesses/{programAccess}
POST /api/workspace/accesses/{programAccess}/archive|restore
POST /api/access/redeem-voucher
POST /api/access/redeem-enrollment-code
POST /api/admin/program-accesses/grant
POST /api/admin/program-accesses/{access}/suspend|restore|revoke
```

### Aturan kontrak

- List memakai pagination server-side.
- Error memiliki machine-readable code.
- Mutation sensitif idempotent bila relevan.
- Authorization diverifikasi backend.
- Workspace berorientasi pada access instance, bukan OrderItem.
- `level`, `type`, `program_level_id`, `program_type_id` dihapus.

---

## 22. Permission Minimum

| Permission | Kegunaan |
| --- | --- |
| `program.view/create/update` | CRUD Program |
| `program.publish/archive/clone` | Lifecycle Program |
| `program-tag.manage` | Tag |
| `program-component.manage` | Component |
| `program-batch.manage` | Batch |
| `program-session.manage` | Session |
| `mentor-assignment.manage` | Mentor assignment |
| `program-access.view/grant` | Lihat/grant akses |
| `program-access.suspend/revoke/extend` | Lifecycle akses |

Permission dipetakan ke menu dan policy/API. Menyembunyikan menu bukan
authorization.

---

## 23. Audit dan Observability

### Event wajib audit

- Program create/publish/unpublish/archive serta perubahan harga, visibility,
  component, dan collection.
- Batch/Session create, reschedule, cancel, complete.
- Mentor assign/replace/remove.
- Access grant/activate/extend/suspend/restore/revoke.
- Redeem code dan kegagalan race/limit.
- Sinkronisasi collection.

Audit menyimpan actor, action, target, timestamp, correlation ID, reason, dan
before/after yang relevan. Monitor kegagalan grant, idempotency conflict,
payment callback gagal, access invalid, Session tanpa mentor, dan Workspace lambat.

---

## 24. Non-Functional Requirements

### Security

- Mutation memerlukan authentication dan policy.
- User hanya membaca akses miliknya.
- URL meeting, material privat, hasil, dan certificate tidak bocor ke katalog.
- Config JSON divalidasi dan dibatasi.

### Integrity/Concurrency

- Grant, redemption, dan capacity reservation transactional.
- Race voucher quota, Batch capacity, dan mentor slot ditangani.
- Callback/retry aman dijalankan ulang.
- Tidak ada orphan access, Session, atau assignment.

### Performance

- Workspace first page ditargetkan ≤ 500 ms p95 di test environment.
- Tidak ada N+1 pada list utama.
- Search/filter/pagination server-side.
- Response tidak memuat seluruh materi/history secara default.

### Reliability/Accessibility

- Kegagalan notifikasi tidak membatalkan grant sukses.
- Event lanjutan dapat diretry.
- Authorization tetap memeriksa tanggal bila scheduler terlambat.
- Alur utama mengikuti praktik WCAG 2.1 AA.
- Format Indonesia; timestamp UTC dengan timezone eksplisit.

---

## 25. Strategi Refactor Big-Bang

Big-bang berarti kontrak baru aktif dalam satu cutover. Workstream boleh bertahap,
tetapi tidak ada kondisi akhir yang menjalankan model lama dan baru bersama.

### A. Domain dan Schema

- Finalisasi status, dependency, dan permission.
- Buat schema tag, component, collection, Batch, Session, Access.
- Integrasikan curriculum/CBT/mentor yang dipertahankan.
- Seed component definition dan permission.

### B. Backend

- Hapus model/request/resource/controller/route/seeder level/type.
- Ganti kontrak Program.
- Implementasikan lifecycle dan Access Grant Service idempotent.
- Hubungkan payment confirmation ke grant.
- Implementasikan Workspace API dan component policy.

### C. Frontend Admin

- Hapus menu/layar Program Levels dan Program Types.
- Ganti form Program dengan flow baru.
- Tambahkan tag, component, collection, Batch, Session.
- Sesuaikan permission dan menu.

### D. Frontend User

- Hapus paid orders sebagai sumber enrolled Program.
- Ganti dashboard Program menjadi Workspace.
- Perbarui katalog/detail/checkout/kartu tanpa level/type.
- Tambahkan redeem code dan navigasi berbasis component/access.

### E. Cutover Development

- Backup database development hanya bila diperlukan.
- Jalankan `migrate:fresh --seed` hanya pada database development yang ditetapkan.
- Jalankan backend, frontend, integration, dan smoke test.
- Aktifkan kontrak baru sebagai satu-satunya kontrak.

### F. Cleanup

- Hapus file, type, helper, test, docs, dan endpoint legacy.
- Scan repository untuk level/type Program.
- Perbarui dokumentasi API dan onboarding.

### Rollback

1. Hentikan pengujian build baru.
2. Kembalikan aplikasi/migration set melalui version control.
3. Restore database development atau fresh migration versi lama.
4. Jangan mencampurkan schema baru dengan kode lama.

---

## 26. Mapping Seed Development

- Level lama menjadi Tag.
- Type lama tidak dipindahkan sebagai type:
  - menjadi Tag jika hanya klasifikasi;
  - menjadi Component jika menentukan kapabilitas;
  - menjadi Batch policy jika menentukan pelaksanaan.
- Course mengaktifkan material/video/meeting yang benar-benar tersedia.
- Tryout mengaktifkan assessment.
- Paid Order seed yang dipertahankan harus menghasilkan ProgramAccess seed.
- Tidak ada migration compatibility data production.

---

## 27. Acceptance Criteria

### AC-001 Tidak ada level/type

- Tidak ada tabel, model, endpoint, menu, form, frontend type, atau response aktif
  ProgramLevel/ProgramType.
- Program dapat dibuat tanpa level/type.

### AC-002 Program modular

- Program dapat memiliki beberapa tag/component.
- Dependency invalid ditolak jelas.
- Katalog memakai tag sebagai klasifikasi.

### AC-003 Collection

- Paket dapat berisi beberapa Program.
- Self-reference/cycle ditolak.
- Grant paket menghasilkan child access auditable tanpa duplikasi.

### AC-004 Batch/Repeat

- Satu Program memiliki beberapa Batch.
- User dapat mengikuti Program sama pada Batch berbeda.
- Workspace membedakan enrollment instance.

### AC-005 Access source of truth

- Paid Order tanpa ProgramAccess bukan entitlement.
- Retry payment hanya membuat satu grant.
- Voucher, code, free enrollment, dan admin memakai service sama.

### AC-006 Workspace

- User hanya melihat akses sendiri.
- Filter/open/archive/restore berfungsi.
- Archive tidak mengubah entitlement.
- Component unauthorized tidak muncul dan ditolak via direct URL.

### AC-007 Lifecycle

- Transisi invalid ditolak.
- Unpublished menutup acquisition baru tetapi mempertahankan akses lama.
- Suspended/revoked tidak dapat membuka konten.

### AC-008 Permission/Audit

- API admin menolak caller tanpa permission.
- Grant/suspend/restore/extend/revoke mencatat actor dan reason.

### AC-009 Quality

- Feature, policy, idempotency, frontend, dan critical-flow test lulus.
- Tidak ada N+1 pada endpoint utama.
- Katalog, checkout, Workspace, admin lolos smoke test responsive.

---

## 28. Skenario Pengujian Kritis

1. Ebook dibuat tanpa Batch.
2. Bimbel dibuat dengan meeting, attendance, Batch, dan Session.
3. QR attendance tanpa attendance ditolak.
4. Collection cyclic ditolak.
5. Payment callback dua kali hanya membuat satu akses.
6. Dua request voucher quota terakhir: hanya satu berhasil.
7. Program sama pada dua Batch tampil sebagai dua access instance.
8. Archive kartu tidak mencabut akses.
9. Suspend memblokir direct URL; restore mengaktifkan kembali.
10. Parent dicabut; derived child invalid, child independen tetap aktif.
11. Program unpublished: user lama tetap bisa, user baru tidak bisa checkout.
12. Reschedule Session tercatat dan state peserta/mentor terbarui.
13. Mentor di luar assignment tidak dapat melihat peserta.
14. User A tidak dapat membuka ProgramAccess user B.

---

## 29. Success Metrics

- 100% Program dapat dikonfigurasi tanpa ProgramType.
- 100% program milik user berasal dari ProgramAccess.
- 100% acquisition memiliki audit grant.
- Tidak ada duplicate access akibat retry/redeem.
- Nol referensi aktif ProgramLevel/ProgramType setelah cleanup.
- Critical flow memiliki automated test.
- Tidak ada high-severity authorization issue.
- Workspace memenuhi target performa yang disepakati.

---

## 30. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Component menjadi type terselubung | Pisahkan registry, config schema, dan domain service |
| Config JSON tak terkontrol | Schema per component dan size limit |
| Grant ganda | grant_key unik, transaction, lock, test |
| Collection cyclic | Validasi graph sebelum simpan |
| Order tetap dibaca sebagai akses | Semua authorization melalui ProgramAccess |
| Archive mencabut akses | Pisahkan archived_at dari access status |
| Component dimatikan saat dipakai | Dependency check, warning, audit |
| Big-bang meninggalkan legacy | Repository scan dan full test |
| Scope melebar ke semua modul | Integrasikan contract minimum saja |

---

## 31. Dependency

- Authentication/user dan role/permission.
- Order/payment confirmation.
- Curriculum/material/video.
- CBT/assessment.
- Mentor/schedule.
- Audit log, media storage, dan notification.

Dependency diubah hanya sejauh diperlukan untuk terhubung ke Program, Batch,
Session, dan ProgramAccess. Refactor internal menyeluruh tiap domain di luar scope.

---

## 32. Definition of Done

1. Seluruh acceptance criteria terpenuhi.
2. Schema baru menjadi satu-satunya schema aktif.
3. Level/type hilang dari backend, frontend, seed, test, dan docs aktif.
4. ProgramAccess menjadi satu-satunya sumber authorization/Workspace.
5. Program mendukung tag, component, collection, dan Batch.
6. Semua flow acquisition idempotent.
7. Workspace personal end-to-end dan responsive.
8. Permission, audit, error, dan concurrency scenario diuji.
9. Database development dapat dibangun dari nol melalui migration/seeder.
10. Dokumentasi API dan developer diperbarui.

---

## 33. Target Akhir

Arkanin memiliki satu model Program yang fleksibel. Kapabilitas ditentukan
Component, klasifikasi oleh Tag, paket oleh Collection, pelaksanaan oleh Batch dan
Session, serta hak user oleh ProgramAccess.

Workspace menjadi pengalaman utama user untuk mengakses layanan yang benar-benar
dimiliki, terlepas dari sumbernya: pembayaran, voucher, enrollment code, program
gratis, grant admin, atau paket.

---

## 34. Implementation status (2026-08-21)

Cutover big-bang telah diimplementasikan sampai closure Task 17:

- component registry hanya mengiklankan capability yang memiliki handler;
- progress material/assessment memakai activity ledger idempotent, completion otomatis, dan certificate tunggal;
- Session mendukung mode mentor `ADMIN`, `STUDENT`, `HYBRID`, reservasi berkapasitas, dan participant scope per assignment;
- reschedule memvalidasi konflik mentor, diaudit, lalu diproyeksikan after-commit ke inbox peserta/mentor;
- Workspace dan Admin memakai kontrak baru, termasuk progress, certificate, pemilihan mentor, dan acknowledgment jadwal;
- migration/seeder dapat dibangun ulang pada PostgreSQL development;
- suite SQLite, contract frontend, build Next.js, dan PostgreSQL concurrency callback payment/grant/code/Batch/mentor menjadi quality gate.

Konfigurasi concurrency wajib menunjuk database bernama `*_test`; suite menolak database lain untuk mencegah cleanup terhadap data development/production.
