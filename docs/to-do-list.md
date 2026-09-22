# Arkanin Education Platform - Master To-Do List

| Metadata | Nilai |
| --- | --- |
| **Status** | In Progress (Active Sprint) |
| **Versi To-Do** | 2.0 (Ekosistem & Mekanisme Baru) |
| **Tanggal Pembaruan** | 21 September 2026 |
| **Target Host** | `lms.arkanin.my.id` (Single Entry Portal) |
| **Referensi PRD Utama** | [2026-09-21-PRD-ekosistem-dan-mekanisme-baru.md](file:///d:/project/ams/docs/plans/2026-09-21-PRD-ekosistem-dan-mekanisme-baru.md) |
| **Referensi Arsitektur** | [2026-08-20-PRD-refactor-programs-workspace.md](file:///d:/project/ams/docs/plans/2026-08-20-PRD-refactor-programs-workspace.md) |

---

## 🧭 Peta Progres & Urutan Prioritas 5 Tahap

```text
[ Tahap 1: Pondasi Master Data & Katalog ] ────► 🟢 COMPLETED (100%)
                       │
                       ▼
[ Tahap 2: Transaksi, Keuangan & Wallet ]  ────► 🟢 COMPLETED (100%)
                       │
                       ▼
[ Tahap 3: Workspace Siswa & Mentor ]      ────► 🟢 COMPLETED (100%)
                       │
                       ▼
[ Tahap 4: Gamifikasi, Store & Freemium ]  ────► 🟢 COMPLETED (100%)
                       │
                       ▼
[ Tahap 5: Sertifikasi & Multi-Cabang ]    ────► 🟢 COMPLETED (100%)
```

---

## 🏗️ Fondasi Infrastruktur & Core Auth (Status: Selesai ✅)

Komponen dasar sistem yang telah beroperasi dan menjadi fondasi untuk tahapan di bawah:
- [x] Docker compose setup (PostgreSQL, Redis, Laravel API, Next.js Web, Nginx)
- [x] Backend Auth & Sanctum Bearer Token (`/api/v1/auth/*`)
- [x] Spatie Laravel Permission (RBAC: Superadmin, Branch Roles, User)
- [x] Google OAuth Integration (Socialite & token exchange)
- [x] Dukungan entitas `branches` dan kolom `branch_id` pada tabel `users`
- [x] Frontend Auth Context & Store (Zustand persist + Axios interceptor)
- [x] Base layout dialog & Form modal glassmorphism

---

## 📋 Tahap 1: Pondasi Master Data & Katalog Program (Status: Selesai ✅)
> **Mental Model**: Katalog Program Modular & Bank Soal 5 Tipe. Selesaikan ini sebelum transaksi dan jadwal.

### 1.1 Backend: Master Program Modular & Content Management
- [x] Bersihkan dependensi legacy `ProgramLevel` & `ProgramType` dari model `Program`
- [x] Implementasi skema modular: `programs`, `tags`, `program_components`, `program_relations` (Collection)
- [x] API Katalog Publik: `GET /api/v1/programs` (hanya status `PUBLISHED`) dan `GET /api/v1/programs/{slug-or-id}`
- [x] API Admin Program: CRUD draft, lifecycle toggle (`publish`, `unpublish`, `archive`, `restore`) dengan audit trail
- [x] Modul Materi Pembelajaran: Relasi `modules` dan `lessons` (PDF terproteksi & Video embed)
- [x] Endpoint klaim kode pendaftaran promosi: `POST /api/v1/access/redeem-enrollment-code`

### 1.2 Backend: Bank Soal & Engine CBT 5 Jenis Pertanyaan
- [x] Tabel `question_banks`, `questions`, `exam_packages`, `exam_sessions`
- [x] Refactor skema `questions` untuk mendukung 5 jenis tipe pertanyaan terstandarisasi:
  - [x] `single_choice` (Pilihan Ganda Tunggal)
  - [x] `multiple_choice` (Pilihan Ganda Kompleks / Checkbox)
  - [x] `true_false` (Benar / Salah bertingkat)
  - [x] `matching` (Menjodohkan / Pasangan Konsep)
  - [x] `short_answer` (Esai Singkat / Isian Kata Kunci)
- [x] Endpoint mulai ujian: `POST /api/v1/exams/start`
- [x] Endpoint autosave jawaban: `POST /api/v1/exams/autosave`
- [x] Endpoint submit ujian & kalkulasi passing grade: `POST /api/v1/exams/submit`
- [x] Endpoint fetch daftar butir soal teracak sesuai 5 jenis format render

### 1.3 Frontend: Katalog & Antarmuka Program
- [x] Halaman Katalog Program (`/programs`) dengan kartu program responsif
- [x] Halaman Detail Program (`/programs/[slug]`) menampilkan ringkasan materi, mentor, dan fasilitas
- [x] Filter kategori & pencarian berbasis `tags`
- [x] Modal dialog input klaim **Enrollment Code** promosi/gratis
- [x] Integrasi state seleksi batch pelaksanaan pada halaman detail program

---

## 💳 Tahap 2: Transaksi, Keuangan & Pembuatan Enrollment (Status: Selesai ✅)
> **Mental Model**: Checkout, Invoicing, Approval, dan Dual-Wallet Engine.

### 2.1 Backend: Transaksi & Payment Gateway
- [x] Tabel `orders`, `order_items`, `transactions`
- [x] Integrasi Payment Gateway (Virtual Account, E-Wallet, QRIS)
- [x] Endpoint Webhook pembayaran: `POST /api/v1/payments/webhook` dengan verifikasi signature
- [x] Auto-generate Invoice terstandarisasi (nomor unik per cabang)
- [x] Pemicu notifikasi tagihan & kuitansi via WhatsApp (Fonnte/Wablas)
- [x] Workflow Approval Transaksi: Endpoint `POST /api/v1/admin/transactions/{id}/approve` dan `reject` oleh Admin Keuangan (ASD)
- [x] Auto-grant `ProgramAccess` seketika saat pembayaran lunas atau transaksi di-approve

### 2.2 Backend: Dual-Wallet Engine (Saldo Siswa & Saldo Mentor)
- [x] Migrasi & Model `wallets` (`user_id`, `type` [`student`, `mentor`], `balance`, `pending_balance`)
- [x] Migrasi & Model `wallet_transactions` (ledger double-entry: `type` [`credit`, `debit`], `reference_type`, `amount`, `balance_after`)
- [x] Event Auto-Rollback: Jika transaksi program ditolak/batal, dana dikreditkan otomatis ke `wallets` siswa (Student Wallet)
- [x] Migrasi & Model `withdrawals` (tiket pengajuan penarikan dana ke rekening bank)
- [x] Fitur Keamanan: Hashing PIN Transaksi 6-digit pada `users` (`pin_hash`) dan rate-limiting proteksi brute-force (3x salah lockout 30 menit)
- [x] Endpoint Dompet Siswa: `GET /api/v1/wallet/me`, `POST /api/v1/wallet/pay-order`
- [x] Endpoint Pengajuan Pencairan: `POST /api/v1/wallet/withdraw` (validasi PIN)
- [x] Endpoint Manajemen ASD: Verifikasi pencairan saldo, input nomor referensi transfer bank, dan unggah bukti transfer

### 2.3 Frontend: Checkout, Invoicing & User Wallet
- [x] Halaman Checkout program & pemilihan metode pembayaran
- [x] Halaman Riwayat Order dengan tab status (Menunggu Pembayaran, Diproses, Selesai, Dibatalkan)
- [x] Halaman Saldo Akun (*User Wallet View*):
  - [x] Widget informasi total saldo aktif & saldo dalam proses penarikan
  - [x] Riwayat mutasi kredit/debit dompet
  - [x] Modal dialog setelan & ganti PIN Transaksi 6-digit
  - [x] Modal dialog form pengajuan penarikan dana (Withdrawal) ke bank
  - [x] Opsi bayar cepat menggunakan Saldo Dompet saat checkout


---

## 🎓 Tahap 3: Workspace Belajar (A+) & Penjadwalan Mengajar (A-Teams) (Status: Selesai ✅)
> **Mental Model**: Aktivitas Belajar Siswa & Administrasi Mengajar Mentor.

### 3.1 Backend: State Akses & Penjadwalan
- [x] Model `program_accesses` (entitlement siswa)
- [x] Pemetaan Batch & Session: `batches`, `sessions`, `mentor_assignments`
- [x] Status lifecycle akses siswa: `WAITING`, `ACTIVE`, `DONE`, `EXPIRED`
- [x] Endpoint Workspace Siswa: `GET /api/v1/workspace` (proyeksi akses aktif siswa)
- [x] Endpoint Presensi Siswa: `POST /api/v1/admin/sessions/{session}/attendances`
- [x] Catatan Sesi & Honor: Model `mentor_session_logs` (mengunci presensi dan mengkreditkan saldo honor otomatis ke `wallets` mentor)
- [x] Endpoint Slip Gaji Digital: Auto-generate rincian honor per sesi mengajar

### 3.2 Frontend Siswa: Workspace A-Plus (A+)
- [x] Navigasi Tab Status Workspace:
  - [x] Tab **Active**: Program yang sedang berlangsung
  - [x] Tab **Waiting**: Program yang telah dibeli namun batch belum mulai
  - [x] Tab **Done**: Program yang telah selesai kurikulumnya
- [x] Kartu Program Interaktif:
  - [x] Tombol **Assessment**: Membuka antarmuka CBT 5 jenis soal
  - [x] Tombol **Class**: Membuka modul materi PDF/Video
  - [x] Tombol **Schedule**: Menampilkan jadwal tatap muka/link Zoom
  - [x] Indikator **Progress Tracker**: Bar persentase penyelesaian materi & kuis

### 3.3 Frontend Mentor: Workspace A-Teams (Conditional Rendering)
- [x] Antarmuka dasar seragam dengan Workspace Siswa (Unified UI)
- [x] Menu Kondisional Mentor:
  - [x] Menu **Jadwal Mengajar**: Daftar sesi kelas yang ditugaskan kepada mentor
  - [x] Menu **Presensi Kelas**: Form centang absensi siswa per sesi kelas secara real-time
  - [x] Menu **Rekapitulasi Honor & Saldo Mentor**:
    - [x] Indikator saldo honor mengajar
    - [x] Riwayat jam & sesi mengajar yang telah diselesaikan
    - [x] Tombol ajukan pencairan (*drawdown*) ke rekening bank
    - [x] Tombol unduh slip gaji digital

### 3.4 Pipeline Onboarding & Rekrutmen Mentor
- [x] Migrasi & Model `mentor_applications` (dokumen KTP, CV, Sertifikat, Skor Tes Tulis, Video Mengajar)
- [x] Pipeline tahapan seleksi:
  $$\text{Applied} \longrightarrow \text{Under Review} \longrightarrow \text{Assessment} \longrightarrow \text{Interview} \longrightarrow \text{Hired / Rejected / Withdrawn}$$
- [x] Antarmuka ASA (Staf Operasional): Evaluasi pelamar, input nilai tes, notulensi interview, dan penetapan role (`Mentor Utama` / `Mentor Harian`)
- [x] Form publik pendaftaran seleksi calon pengajar

---

## 🏆 Tahap 4: Gamifikasi, Store Reward & Freemium Funnel (Status: Selesai ✅)
> **Mental Model**: Insentif Motivasi Belajar & Retensi Pengguna.

### 4.1 Backend: Gamification Point Engine & Store
- [x] Model `PointWallet` dan `point_transactions`
- [x] Pemicu Perolehan Poin:
  - [x] Cashback poin atas pembelian program tertentu (`awardCashbackPurchase`)
  - [x] Bonus poin atas kelulusan TryOut CBT (passing grade terpenuhi) (`awardCbtAchievement`)
  - [x] Bonus poin atas kehadiran presensi 100% pada sesi kelas (`awardAttendancePerfect`)
- [x] Model `store_products`, `store_orders`, `store_order_items` untuk produk fisik (buku materi, merchandise)
- [x] Aturan Kebijakan Finansial (ASD): Konfigurasi rasio nilai tukar poin ke Rupiah (`point_to_cash_ratio`) dan masa berlaku poin (`point_expiry_days`) pada cabang (`branches`)
- [x] Admin Store API (`StoreAdminController`): CRUD produk fisik, manajemen order pengiriman & input resi

### 4.2 Frontend: Store & Freemium Marketing Funnel
- [x] Halaman Store (`/store`): Etalase buku fisik, modul belajar, dan merchandise
- [x] Halaman Detail & Checkout (`/store/[slug]`): Opsi pembayaran penuh poin, bayar tunai, atau mixed
- [x] Halaman Riwayat Pesanan Store (`/store/orders`): Pelacakan status dan nomor resi pengiriman
- [x] Halaman Riwayat & Peringkat Gamifikasi (`/points`): Leaderboard Top 20 siswa teraktif, mutasi poin, ringkasan saldo
- [x] Halaman Backoffice Admin Store (`/admin/store`): CRUD produk fisik dan pembaruan status pesanan/resi pengiriman
- [x] Implementasi Funnel Marketing Lapisan 1:
  - Member daftar gratis $\rightarrow$ Input Enrollment Code promo $\rightarrow$ Kerjakan TryOut di Workspace $\rightarrow$ Dapat Poin $\rightarrow$ Tukar Merchandise di Store

---

## 🏛️ Tahap 5: Sertifikasi Otomatis & Sistem Multi-Cabang (Status: Selesai ✅)
> **Mental Model**: Multi-Tenant Isolation & Konsolidasi Manajemen Pusat.

### 5.1 Backend: Multi-Tenant Scoping (`branch_id`) & Sertifikat
- [x] Kolom `branch_id` pada tabel `users` dan master `branches`
- [x] Tambahkan `BranchScope` (Global Scope Eloquent) pada seluruh model operasional & finansial cabang:
  - Model `orders`, `transactions` (`finance_transactions`), `wallets`, `batches`, `sessions`, `mentor_applications`
- [x] Master Certificate Engine:
  - Evaluasi otomatis syarat penerbitan sertifikat (Passing grade CBT lulus score $\ge 60$ DAN Presensi $\ge 80\%$)
  - Auto-generate sertifikat dengan nomor seri unik terverifikasi (`ARK-CERT-YYYYMM-XXXXXX`)
  - Endpoint publik verifikasi keaslian: `GET /api/v1/certificates/verify/{certificate_number}`
- [x] Endpoint konsolidasi Super Admin AMS: Agregasi arus kas global, metrik retensi lintas cabang (`GET /api/v1/admin/ams/consolidation`)

### 5.2 Frontend: Area Management & Dinamika Branding
- [x] **Dinamika Logo "A" (Header Bar)**:
  - Klik logo selalu menuju domain induk `arkanin.my.id`
  - Siswa login $\rightarrow$ Logo **A+** (Student Plus)
  - Mentor login $\rightarrow$ Logo **A-team** (Mentor Workspace)
  - Admin Cabang login $\rightarrow$ Logo **Arkanin Super App (ASA)**
  - Keuangan Cabang login $\rightarrow$ Logo **Arkanin Super Diamond (ASD)**
  - Super Admin login $\rightarrow$ Logo **Arkanin Management System (AMS)**
- [x] **Dinamika Mobile Navigation**:
  - *Guest*: Beranda, Program, Masuk/Daftar (tombol tengah), Store
  - *Logged-In*: Program, Store, Workspace (tombol tengah menonjol), Ujian, Akun
- [x] Dashboard Back-Office:
  - Dashboard AMS: `/admin/consolidation` (agregasi arus kas global, breakdown omzet cabang, metrik retensi)
  - Halaman Publik Verifikasi Sertifikat: `/certificates/verify/[serial]` (tampilan resmi & cetak sertifikat)
  - Modal Sertifikat Workspace Siswa: Dialog evaluasi syarat CBT & presensi serta tombol cetak sertifikat resmi

---

## 🔒 Tahap 6: Quality Assurance, Security & Deployment

### 6.1 Testing & Audit Kualitas
- [x] Feature tests untuk proteksi saldo dompet (uji *race-condition* / concurrency locking)
- [x] Feature tests untuk isolasi multi-cabang (memastikan staf Cabang A tidak dapat melihat data Cabang B)
- [x] Test engine penilaian CBT 5 jenis soal
- [x] End-to-end test alur pendaftaran siswa hingga pembukaan akses Workspace

### 6.2 Security Hardening
- [x] Enkripsi PIN Transaksi dengan algoritma Bcrypt/Argon2Id
- [x] Anti-cheat CBT: Event listener *focus/blur*, penguncian full-screen, deteksi multi-tab
- [x] Sanitasi berkas upload pelamar mentor (tipe MIME & scan ukuran file)

---

## 🎯 Ringkasan Status Progres

| Tahap | Fokus Area | Status | Estimasi Penyelesaian |
| --- | --- | --- | --- |
| **Tahap 1** | Master Program, Bank Soal 5 Tipe, & Katalog | 🟢 100% | Selesai ✅ |
| **Tahap 2** | E-Payment, Invoicing, Approval, & Dual-Wallet | 🟢 100% | Selesai ✅ |
| **Tahap 3** | Workspace Siswa (A+) & Mentor (A-Teams) | 🟢 100% | Selesai ✅ |
| **Tahap 4** | Gamifikasi Poin & Penukaran Store Reward | 🟢 100% | Selesai ✅ |
| **Tahap 5** | Sertifikasi Otomatis, Multi-Branch, & Branding | 🟢 100% | Selesai ✅ |
| **Tahap 6** | QA, Anti-Cheat, Concurrency Lock, & Go-Live | 🟢 100% | Selesai ✅ |
