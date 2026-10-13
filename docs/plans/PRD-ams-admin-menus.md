# Product Requirements Document (PRD)
# Arkanin Management System (AMS) – Master Admin Menu & Role Dispatch Architecture

- **Dokumen**: `PRD-ams-admin-menus.md`
- **Versi**: 1.0.0
- **Status**: Live / Draf Aktif (Akan diperbarui secara berkala per menu)
- **Terakhir Diperbarui**: 2026-10-13
- **Ruang Lingkup**: Seluruh navigasi dan fitur manajemen pada Panel Admin Arkanin (AMS) beserta alur integrasi ke peran pengguna (**Member**, **Student**, dan **Mentor**).

---

## 1. Executive Summary & Ringkasan Ekosistem

### 1.1 Latar Belakang & Masalah
Panel Admin Arkanin Management System (AMS) sebelumnya memiliki pengelompokan menu yang terbatas dan belum mencakup kebutuhan operasional lengkap, seperti manajemen ruangan fisik, katalog materi modular, monitoring evaluasi mentor, manajemen logistik toko fisik, serta kontrol database. Hal ini menimbulkan inkonsistensi navigasi dan ketidakjelasan alur data operasional dari admin pusat ke pengguna akhir.

### 1.2 Solusi
Menstandardisasi arsitektur navigasi AMS ke dalam **13 Kategori Utama (Parent)** dengan 38+ sub-menu modular. Setiap menu memiliki spesifikasi operasional yang jelas pada panel admin serta dipetakan alur distribusinya (*dispatch flow*) secara terukur ke tiga peran pengguna utama:
1. **Member**: Pengguna terdaftar publik (calon siswa) yang mencari program, melakukan transaksi pembelian, dan mengumpulkan poin.
2. **Student**: Siswa aktif yang terdaftar (*enrolled*) pada program belajar, mengerjakan modul/asesmen, menghadiri kelas, dan mengklaim sertifikat.
3. **Mentor**: Tenaga pengajar/ahli yang membuka jadwal bimbingan, mengisi sesi kelas, mengevaluasi tugas siswa, dan menerima feedback.

### 1.3 Legenda Status Kesiapan Menu
- 🟢 **Ready (Tersedia)**: Layanan backend (Model, Controller, API) dan antarmuka panel admin (UI View) sudah aktif dan dapat digunakan.
- 🟡 **Partial (Service Ready / UI Placeholder)**: Model/Database/API sebagian sudah ada di backend, namun antarmuka admin masih dalam tahap integrasi atau prototipe.
- 🔴 **Planned / In Development (Belum Ada Fitur/Servis)**: Fitur baru yang belum memiliki schema tabel atau antarmuka, saat ini mengarah ke `PlaceholderView` dan tercantum dalam roadmap implementasi.

---

## 2. Matriks Status Kesiapan Menu Admin AMS

| Kategori (Parent) | Sub-Menu | Route / URL | Status | Entitas Database / Model |
| :--- | :--- | :--- | :---: | :--- |
| **Dashboard** | Overview Dashboard | `admin://view/dashboard` | 🟢 Ready | `AuditLog`, Agregasi Metrik |
| **Personal** | Role Permission | `admin://view/roles` | 🟢 Ready | `roles`, `permissions` (Spatie) |
| | Branch | `admin://view/branches` | 🟡 Partial | `Branch` |
| | User | `admin://view/users` | 🟢 Ready | `User`, `UserProfile` |
| | Mentor | `admin://view/mentors` | 🟢 Ready | `Mentor`, `MentorApplication` |
| **Landing Page** | Content Page | `admin://view/cms-pages` | 🟡 Partial | `Page`, `Post` |
| | Layout Page | `admin://view/landing-layout` | 🔴 Planned | Config / Theme Section |
| **Assessment** | Context | `admin://view/assessment-contexts` | 🟡 Partial | `ExamPackage`, `ExamSection` |
| | Question | `admin://view/assessment-questions` | 🟡 Partial | `Question`, `QuestionBank` |
| **Schedule** | Available Time | `admin://view/schedule-available-time` | 🟡 Partial | `MentorSchedule` |
| | Physical Room | `admin://view/schedule-physical-room` | 🔴 Planned | `rooms` (TBD) |
| **Component** | Media Library | `admin://view/media-library` | 🟡 Partial | `MediaAsset` |
| | Assessment | `admin://view/component-assessments` | 🟡 Partial | `ComponentDefinition`, `ExamPackage` |
| | Certificate | `admin://view/component-certificates` | 🟡 Partial | `ProgramCertificate` |
| | Forum | `admin://view/component-forums` | 🔴 Planned | `forums` (TBD) |
| | Participant | `admin://view/component-participants` | 🟡 Partial | `ProgramAccess` |
| | Schedule | `admin://view/component-schedules` | 🟡 Partial | `ProgramSession` |
| | Link | `admin://view/component-links` | 🔴 Planned | `ComponentDefinition` |
| **Workspace** | Tag | `admin://view/tags` | 🟢 Ready | `Tag` |
| | Program | `admin://view/programs` | 🟢 Ready | `Program`, `ProgramBatch`, `ProgramModule` |
| | Enrollment | `admin://view/enrollments` | 🟡 Partial | `ProgramAccess`, `AccessCode` |
| **Monitor** | Assessment Result | `admin://view/monitor-assessment-results` | 🟡 Partial | `ExamAttempt`, `ExamAnswer` |
| | Schedule Evaluation | `admin://view/monitor-schedule-evaluations` | 🔴 Planned | `SessionAttendance`, `evaluations` |
| **Materials** | Learning Topic | `admin://view/materials-learning-topics` | 🔴 Planned | `learning_topics` (TBD) |
| | Classification Support | `admin://view/materials-classification-support` | 🔴 Planned | `material_classifications` (TBD) |
| | Support for Learning Topic | `admin://view/materials-topic-support` | 🔴 Planned | `topic_supports` (TBD) |
| | Educational | `admin://view/materials-educational` | 🔴 Planned | `educational_resources` (TBD) |
| **Finance** | Voucher | `admin://view/finance-vouchers` | 🔴 Planned | `vouchers`, `AccessCode` |
| | Order | `admin://view/finance-orders` | 🟡 Partial | `Order`, `OrderItem` |
| | Invoice | `admin://view/finance-invoices` | 🟡 Partial | `Invoice` |
| | Transaction | `admin://view/finance-transactions` | 🟢 Ready | `Transaction`, `WalletTransaction` |
| | Report | `admin://view/finance-reports` | 🟡 Partial | `FinanceView` Agregasi |
| **Store** | E-Catalog (Fisik) | `admin://view/store-catalog` | 🟡 Partial | `StoreProduct`, `StoreOrder` |
| | Point | `admin://view/store-points` | 🟡 Partial | `PointWallet`, `PointTransaction` |
| | Shipment | `admin://view/store-shipments` | 🔴 Planned | `shipments` (TBD) |
| **System** | Menu Management | `admin://view/menus` | 🟢 Ready | `Menu` |
| | Appearance (Color Palette) | `admin://view/colorpalette` | 🟢 Ready | `ColorPalette` |
| | Documentation | `admin://view/documentation` | 🟡 Partial | Markdown Docs / Guide |
| | Telescope Monitoring | `/telescope` | 🟢 Ready | Laravel Telescope |
| **Database** | Data Manager | `admin://view/database-manager` | 🔴 Planned | Database Inspection Engine |
| | Backup | `admin://view/database-backup` | 🔴 Planned | Backup & Snapshot Service |

---

## 3. Spesifikasi Detail PRD Per-Menu & Alur Lemparannya

### Kategori 1: Dashboard
- **Route**: `admin://view/dashboard`
- **Status**: 🟢 **Ready**
- **Deskripsi Fitur Admin**:
  Menampilkan ringkasan metrik real-time: total pengguna aktif, perputaran omzet harian/bulanan, rasio penyelesaian program, jumlah batch berjalan, dan log aktivitas sistem cabang.
- **Alur Lemparan Pengguna**:
  - **Member**: Data pendaftaran akun baru dan checkout program masuk ke feed ringkasan admin.
  - **Student**: Keaktifan belajar, login, dan penyelesaian ujian memicu grafik progres siswa di dashboard.
  - **Mentor**: Jumlah jam terbang sesi mentor dan kehadiran siswa teragregasi di ringkasan operasional.

---

### Kategori 2: Personal
Mengelola data seluruh personil dalam ekosistem Arkanin.

#### 2.1 Role Permission
- **Route**: `admin://view/roles` | **Status**: 🟢 **Ready**
- **Deskripsi Admin**: Konfigurasi matriks hak akses Spatie (Roles & Permissions) untuk membatasi wewenang setiap staf, manajer cabang, dan instruktur.
- **Alur Lemparan**:
  - **Member & Student**: Mendapatkan permission level dasar (`view_profile`, `edit_profile`, akses katalog).
  - **Mentor**: Mendapatkan permission khusus `manage_students`, `view_dashboard_learning`, dan pengelolaan sesi.

#### 2.2 Branch (Cabang)
- **Route**: `admin://view/branches` | **Status**: 🟡 **Partial** (Model `Branch` tersedia)
- **Deskripsi Admin**: Manajemen kantor cabang regional Arkanin (kode cabang, nama, alamat, status aktif, penugasan manajer cabang).
- **Alur Lemparan**:
  - **Member**: Memilih cabang terdekat saat mendaftar kelas tatap muka offline.
  - **Student**: Terdaftar di database cabang lokal untuk penjadwalan kelas fisik.
  - **Mentor**: Ditugaskan pada cabang tertentu dan mendapatkan filter data siswa di cabang tersebut.

#### 2.3 User
- **Route**: `admin://view/users` | **Status**: 🟢 **Ready**
- **Deskripsi Admin**: Master data seluruh user terdaftar (filtering role, verifikasi akun, aktivasi/suspend, reset password, impersonate).
- **Alur Lemparan**:
  - **Member**: Pengguna yang berstatus non-aktif diblokir dari pembelian program.
  - **Student**: Akun student yang di-suspend langsung kehilangan akses Workspace.
  - **Mentor**: Akun mentor yang diverifikasi admin langsung tampil di daftar mentor platform.

#### 2.4 Mentor
- **Route**: `admin://view/mentors` | **Status**: 🟢 **Ready**
- **Deskripsi Admin**: Manajemen seleksi berkas pelamar mentor (`MentorApplication`), profiling spesialisasi, penentuan komisi bagi hasil, dan penilaian performa.
- **Alur Lemparan**:
  - **Member**: Melihat profil publik dan review mentor saat memilih program bimbel.
  - **Student**: Melakukan reservasi konsultasi langsung dengan mentor yang sudah terverifikasi.
  - **Mentor**: Menerima kontrak penugasan mengajar dan memantau status aplikasi lamarannya.

---

### Kategori 3: Landing Page
Mengatur elemen antarmuka yang dilihat oleh pengunjung publik dan member.

#### 3.1 Content Page
- **Route**: `admin://view/cms-pages` | **Status**: 🟡 **Partial** (Model `Page` & `Post` ready)
- **Deskripsi Admin**: Manajemen halaman statis (Tentang Kami, Syarat & Ketentuan, Kebijakan Privasi, FAQ) dan artikel blog wawasan edukasi.
- **Alur Lemparan**:
  - **Member**: Membaca informasi resmi dan artikel SEO untuk edukasi sebelum membeli program.
  - **Student**: Membaca panduan belajar dan tata tertib ujian.
  - **Mentor**: Membaca kode etik mengajar dan panduan instruktur.

#### 3.2 Layout Page
- **Route**: `admin://view/landing-layout` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Konfigurasi visual landing page (hero banner promosi, section testimoni, urutan showcase program unggulan).
- **Alur Lemparan**:
  - **Member**: Langsung disajikan hero promosi dan call-to-action pembelian program.
  - **Student & Mentor**: Memperoleh informasi event akbar atau peluncuran program baru di halaman beranda.

---

### Kategori 4: Master Assessment
Pusat manajemen tes, ujian, tryout, dan asesmen kompetensi.

#### 4.1 Context (Konteks Ujian)
- **Route**: `admin://view/assessment-contexts` | **Status**: 🟡 **Partial** (Model `ExamPackage`, `ExamSection` ready)
- **Deskripsi Admin**: Pengaturan parameter ujian: durasi pengerjaan, sistem penilaian (bobot skor IRT/konvensional), passing grade, batas toleransi pelanggaran (*anti-cheat proctoring*), dan instruksi pengerjaan.
- **Alur Lemparan**:
  - **Member**: Mengetahui spesifikasi tryout sebelum membeli tiket ujian.
  - **Student**: Memulai ujian sesuai aturan waktu dan tata tertib yang diatur di Context.
  - **Mentor**: Menggunakan konteks ini sebagai acuan analisis ketuntasan belajar siswa.

#### 4.2 Question (Bank Soal)
- **Route**: `admin://view/assessment-questions` | **Status**: 🟡 **Partial** (Model `Question`, `QuestionBank` ready)
- **Deskripsi Admin**: Input bank soal (teks kaya, rumus TeX/LaTeX, gambar ilustrasi), pilihan ganda/kompleks, kunci jawaban, dan pembahasan mendalam.
- **Alur Lemparan**:
  - **Student**: Mengerjakan butir soal secara acak (*randomized*) pada antarmuka Computer-Based Test (CBT).
  - **Mentor**: Meninjau kualitas soal dan mengevaluasi soal-soal dengan tingkat kesulitan tertinggi.

---

### Kategori 5: Schedule
Manajemen ketersediaan waktu dan alokasi ruang belajar tatap muka.

#### 5.1 Available Time (Ketersediaan Waktu)
- **Route**: `admin://view/schedule-available-time` | **Status**: 🟡 **Partial** (Model `MentorSchedule` ready)
- **Deskripsi Admin**: Pengaturan template jadwal operasional (jam sesi 1, 2, 3), batasan kuota bimbingan per hari, dan penetapan hari libur nasional.
- **Alur Lemparan**:
  - **Student**: Memilih slot waktu bimbingan yang masih terbuka saat booking mentor.
  - **Mentor**: Menandai slot waktu luang (*available*) atau berhalangan (*busy*).

#### 5.2 Physical Room (Ruangan Fisik)
- **Route**: `admin://view/schedule-physical-room` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Manajemen inventaris ruang kelas di setiap kantor cabang (nama ruang, kapasitas kursi, fasilitas proyektor/AC).
- **Alur Lemparan**:
  - **Student**: Mendapatkan informasi nomor ruang kelas fisik pada tiket jadwal belajar.
  - **Mentor**: Mengetahui alokasi ruang kelas sebelum memulai sesi tatap muka.

---

### Kategori 6: Component
Katalog blok bangunan modular (*building blocks*) yang dapat dipasangkan ke dalam kurikulum program.

#### 6.1 Media Library
- **Route**: `admin://view/media-library` | **Status**: 🟡 **Partial** (Model `MediaAsset` ready)
- **Deskripsi Admin**: Penyimpanan terpusat aset digital: video pembelajaran, rekaman sesi, modul PDF, dan slide presentasi.
- **Alur Lemparan**:
  - **Student**: Streaming materi video atau mengunduh bahan bacaan di dalam Workspace.
  - **Mentor**: Memilih materi dari library untuk dipresentasikan saat live class.

#### 6.2 Assessment Component
- **Route**: `admin://view/component-assessments` | **Status**: 🟡 **Partial**
- **Deskripsi Admin**: Mengaitkan paket ujian dari Master Assessment ke dalam tahapan modul program tertentu.
- **Alur Lemparan**:
  - **Student**: Mengerjakan kuis wajib sebelum membuka modul berikutnya (*prerequisite*).

#### 6.3 Certificate Component
- **Route**: `admin://view/component-certificates` | **Status**: 🟡 **Partial** (Model `ProgramCertificate` ready)
- **Deskripsi Admin**: Desain template sertifikat, penempatan variabel dinamis (nama siswa, serial number QR, tanda tangan direktur).
- **Alur Lemparan**:
  - **Student**: Menerima sertifikat digital terverifikasi di tab Workspace setelah menyelesaikan seluruh kriteria program.

#### 6.4 Forum Component
- **Route**: `admin://view/component-forums` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Pengaturan ruang diskusi interaktif per kelompok belajar, moderasi pesan, dan sematan pengumuman penting (*pinned post*).
- **Alur Lemparan**:
  - **Student**: Berdiskusi materi soal dan bertukar pandangan dengan teman sekelas.
  - **Mentor**: Menjawab pertanyaan siswa dan memandu diskusi akademik.

#### 6.5 Participant Component
- **Route**: `admin://view/component-participants` | **Status**: 🟡 **Partial** (Model `ProgramAccess` ready)
- **Deskripsi Admin**: Kontrol alokasi kuota siswa, pembagian kelompok kecil (*breakout group*), dan pembatasan interaksi antar siswa.
- **Alur Lemparan**:
  - **Student**: Masuk ke grup kelas yang sesuai dengan level kompetensinya.

#### 6.6 Schedule Component
- **Route**: `admin://view/component-schedules` | **Status**: 🟡 **Partial** (Model `ProgramSession` ready)
- **Deskripsi Admin**: Mengaitkan kalender sesi pertemuan terstruktur ke dalam program belajar.
- **Alur Lemparan**:
  - **Student**: Mengakses link kelas tatap muka atau video conference langsung dari jadwal modul.

#### 6.7 Link Component
- **Route**: `admin://view/component-links` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Integrasi tautan sumber eksternal (Google Drive, GitHub, repositori bacaan eksternal).
- **Alur Lemparan**:
  - **Student**: Mengakses sumber bacaan eksternal resmi secara terkurasi.

---

### Kategori 7: Workspace
Pengelolaan inti katalog kursus, program bimbingan, dan hak partisipasi siswa.

#### 7.1 Tag
- **Route**: `admin://view/tags` | **Status**: 🟢 **Ready**
- **Deskripsi Admin**: Pengelompokan taksonomi program (misal: "Kedinasan", "CPNS", "SNBT", "Fullstack Web", "Akuntansi").
- **Alur Lemparan**:
  - **Member**: Memfilter katalog program di halaman `/programs` berdasarkan kategori minat.

#### 7.2 Program
- **Route**: `admin://view/programs` | **Status**: 🟢 **Ready**
- **Deskripsi Admin**: Pembuatan paket program komprehensif: detail harga, kurikulum, modul bertingkat, penugasan mentor, dan pengaturan batch.
- **Alur Lemparan**:
  - **Member**: Melihat detail silabus dan membeli akses program.
  - **Student**: Belajar secara terstruktur di `/workspace` sesuai kurikulum batch yang dibeli.
  - **Mentor**: Mengajar dan mengawal siswa pada batch yang ditugaskan.

#### 7.3 Enrollment
- **Route**: `admin://view/enrollments` | **Status**: 🟡 **Partial** (Model `ProgramAccess` ready)
- **Deskripsi Admin**: Master data pendaftaran siswa aktif: pemberian akses manual (*grant*), perpanjangan masa aktif (*extend*), pembekuan sementara (*suspend*), dan pencabutan hak akses (*revoke*).
- **Alur Lemparan**:
  - **Student**: Mendapatkan status enrollment aktif (menu Workspace tampil di desktop/mobile navigation).

---

### Kategori 8: Monitor
Audit kualitas dan analitik hasil pembelajaran pasca-sesi.

#### 8.1 Assessment Result
- **Route**: `admin://view/monitor-assessment-results` | **Status**: 🟡 **Partial** (Model `ExamAttempt`, `ExamAnswer` ready)
- **Deskripsi Admin**: Rekapitulasi nilai tryout massal, ranking nasional/cabang, grafik daya pembeda soal, dan tingkat kelulusan passing grade.
- **Alur Lemparan**:
  - **Student**: Melihat peringkat leaderboard dan evaluasi kelemahan topik pada rapor nilai.
  - **Mentor**: Mengetahui materi apa yang belum dikuasai siswa untuk bahan evaluasi sesi bimbingan lanjutan.

#### 8.2 Schedule Evaluation
- **Route**: `admin://view/monitor-schedule-evaluations` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Audit kepatuhan jam mengajar mentor, catatan log bimbingan, serta rating ulasan yang diberikan oleh student.
- **Alur Lemparan**:
  - **Student**: Memberikan feedback bintang 1-5 dan ulasan performa mentor setelah sesi kelas berakhir.
  - **Mentor**: Memantau indeks kepuasan siswa terhadap metode pengajarannya.

---

### Kategori 9: Materials
Arsitektur materi pembelajaran dan pendukung akademik mendalam.

#### 9.1 Learning Topic
- **Route**: `admin://view/materials-learning-topics` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Taksonomi pohon keilmuan (misal: Matematika Dasar -> Aljabar -> Persamaan Kuadrat) sebagai referensi pemetaan silabus lintas program.
- **Alur Lemparan**:
  - **Student**: Memahami peta konsep (*knowledge graph*) materi yang sedang dipelajari.

#### 9.2 Classification Support
- **Route**: `admin://view/materials-classification-support` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Penandaan jenjang kesulitan materi (Pemula, Menengah, Mahir) dan estimasi jam belajar yang dibutuhkan.
- **Alur Lemparan**:
  - **Student**: Menyesuaikan ritme belajar mandiri berdasarkan tingkat kesulitan materi.

#### 9.3 Support for Learning Topic
- **Route**: `admin://view/materials-topic-support` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Bahan pendukung materi spesifik: lembar rumus ringkas (*cheat sheet*), glosarium istilah, dan bank referensi jurnal.
- **Alur Lemparan**:
  - **Student**: Mengunduh rangkuman rumus cepat saat persiapan ujian.

#### 9.4 Educational
- **Route**: `admin://view/materials-educational` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Koleksi materi motivasi belajar, tips manajemen waktu, dan strategi psikologis menghadapi ujian seleksi.
- **Alur Lemparan**:
  - **Member & Student**: Mengakses konten tips dan trik bebas biaya di portal edukasi.

---

### Kategori 10: Finance
Pengelolaan arus kas, transaksi pembayaran, faktur, dan pembagian hasil.

#### 10.1 Voucher
- **Route**: `admin://view/finance-vouchers` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Pembuatan kode kupon diskon (potongan persentase / nominal rupiah, batas kuota pemakaian, tanggal kedaluwarsa, syarat minimal transaksi).
- **Alur Lemparan**:
  - **Member**: Memasukkan kode voucher pada halaman checkout untuk memperoleh potongan harga.

#### 10.2 Order
- **Route**: `admin://view/finance-orders` | **Status**: 🟡 **Partial** (Model `Order`, `OrderItem` ready)
- **Deskripsi Admin**: Pelacakan setiap pesanan yang dibuat oleh pengguna, validasi manual order jika diperlukan, pembatalan pesanan kadaluwarsa.
- **Alur Lemparan**:
  - **Member**: Memantau status pesanan (Pending / Paid / Expired) pada halaman riwayat order.

#### 10.3 Invoice
- **Route**: `admin://view/finance-invoices` | **Status**: 🟡 **Partial** (Model `Invoice` ready)
- **Deskripsi Admin**: Penerbitan bukti tagihan resmi dengan nomor seri unik, penghitungan pajak (PPN), dan status pembayaran gateway.
- **Alur Lemparan**:
  - **Member**: Mengunduh salinan resmi invoice berformat PDF sebagai tanda bukti transaksi sah.

#### 10.4 Transaction
- **Route**: `admin://view/finance-transactions` | **Status**: 🟢 **Ready** (Model `Transaction`, `WalletTransaction` ready)
- **Deskripsi Admin**: Buku besar mutasi saldo digital, integrasi log payment gateway (Midtrans/Xendit/QRIS), dan penarikan dana (*withdrawal*).
- **Alur Lemparan**:
  - **Member**: Melakukan pembayaran instan via saldo dompet (*Wallet*) atau gateway.
  - **Mentor**: Mengajukan penarikan honor mengajar ke rekening bank pribadi.

#### 10.5 Report
- **Route**: `admin://view/finance-reports` | **Status**: 🟡 **Partial**
- **Deskripsi Admin**: Ekspor pembukuan keuangan bulanan, grafik pendapatan bersih platform, rekap bagi hasil mitra cabang, dan perhitungan komisi mentor.
- **Alur Lemparan**:
  - **Manajer Cabang**: Memperoleh laporan performa profitabilitas cabang masing-masing.

---

### Kategori 11: Store
Manajemen penjualan merchandise, buku modul cetak, dan poin loyalitas siswa.

#### 11.1 E-Catalog (Produk Fisik)
- **Route**: `admin://view/store-catalog` | **Status**: 🟡 **Partial** (Model `StoreProduct`, `StoreOrder` ready)
- **Deskripsi Admin**: Manajemen produk toko (buku modul cetak, seragam bimbingan, totebag, stiker), pengelolaan stok gudang, dan harga jual.
- **Alur Lemparan**:
  - **Member & Student**: Membeli barang fisik di halaman `/store` dan membayar via dompet atau gateway.

#### 11.2 Point (Poin Loyalitas)
- **Route**: `admin://view/store-points` | **Status**: 🟡 **Partial** (Model `PointWallet`, `PointTransaction` ready)
- **Deskripsi Admin**: Pengaturan perolehan poin siswa (misal: login berturut-turut, menyelesaikan tugas tepat waktu, nilai tryout tertinggi) dan rasio konversi ke hadiah.
- **Alur Lemparan**:
  - **Student**: Mengumpulkan poin di akunnya dan menukarkannya dengan diskon program atau merchandise gratis.

#### 11.3 Shipment (Pengiriman)
- **Route**: `admin://view/store-shipments` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Input resi ekspedisi kurir (JNE, J&T, SiCepat), status pengiriman (*Processing, Shipped, Delivered*), dan ongkos kirim.
- **Alur Lemparan**:
  - **Student / Member**: Melacak perjalanan paket fisik pesanan hingga sampai ke alamat rumah.

---

### Kategori 12: System
Konfigurasi lingkungan, navigasi, dan identitas visual aplikasi.

#### 12.1 Menu Management
- **Route**: `admin://view/menus` | **Status**: 🟢 **Ready**
- **Deskripsi Admin**: Pengaturan struktur pohon menu secara visual, pengurutan posisi (*order*), penetapan izin akses (*required_permission*), dan alokasi layout (Users Topbar, Users Bottom Navigation, Admin Sidebar, Admin Header).
- **Alur Lemparan**:
  - **Semua Peran**: Perubahan menu langsung terdistribusi ke navigasi antarmuka secara dinamis tanpa perlu deploy ulang kode aplikasi.

#### 12.2 Appearance (Color Palette)
- **Route**: `admin://view/colorpalette` | **Status**: 🟢 **Ready**
- **Deskripsi Admin**: Konfigurasi tema warna utama, warna sekunder, background, dan aksen untuk mode terang (*Light Mode*) dan gelap (*Dark Mode*).
- **Alur Lemparan**:
  - **Semua Peran**: Tampilan aplikasi seketika menerapkan token warna yang disinkronkan oleh admin.

#### 12.3 Documentation
- **Route**: `admin://view/documentation` | **Status**: 🟡 **Partial** (Repositori markdown tersedia)
- **Deskripsi Admin**: Pusat dokumentasi teknis, standard operating procedure (SOP) pengelolaan admin, dan rujukan API backend.

#### 12.4 Telescope Monitoring
- **Route**: `/telescope` | **Status**: 🟢 **Ready**
- **Deskripsi Admin**: Pemantauan mendalam query database, queue worker jobs, log exception error, dan performa request HTTP Laravel.

---

### Kategori 13: Database
Keamanan, pemeliharaan data, dan pemulihan bencana (*disaster recovery*).

#### 13.1 Data Manager
- **Route**: `admin://view/database-manager` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Utilitas inspeksi kesehatan tabel, pembersihan temporary data / cache kadaluwarsa, dan re-indeks pencarian data transaksi lama.
- **Alur Lemparan**:
  - **Sistem**: Menjaga performa query database tetap optimal pada beban kunjungan tinggi.

#### 13.2 Backup
- **Route**: `admin://view/database-backup` | **Status**: 🔴 **Planned**
- **Deskripsi Admin**: Pembuatan snapshot cadangan database harian/mingguan ke penyimpanan cloud (S3) serta fungsi restore instan jika terjadi insiden darurat.
- **Alur Lemparan**:
  - **Superadmin**: Menjamin proteksi data riwayat transaksi dan data akademik siswa dari kehilangan permanen.

---

## 4. Mekanisme Pembaruan Berkala (Maintenance & Review)

Dokumen PRD ini dirancang sebagai dokumen hidup (*living document*). Setiap kali tim pengembang hendak membangun servis baru untuk menu berkode 🔴 atau 🟡:
1. **Analisis Kebutuhan**: Periksa kolom *Alur Lemparan* pada menu terkait di dokumen ini.
2. **Implementasi Servis**: Bangun Controller, Model, dan Migration terkait di `apps/api`.
3. **Bangun Antarmuka**: Gantikan pemanggilan `PlaceholderView` di `apps/web/src/components/admin/layout/AdminLayout.tsx` dengan komponen view aktual.
4. **Perbarui Status PRD**: Ubah status kesiapan menu di dokumen ini dari 🔴 / 🟡 menjadi 🟢 **Ready**.
