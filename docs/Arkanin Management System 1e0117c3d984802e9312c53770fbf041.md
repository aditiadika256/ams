# Arkanin Management System

> **AMS** adalah super website yang digunakan oleh perusahaan sebagai aplikasi untuk mengelola hampir **keseluruhan** kegiatan di bimbingan belajar. Beberapa fungsinya dibagi ke: **Sistem Manajemen Cabang - Arkanin Super App (ASA)**, **Sistem Manajemen Keuangan dan Point - Arkanin Super Diamond (ASD), Sistem Manajemen Mentor - Arkanin Team**, **Sistem Manajemen Pembelajaran - Arkanin Plus**.
> 
- **Deskripsi Aplikasi**
    
    📌AMS : Aplikasi Website yang digunakan **Pengelola Pusat** untuk **Monitoring Keseluruhan**
    
    📌ASA : Aplikasi Website ***“Role-Based Access Control***” yang digunakan Manager dan Administrator **di setiap cabang** untuk mengelola **jadwal**, **keuangan** dsb
    
    📌ASD : Aplikasi Website **Keuangan** yang digunakan **Pengelola Pusat** dan **Pengelola Cabang**
    
    📌Arkanin Teams : Aplikasi Website/Android yang digunakan **MENTOR**
    
    📌Arkanin Plus : Aplikasi Website/Android yang digunakan **STUDENT**
    
    > **AMS** di *build* ke sistem kecil untuk setiap cabangnya disebut **ASA** dan **ASD
    AMS** di *build* ke sistem kecil untuk setiap usernya disebut A-Teams dan A+
    > 
- Gambaran Umum berbasis Miro | Menuju Business Core [‣](https://app.notion.com/p/7f04f69e1e0740a2afde85ac784b3384?pvs=21)
    
    https://miro.com/app/board/uXjVIToSrwk=/
    
    aditiadika256@gmail.com
    
    https://github.com/aditiadika256/ams/blob/main/docs/setup-local.md
    
    📌AMS mengatur cabang untuk ASA dan ASD, mengatur konten untuk A-Teams dan A-Plus
    
    📌Satu pintu masuk melalui **lms.arkanin.my.id**
    

---

- Tentang **CRUD, BREAD, CRAP, DAVE**
    
    
    | **Istilah** | **Kepanjangan** | **Fokus** |
    | --- | --- | --- |
    | CRUD | Create, Read, Update, Delete | **Create** membuat dari belum ada |
    | BREAD | Browse, Read, Edit, Add, Delete | **Add** menambahkan dari pilihan yang ada |
    | CRAP | Create, Read, Append, Process | **Append** menambahkan data baru tapi terbatas untuk edit data lama |
    | DAVE | Delete, Add, View, Edit | versi BREAD untuk user |
- Tentang ***Permission*** di ***Role-Based Access Control* (RBAC)**
    - 👥**Pengguna Umum**
        - MEMBER
        - STUDENT
            
            Mendaftar, melakukan pembayaran, memilih jadwal, mengikuti bimbingan, dan memberikan feedback.
            
    - 🎓 **Mitra Pengajar**
        - Mentor Harian
            
            Hanya ditugaskan jika tidak ada mentor utama yang tersedia, menerima tugas secara dinamis.
            
        - Mentor Utama
            
            Memprioritaskan jadwal yang diberikan kepada murid, mengajar secara reguler, dan mengisi daftar hadir.
            
    - **🎓 Manajemen Cabang**
        - Manajer Cabang
            
            Mengawasi seluruh admin, memastikan koordinasi antar tim berjalan lancar, dan bertanggung jawab atas kebijakan operasional.
            
            Mengatur harga paket, dan menganalisis kinerja mentor & murid.
            
        - Administrator Operasional
            
            Mengelola pendaftaran mentor & murid, mencocokkan jadwal, memverifikasi pembayaran, serta memastikan proses bimbingan berjalan sesuai SOP.
            
        - Administrator Kemitraan
            
            Menangani kerja sama dan kemitraan dengan pihak eksternal, utamanya mentor
            
        - Administrator Keuangan
            
            Mengelola keuangan, memproses pembayaran, membuat laporan keuangan
            
        - Administrator Pemasaran
            
            mengoptimalkan strategi promosi dan branding dan mendukung pemasaran digital.
            
        - Administrator Teknologi
            
            Mengelola platform digital, menangani sistem IT, mendukung pemasaran digital, serta mengoptimalkan strategi promosi dan branding.
            
    - **🎓 Manajemen Pusat**
        - Super Admin
            
            
        - Direktur
            
            Melihat laporan bisnis, mengelola keuangan
            
- Tentang **Ragam Jenis Program (Modular & Fleksibel)**
    
    Sistem **Arkanin** mendukung skema program dengan komponen yang dapat ditambah, dihapus, atau diurutkan (*Add/Delete Collection Components*) saat pembuatan program:
    
    - **Self-Learning (Pembelajaran Mandiri)**
        - **Komponen:** `Partisipant`, `Media Library` *(Collection)*, `Forum`, `Certificate`
        - **Syarat Kelulusan:** Disesuaikan oleh Admin (misal: *Progress Learning Path* = 100%).
    - **Self-Learning + Assessment (Pembelajaran Mandiri & Evaluasi)**
        - **Komponen:** `Partisipant`, `Media Library` *(Collection)*, `Assessment` *(Collection)*, `Forum`, `Certificate`
        - **Syarat Kelulusan:** Disesuaikan oleh Admin (*Passing grade* pada *Assessment* tidak wajib diaktifkan).
    - **Online Live Interactive (Kelas Online Interaktif)**
        - **Komponen:** `Partisipant`, `Schedule` *(Collection)*, `Media Library` *(Opsional)*, `Assessment` *(Opsional)*, `Link` *(Opsional)*, `Forum`, `Certificate`
        - **Syarat Kelulusan:** Disesuaikan oleh Admin (dapat didasarkan pada presensi *Schedule* saja tanpa harus ada *Assessment*).
    - **Offline Mentoring / In-Person (Kelas Tatap Muka)**
        - **Komponen:** `Partisipant`, `Schedule` *(Collection)*, `Media Library` *(Opsional)*, `Assessment` *(Opsional)*, `Link` *(Opsional)*, `Forum`, `Certificate`
        - **Syarat Kelulusan:** Disesuaikan oleh Admin (misal: verifikasi presensi *Scan QR* / *Tentor*).
    - **Terdapat jenis program lainnya,** misalnya hanya terdiri dari Assessment saja, atau hanya terdiri dari Schedule saja
- 
- Langkah Pengembangan
    
    User Story
    
    Operasional / Business Flow
    
    User/Customer Jorney 
    
    Financial atau Decision Flow
    
- First User Story -  **Program, Store, dan Workspace + E-Payment**
    
    Flow yang dijalankan yaitu:
    
    1. **Guest** (*user*) menjadi **MEMBER**, melakukan pembelian **PROGRAM** *class* seperti **bimbingan, pelatihan, konsultasi, *tryout* dan a*rticle subscription* maka menjadi **STUDENT** dan memperoleh **POINT**. → menggunakan *E-Payment*
    2. **Guest** (*user*) menjadi **MEMBER**, melakukan pembelian **POINT.** → menggunakan *E-Payment*
    3. **Guest** (*user*) menjadi **MEMBER**, melakukan pembelian **STORE** *merchandise* seperti baju, topi, buku, tas dsb . → menggunakan **POINT**
    4. **POINT** dapat berakhir masa berlakunya, selalu bersisa saat ditukarkan dengan produk!
        
        > **Guest** (*user*) → MEMBER → STUDENT
        > 
    5. **Guest** (*user*) menjadi **MEMBER** mendaftar sebagai **Mentor Harian/Mentor Utama,** kemudian mengikuti Ujian di **PROGRAM** *class,* dan memperoleh sertifikat.
    6. **Mentor Harian/Mentor Utama** dan **STUDENT** mengakses *class* melalui **WORKSPACE** 
    7. Saldo dari Mentor yang sudah mengajar ada di dalam **POINT**
    8. Member punya versi Mobile di  **TopBar (Side Pop Humberger)** dan **BottomNav** serta versi Desktop **TopBar (Header NavBar)**
    9. Admin punya versi Mobile di **SideBar Pop Hamburger** dan versi Desktop sebagai **SideBar**
    10. E-Payment dsb akan dijelaskan di bagian berikutnya.
- Bagaimana sistem Dashboard dan Brach📌📌
    
    Kaitan dgn Student
    
    Kaitan dgn Program
    

- **Teknologi dan Arsitektur**
    
    **Monorepo Architecture:** Terbagi menjadi aplikasi Backend (`apps/api`) dan Frontend (`apps/web`). 
    
    **Domain-Driven Design (DDD) / Action Pattern:** Di sisi backend Laravel, logika bisnis diisolasi ke dalam modul domain (`app/Domain`) dan kelas *Action* (`app/Actions`).
    
- Struktur Repository
    
    ```
    ams-main/
    ├── apps/
    │   ├── api/                           # Backend Application (Laravel)
    │   │   ├── app/
    │   │   │   ├── Actions/               # Business Logic / Use Cases (Access, Components, Learning, Orders, Programs)
    │   │   │   ├── Domain/                # Controller per Domain (Access, Admin, Analytics, Auth, CBT, CMS, Finance, Learning, Sales, System, Workspace)
    │   │   │   ├── Enums/                 # AccessStatus, ProgramStatus, BatchMode, dll.
    │   │   │   ├── Events/ & Exceptions/  # Custom Domain Exceptions & Events
    │   │   │   ├── Http/                  # Controllers, Middleware, Requests, Resources
    │   │   │   ├── Models/                # Eloquent Models (User, Program, AccessCode, ExamSession, dll.)
    │   │   │   ├── Queries/               # Dedicated Query Classes (WorkspaceQuery, ProgramCatalogQuery, dll.)
    │   │   │   └── Support/               # Validators, Access Gates & Handlers
    │   │   ├── config/                    # Configuration Files
    │   │   ├── database/                  # Migrations, Seeders, Factories
    │   │   ├── routes/                    # API & Web Routes (api.php, console.php, web.php)
    │   │   └── tests/                     # Feature, Unit, & Postgres Tests
    │   │
    │   └── web/                           # Frontend Application (Next.js / TypeScript)
    │       ├── src/
    │       │   ├── app/                   # App Router (admin, auth, checkout, dashboard, exams, orders, programs, workspace)
    │       │   ├── components/            # UI Components (admin views, workspace, ui/ shadcn/skiper)
    │       │   ├── lib/                   # API utilities, Session, Extraction
    │       │   ├── store/                 # Zustand Stores (useAdminStore, useAuthStore, useWorkspaceStore, dll.)
    │       │   └── types/                 # TypeScript Interfaces/Types
    │       └── tests/
    │
    ├── docs/                              # Dokumentasi Teknis & API Specifications
    │   ├── api/                           # API Contracts (Admin CMS, Auth, CBT, Finance, Learning)
    │   ├── dev-guide/                     # Guide Refactoring & Integration (Google OAuth, Vercel/Railway)
    │   └── plans/                         # PRD & Technical Design Documents
    │
    └── ops/                               # Infrastructure Setup (Docker, Nginx Config)
    ```
    
- Peta Jalan Tahap 1 - **MVP (Minimum Viable Product)**
    - Acceptance Criteria
        - [ ]  RBAC dan Sistem Pengelolaan Cabang
        - [ ]  Kemampuan Financial Report dan Point
    
    Landing Page | Program | Workspace | Store | Profile | Notification
    
    Admin untuk keseluruhan sistem
    
- Peta Jalan Tahap 2 - **Manual to Automated Transactions**
    
    Menyiapkan integrasi ke Flip Business
    
    - Gamification Tahap 1 - Gratis TryOut
        1. Terdaftar sebagai Member, Akses ke **PROGRAM**, kemudian memasukkan **Enrollment Code,** Mengakses produk di bagian **WORKSPACE,**
        2. Kompetisi pengerjaan TryOut, pemenangnya memperoleh **POINT.** Semakin banyak pengerjaan semakin banyak point terkumpul. Member dapat menukarnya dengan produk di **STORE**
        3. husus untuk Pemasaran Lapisan I ini meskipun member Enroll ke Program, itu tidak menjadikannya Student.
    - Gamification Tahap 2 - Kompetisi Bank Soal
        1. Kompetisi membuat soal, untuk mentor, perlu sistem approve (dan status usulan) ke bank soal.
        2. 
- Peta Jalan Tahap 3  - **Monetization**
    - **Other Support for Learning Topic | Workspace | A-Team**
        
        [Google Form](https://app.notion.com/p/Google-Form-b07c77c7c05948c29800959a60fb334a?pvs=21)
        
        [Quizizz](https://app.notion.com/p/Quizizz-e2e2295c92d14b398e78f4e884a8663a?pvs=21)
        
        [WorldWall](https://app.notion.com/p/WorldWall-f68d06adc5074454ba82a482fd501f79?pvs=21)
        
        [Kahoot](https://app.notion.com/p/Kahoot-af7cbf60668e467f9234e790e5d274a6?pvs=21)
        
        [Quizlet](https://app.notion.com/p/Quizlet-67d314712fec4916bdd26f51cc6e11c7?pvs=21)
        
        [Sway](https://app.notion.com/p/Sway-a59b6d372655472890c21b9a0f63cbd4?pvs=21)
        
        [Educandy](https://app.notion.com/p/Educandy-a2d59b79246f49caadeb05c9d1349261?pvs=21)
        
        [DuoLingo](https://app.notion.com/p/DuoLingo-38b4295e12b644538620547f9644e3d7?pvs=21)
        
        [Easy Test Maker](https://app.notion.com/p/Easy-Test-Maker-8408187a9fcb45f095462b0a615b601b?pvs=21)
        
        [Slido](https://app.notion.com/p/Slido-e8cf640f85234f498cb021e7b1748e33?pvs=21)
        
        [Buat kuis](https://app.notion.com/p/Buat-kuis-2df9f93eeb474e278e5aed4e9535f561?pvs=21)
        
        [Go Conqr](https://app.notion.com/p/Go-Conqr-f4fb4863e4884110b34e24d7940e9d9a?pvs=21)
        
        [Knowly Quiz](https://app.notion.com/p/Knowly-Quiz-8fd195f9d92e4ec99284ea4cf56f4308?pvs=21)
        
        [Class Marker](https://app.notion.com/p/Class-Marker-31d01f6c8b9f4d179a1e6fa7f2a050ae?pvs=21)
        
        [Help Teaching](https://app.notion.com/p/Help-Teaching-20641532688e48a699d959028421be8f?pvs=21)
        
        [Pro Profs](https://app.notion.com/p/Pro-Profs-d1b3b2553aeb4aa28d9d98741b9129e4?pvs=21)
        
        [Poll Maker](https://app.notion.com/p/Poll-Maker-2b85447fa81746d9aec29fa1af17391d?pvs=21)
        
        [School House Technologies ](https://app.notion.com/p/School-House-Technologies-341ee6f0b4244f76ba81fd7d3aef501e?pvs=21)
        
        [Aeticulate](https://app.notion.com/p/Aeticulate-ced897d96b634d63974fc69d49796b6d?pvs=21)
        
        **Bisa menggunakan beberapa pilihan aplikasi berikut ini :**
        
        - Kahoot (membuat kelas digital)
        - Google Classroom (membuat kelas digital)
        - Microsoft Teams (membuat kelas digital)
        - LMS Canvas (membuat kelas digital)
        - Quora (membuat kelas digital)
        - Open Study (membuat kelas digital)
        - Lectora (membuat kelas digital)
    - **News Articles Subscriptions | Workspace | A-Plus**
        
        Contoh: Warstek, DW, App NewScientist (paling pas)
        
        **Mode Read or Listen**
        
    - **Gamification, Point & Balance | Workspace | A-Plus**
        
        Menampilkan daftar game atau tantangan dan sistem point dari game tersebut, serta fitur penukaran saldo menjadi point.
        

---

## **Fitur Spesifik ADMIN UI**

- 📌CATATAN
    
    <aside>
    💡
    
    Pengelolaan berfokus pada tahapan dari Atas ke Bawah, jika ingin membuat program/ujian/mengelola lainnya, maka harus menyelesaikan bagian atasnya terlebih dahulu sebelum bisa membuat/mengelolanya. Namun ada juga beberapa bagian yang memiliki konsep Cycle, dari A ke B ke C, Kembali ke B lagi lalu ke D
    
    </aside>
    
- Personal
    - Role & Permission
        - Multi Roles
            
            Iya, secara umum konsep **beralih mode** (*active role switching*) membuat izin atau fungsi dari role lain dinonaktifkan sementara di sesi pengguna yang sedang berjalan.
            
            Aturan dasarnya cukup sederhana:
            
            - **Izin Baku (Permission):** Tetap melekat di akun pengguna (pengguna tidak kehilangan hak aksesnya secara permanen).
            - **Konteks Aktif (Context/Session):** Hanya fungsi dan antarmuka dari role yang sedang dipilih yang dijalankan oleh sistem.
            
            ### Cara Kerjanya di Sistem
            
            1. **Sesi Aktif (Active Session)**
                
                Saat pengguna memilih "Mode Peneliti", sistem menyimpan nilai `active_role = 'peneliti'` di dalam *session* atau *token (JWT)*.
                
            2. **Pembatasan Eksekusi**
                
                Fungsi `getDashboard()` hanya akan mengeksekusi logika milik role `peneliti`. Akses ke fitur khusus `dosen` diblokir sementara sampai pengguna beralih mode kembali.
                
            3. **Pemberitahuan UI**
                
                Antarmuka aplikasi menyesuaikan menu dan tombol sesuai role aktif agar pengguna tidak bingung.
                
            
            ### Kapan Menggunakan Pendekatan Ini?
            
            - **Cocok digunakan jika:** Menu, dashboard, atau alur kerja antar role sangat berbeda jauh dan rentan membingungkan pengguna jika digabung.
            - **Kurang cocok jika:** Pengguna butuh melakukan tindakan lintas role secara bersamaan dalam satu halaman tanpa harus bolak-balik mengganti mode.
    - Branch
        
        Kinerja Cabang yaitu   jumlah murid, mentor, pertemuan, arus kas dan sistem point
        
    - User
        
        Akun Orang Tua meihat perkembangan Anaknya
        
    - Mentor
        
        Daftar tutor bisa lampirkan CV
        
- Landing Page
    - Content Page
        - Table View
            
            Title | Author | Status | Last Edited | Action
            
            Status terdiri dari : Draft, Published, Archived
            
            Action terdiri dari : Edit, Delete
            
        - Add New or Edit Content
            
            Fitur penambahan lebih dari 1 gambar, dan teks yang bisa menyisipkan gambar diantaranya, serta penambahan format teks standar (bold, italic, dsb).
            
            Sebaiknya meniru konsep blogger saja
            
        - CATATAN PENGEMBANGAN
            
            Pengembangan selanjutnya: tambah Label (Hirarki), atur gratis/berlangganan, menambahkan role baru yaitu author, slug dibuat dapat diatur, visibilitas dihilangkan
            
        1. Admin membuat Content Page terlebih dahulu kemudian baru bisa mengatur Layout Page.
        2. Content Page yang dibuat admin seperti blog pada umumnya.
        3. Content Page dalam Peta Jalan Tahap 3, akan dibuat sebagian menjadi berlangganan.
        4. Content Page dapat berisi iklan, informasi sains terbaru, atau berbagai hal yang mendukung bidang publikasi.
    - Layout Page
        
        Edit | Preview | Default
        
        Add Grid | Add List | Add Section | Add Title | Add Body
        
        1. Layout Page bentuknya seperti membuat halaman statis, namun ada bagian-bagian tertentu yang kemudian berisi daftar Content Page yang ingin ditampilkan.
        2. Jadi alurnya admin membuat Content Page dulu kemudian bisa mengatur Layout Page
        
        Add Pop Up (khusus muncul di Beranda ini) untuk sistem pengelolaan iklan
        
- Assessment **Tool**
    - Context
        
        Menampung narasi, artikel, studi kasus, atau skenario utama.
        
    - Question
        
        Soal & kunci jawaban (1 Context bisa memiliki banyak Question)
        
- Schedule **Tool**
    - Available Time
        
        Slot jadwal mentor (Tanggal, Hari, Jam Mulai/Selesai/Durasi, serta *Learning Topic* yang diajar).
        
        Memunculkan usulan waktu dari mentor - Bulk (Tanggal Mulai, dan selesai, Jam mulai dan selesai, Durasi per sesi
        
        Pilih tanggal, jam mulai dan selesai, serta durasi
        
    - Physical Room
        
        
        Pengelolaan ruangan per *Branch* (Kapasitas Maksimal & *Available Seat*) untuk kelas offline.
        
        Manajemen ruangan fisik per *Branch* (Kapasitas & *Available Seat*).
        (Batas kapasitas ruangan
        
        Room name | Type | Branch | capacity | Action
        
        Lokasi
        
- Component **Tool**
    - 📌CATATAN
        
        <aside>
        💡
        
        ### **Component p**engaturannya terbagi menjadi 2 jenis alur:
        
        - **System-Defined Components (Diatur System/Admin di Awal):**
            - Langsung siap dan ditampilkan di sisi Student setelah *enroll* (seperti *Media Library*, *Forum Link*, Certificate, dll.).
        - **Post-Enrollment / Dynamic Components (Diatur Setelah Student Terdaftar):**
            - Mengambil data dari **Sub-Composer** (misal: mengambil data *Assessment* atau *Available Time* milik Mentor/Admin) yang kemudian dicocokkan atau di-assign setelah siswa resmi terdaftar di *Enrollment*.
        </aside>
        
    - Media Library | From System to Student
        
        Title | Type | Source | Media Duration | Learning Topic | Use in Component | Action
        
        **Title / Name:** Judul materi.
        
        **Type:** Jenis media (Video / Embedded Player, Document PDF, Audio, External Link/URL).
        
        **Source / File Upload:** URL/File aset.
        
        **Media Estimate Time:** Durasi estimasi (dalam menit/detik, penting untuk kalkulasi *total learning hours*).
        
        **Learning Topic:**
        
        **Downloadable Toggle:** Apakah file boleh diunduh siswa atau hanya bisa dilihat (*View Only*).
        
    - Assessment | From System to Student
        - Step 1: Basic Information & Visual Mode
            1. Write **Assessment Title & Code**: Nama master paket ujian dan kode referensi internal.
            2. Write **Assessment Description:** Petunjuk teknis pengerjaan untuk siswa.
            3. Choose **Learning Topic** (data diambil dari Menu Material), dan **Tag** (Diambil dri Menu Component).
            4. **Visual Mode Selection**: Pilihan antarmuka pengerjaan siswa (`Standard` | `CPNS` | `UTBK/SNBT` | `AKM` | `OSN`).
        - Step 2: Sub-Assessment Structure & Intermission Config
            1. Tentukan **Jumlah Sub Assessment + Title Sub Assessment**
            2. Tentukan **Flow & Intermission Type**: yaitu `Direct Continuous`: Berlanjut otomatis ke sub-tes berikutnya tanpa jeda. `Intermission Break`: Ada jeda istirahat dengan durasi terbatas antar sub-tes .
            3. **Flexible Positioning**: Pengaturan urutan sub-assessment menggunakan fitur *drag & drop*.
            4. Setiap **Sub Assessment** ditentukan **Total Question**
        - Step 3: Question Selector & Context Grouping
            1. Bagian ini sudah menyediakan daftar Sub Assessment dan **Slot Question**
            2. **Memilih Question dilakukan** dengan cara, penerapan Filter Learning Topic, Question Level, Tag, Question Estimate Time, dan Text Search - **Question Fetching & Filtering**
            3. Dapat memilih (ya/tidak) penerapan **Batch Selection & Auto-Grouping**: Sistem otomatis mengelompokkan soal-soal yang memiliki wacana/context yang sama agar tampil berurutan.
            4. **Flexible Positioning**: Pengaturan urutan Question menggunakan fitur *drag & drop*.
        - Step 4: Scoring & Weighting Engine
            1. Menampilkan daftar tabel Sub-Assessment dan Question
            2. Mengatur **Scoring Method**:
                - `Same Weight`: Seluruh soal bernilai sama.
                - `Custom Weight per Question`: Mengatur poin berbeda per nomor soal.
                - `Scale Score`: Skala nilai (misal: 1–5 pada soal TKP CPNS).
                - `IRT / Classical`: Mengaktifkan rumus pembobotan khusus.
            3. Menentukan (opsional) **Negative Marking Rules**: Menentukan nilai untuk jawaban benar (+4), salah (-1), dan kosong (0).
            4. Mengatur **Max Score Summary**: Kalkulasi otomatis total skor maksimum (misal: Total 500 Pts).
        - Step 4,1: Penjelasan Lanjutan perihal **Scoring Method**
            1. **Pemilihan Config Method (Metode Penilaian)**
            • Tampilkan *Radio Button* atau *Drop-down* di panel Pengaturan Nilai Assessment:
                ◦ **Same Weight:** Menampilkan 1 input global: *Max Score per Question*. Semua nomor otomatis menggunakan angka ini.
                ◦ **Custom Weight per Question:** Mengubah tampilan daftar soal menjadi tabel interaktif. Setiap nomor memiliki kolom input nilai (*Point/Weight*) yang bisa diubah satu per satu.
                ◦ **Scale Score:** Mengubah input opsi jawaban di tiap soal. Setiap opsi (A, B, C, D, E) membuka 5 kolom input poin terpisah (misal: A=5, B=4, C=3, D=2, E=1).
                ◦ **IRT / Classical:** Menyembunyikan input bobot manual di tingkat nomor. Sistem menampilkan pengali/formula dasar dan mengaktifkan kalkulasi otomatis pasca-ujian (*post-exam calculation*).
            2. **Pengaturan Negative Marking Rules**
            • Sediakan opsi *toggle* **"Aktifkan Nilai Minus/Negative Marking"**.
            • Jika aktif, tampilkan 3 kolom input:
                ◦ **Benar (+):** Nilai positif (default: +4 atau disesuaikan dengan bobot soal).
                ◦ **Salah (-):** Nilai pengurang (default: -1).
                ◦ **Tidak Dijawab (0):** Nilai netral (default: 0).
            3. **Max Score Summary Bar (Kalkulasi Real-Time)**
            • Tempatkan komponen *Summary Widget* yang *sticky* (selalu terlihat di bagian atas/bawah layar) saat pengguna menyusun soal.
            • **Formula Kalkulasi Otomatis:**$$\text{Total Max Score} = \sum \text{Max Score per Soal/Sub-Assessment}$$
            • **Metrik yang Ditampilkan:**
                ◦ Total Soal Terpilih
                ◦ Total Estimasi Waktu (akumulasi estimasi waktu tiap soal)
                ◦ Total Skor Maksimum (misal: *Total 500 Pts*)
                ◦ Status kelengkapan kunci jawaban / pembobotan.
        - Step 4,3: Contoh Penerapan Khusus untuk **Scoring Method: IRT/Classical**
            
            Bagian ini adalah jembatan yang akan terhubung ke **Monitor >Assessment Analysis**
            
            - **UI Element:**
                - **Option Selection:** Radio Button / Dropdown untuk memilih **"IRT / Classical Engine"**.
                - **Model Selector (IRT):**
                    - `Rasch / 1PL` (Hanya menghitung tingkat kesukaran $b$).
                    - `2PL` (Menghitung kesukaran $b$ + daya beda $a$).
                    - `3PL` (Menghitung kesukaran $b$ + daya beda $a$ + tebakan acak $c$).
                - **Classical Method Selector (CTT):**
                    - `Proportional Weighting` (Pengali berdasarkan indeks $p$).
                - **Notice / Information Banner:**
                    
                    > *"Sistem ini menggunakan perhitungan statistik pasca-ujian. Skor sementara yang tampil pada layar siswa setelah submit adalah **Jumlah Benar (Raw Score)**. Skor akhir berbasis IRT/Classical akan dihitung setelah sesi ujian resmi ditutup."*
                    > 
        - Step 4,5: Step-by-Step Implementation Flow
            
            Penerapan sistem **IRT / Classical** membutuhkan alur (*flow*) dua tahap: **Tahap Setup (Konfigurasi Ujian)** dan **Tahap Post-Exam (Pengolahan Nilai & Analisis)**.
            
            Berikut adalah rancangan struktur menu, *flowchart* alur sistem, serta rincian antarmuka (UI) yang siap diimplementasikan ke dalam arsitektur aplikasi Anda:
            
            #### **1.Tahap 1: Setup Konfigurasi Scoring:**
            
            Sebelum Ujian Dimulai.
            
            1. Admin/Pengajar memilih opsi **IRT / Classical** di *Step 4 Scoring Engine*.
            2. Menentukan parameter konversi skor akhir (misalnya: Rentang skor dikonversi ke skala **0–100** atau **100–1000** seperti UTBK).
            3. Menyimpan draf dan mempublikasikan jadwal ujian.
            
            **2.Tahap 2: Pengerjaan & Pengumpulan Data:**
            
            Saat Ujian Berlangsung.
            
            1. Peserta mengerjakan ujian secara online.
            2. Sistem merekam seluruh respons jawaban per nomor soal (1 = Benar, 0 = Salah) secara acurat ke dalam *matrix data*.
            3. Setelah waktu pengerjaan habis, ujian ditutup secara nasional/serentak.
            
            **3.Tahap 3: Perhitungan Statistik Pasca-Ujian:**
            
            Menu Hasil & Analisis.
            
            1. Admin masuk ke menu **Assessment Results** $\rightarrow$ **Scoring & Item Analysis**.
            2. Klik tombol **"Jalankan Engine Kalkulasi IRT"**.
            3. Backend memproses:
                - Estimasi parameter soal ($b$, $a$, $c$).
                - Estimasi tingkat kemampuan masing-masing peserta ($\theta$).
                - Konversi $\theta$ menjadi skor akhir.
            
            **4.Tahap 4: Review, Anulir Soal & Publish:**
            
            Finalisasi Hasil.
            
            1. Pengajar mengecek hasil analisis butir soal. Jika ada soal yang bermasalah (*Item Fit* buruk atau *Discrimination* negatif), pengajar dapat memilih opsi **Anulir / Drop Question**.
            2. Jika ada soal di-anulir, klik **"Recalculate IRT"** untuk menghitung ulang secara otomatis.
            3. Klik **"Publish Hasil"** agar nilai resmi dapat dilihat oleh masing-masing peserta di portal mereka.
            
            ### Hal Penting dalam Arsitektur Backend & Database
            
            1. **Pemisahan Penyimpanan Skor:**
                - Di tabel `student_assessments`, sediakan dua kolom terpisah:
                    - `raw_score` (Jumlah jawaban benar / skor awal mentah).
                    - `final_score` (Skor hasil kalkulasi IRT/Classical).
            2. **Matrix Response Data:**
                - Buat tabel perantara `exam_item_responses` yang mencatat relasi: `user_id`, `question_id`, `is_correct` (0 atau 1). Data ini yang dialirkan ke algoritma/library perhitungan IRT (seperti pustaka Python *mirt* / *pyirt* atau Microservice terpisah).
        - Step 5: Technical Timer & Display Rules
            - **Assessment Estimate Time** (Terhitung otomatis dari Question Estimate Time)
            - **Timer Mode**: `Count Down (Minutes)` atau `No Limit`.
            - **Sub-Assessment Timer Enforcement**: Penguncian durasi spesifik per sub-tes.
            - **Display & Navigation Rules**:
                - *Bisa membuat soal yang muncul berbeda dan itu pakai siswa Randomized Question Slot - Atau opsionalnya Static* (Semua soal keluar) & *Randomized* (Ambil soal acak).
                - `Randomize Question Order` & `Randomize Option Order`.
                - `Prevent Backtracking`: Mengunci pengerjaan agar siswa tidak bisa kembali ke nomor soal sebelumnya.
            - Tentukan **Status** (Draft | Published)
    - 📌CATATAN untuk Assessment
        
        Struktur pemikiran kamu **sudah sangat lengkap dan mendalam**! Seluruh variabel penting mulai dari *Question Selector*, *Pembobotan*, *Rules*, *Timer*, *Result*, hingga *Live Proctoring* sudah masuk ke dalam skenario.
        
        Masalah utama dari draf kamu di atas hanyalah **penumpukan variabel di satu tempat**. Kamu mencampurkan antara **Konstruksi Konten (Template)**, **Aturan Eksekusi Program (Delivery Rules)**, dan **Kontrol Lapangan (Monitoring Live)** ke dalam satu menu `Component > Assessment`.
        
        Berikut adalah perapihan alur dan pemetaan *setting* yang presisi untuk setiap layer menu agar tidak ada lagi *setting* yang bentrok atau tumpang tindih.
        
        ### Pemetaan Alur & Setting per Layer Menu
        
        ```
        [ LEVEL 1: ASSESSMENT ]
        ├── Sub Menu: Context Bank (Wacana, Gambar, LaTeX, Media)
        └── Sub Menu: Question Bank (Membuat Pertanyaan, Opsi Jawaban, Kunci, & Pembahasan)
        
        [ LEVEL 2: COMPONENT ]
        ├── Sub Menu: Media Library (Video, PDF, PPT)
        ├── Sub Menu: Certificate (Template Sertifikat)
        ├── Sub Menu: Schedule (Kalender Event Master)
        └── Sub Menu: Assessment (Master Package / Blueprint Ujian)
        
        [ LEVEL 3: WORKSPACE ]
        ├── Sub Menu: Program (Learning Path, Aturan Pengerjaan, & Pengikatan Sertifikat)
        └── Sub Menu: Enrollment (Pendaftaran Siswa & Akses Kelas)
        
        [ LEVEL 4: MONITOR ]
        ├── Sub Menu: Live Proctoring (Kontrol Lapangan Real-time & Token)
        ├── Sub Menu: Assessment Result (Rekap Nilai, Review Jawaban, & Cetak)
        └── Sub Menu: Item Analytics (Statistik Kualitas Soal)
        ```
        
        ### Pembagian Setting Detail untuk Setiap Layer
        
        #### 1. Menu: `Component > Assessment` (Master Package Builder)
        
        *Fokus: Merangkai soal menjadi paket master, menentukan pembobotan, visual mode, dan batas waktu teknis pengerjaan.*
        
        - **Basic Info**: Title, Description, Learning Topic, Tags, Visual Mode (`Standard` | `CPNS` | `TKA` | `AKM` | `OSN` | `OMI`).
        - **Sub-Assessment Structure**:
            - Menambah Sub-Assessment (Seksi/Sub-tes) + Title Sub-Assessment.
            - Menentukan mode pengerjaan antar Sub-Assessment: `Direct Continuous` (langsung berurutan tanpa jeda) atau `Intermission Break` (ada jeda waktu/tombol istirahat antar Sub-tes).
            - Flex-positioning via Drag & Drop.
        - **Question Selector**:
            - Filter (Topic, Level, Tag, Estimate Time, Text Search).
            - Batch Selection & Auto-grouping (soal dengan Context yang sama wajib berurutan).
        - **Scoring & Weighting System**:
            - Config Method: `Same Weight for All` | `Custom Weight per Question` | `IRT` | `Classical`.
            - Enable Negative Marking (Benar: +4, Salah: -1, Kosong: 0).
            - Setting Skala Skor (misal: TKP CPNS Skala 1–5).
            - Total Max Score Calculator (Auto-calculated, misal: 500 Pts).
        - **Technical Timer & Display**:
            - Assessment Estimate Time (Auto-calculated).
            - Time Limit Mode: `Count Down (Minutes)` | `No Limit`.
            - Enforce Sub-Assessment Timer (Durasi terkunci per Sub-tes).
            - Auto-submit when section time expires.
            - Question Display Mode: `Static` | `Randomized`.
            - Randomize Question Order & Randomize Option Order.
            - Navigation Lock: Prevent Backtracking (Cegah lompat soal).
        
        #### 2. Menu: `Workspace > Program` (Execution & Delivery Rules)
        
        *Fokus: Menentukan bagaimana Component Assessment dikerjakan di dalam Program tertentu.*
        
        - **Learning Path Assembly**: Menyuun alur (misal: Pre-test $\rightarrow$ Media Library $\rightarrow$ Mentoring $\rightarrow$ Post-test).
        - **Access & Schedule Restrictions**:
            - Mode Akses: `Subscription / Self-Paced` | `Scheduled Window`.
            - Date Restrictions: Start Date & End Date `[ YYYY-MM-DD HH:mm ]`.
            - Max Attempts Rules: `Unlimited` | `Fixed Attempts (1x, 3x, dst)` | `Attempt Reset Period`.
        - **Passing Grade & Grading System**:
            - Result Type: `Passing Grade (Pass/Fail)` | `Non Passing Grade (Score Only)`.
            - Grade Threshold (Passing Score/Percentage, misal: Min 75/100).
            - Score Ranges & Grade Mapping (misal: A = 85–100, B = 70–84).
        - **Completion & Gamification Reward**:
            - Gamification Point Reward (Poin otomatis yang masuk ke akun siswa jika tembus *Passing Grade*).
            - Syarat Kelulusan: Mark as required condition for Certificate Issue (`Component > Certificate`).
        - **Answer Key & Explanation Policy**:
            - Show Answer Key & Instant Explanation: `After Submit` | `After Program Ends` | `Never`.
        - **Security Level Checklist**:
            - [ ]  `[x]` Require Exam Token to Start.
            - [ ]  `[x]` Fullscreen Lock & Block Tab Switch (Detect/Lock on Tab Change).
            - [ ]  `[x]` Disable Copy-Paste & Right-Click.
        
        #### 3. Menu: `Monitor` (Operational Control & Reporting)
        
        *Fokus: Eksekusi lapangan, pengawasan langsung, dan laporan akhir.*
        
        - **Sub Menu: Live Proctoring (Pusat Kontrol Lapangan)**
            - **Dynamic Token Engine**:
                - Token Code Generator (6 karakter acak, misal: `K3J9A2`).
                - Token Refresh Timer (misal: token expired setiap 30 menit).
            - **Live Student Board**:
                - Status: Active, Submitted, Disconnected, Fraud Warning.
                - Tab Switch Counter (Deteksi kecurangan & notifikasi pause).
            - **Proctor Action**:
                - Pause & Resume Session (Bantuan koneksi putus tanpa memotong sisa waktu).
                - Force Submit & Extra Time Grant (+10 min jika ada masalah teknis).
        - **Sub Menu: Assessment Result**
            - Rekapitulasi Nilai Seluruh Peserta (Grade, Score, Percentage, Pass/Fail Status).
            - Individual Answer Review & Tab Switch Log.
            - Export Data: Excel, PDF, Cetak Berita Acara, & Cetak Kartu Peserta.
        - **Sub Menu: Item Analytics**
            - Analisis Kualitas Soal (Tingkat Kesukaran, Daya Pembeda, & Distribusi Jawaban).
            
            Skema 4 Layer (`Assessment` $\rightarrow$ `Component` $\rightarrow$ `Workspace` $\rightarrow$ `Monitor`) yang sudah dirancang sebelumnya **sudah sangat matang, rapi, dan bebas tumpang tindih**.
            
            Namun, agar ekosistem aplikasi ini benar-benar utuh sampai ke tangan pengguna, ada **3 Modul Lanjutan** yang menjadi kelengkapan wajib dari skema tersebut:
            
            ### 1. Client Exam Interface (Tampilan Student saat Pengerjaan)
            
            Modul ini adalah bentuk fisik dari seluruh *rules* yang sudah disetting di level `Component` dan `Workspace`.
            
            - **Header Area**:
                - Indicator Name: Nama Assessment & Sub-Assessment aktif.
                - Real-time Countdown Timer (Support Global Timer & Section-based Timer).
                - System & Connection Status (Online / Syncing Offline Data).
                - Action Buttons: `[ Pause / Resume ]` (jika diizinkan) & `[ Finish Exam ]`.
            - **Main Worksheet**:
                - Rich-text Context Panel (Wacana/Gambar/LaTeX/Video/Audio di sisi kiri jika ada).
                - Question & Options Panel (Multiple Choice, Scale 1–5, Fill-in-Blank, dsb.).
            - **Footer & Navigation Toolbar**:
                - Button `[ Previous Question ]` & `[ Next Question ]`.
                - Checkbox `[ Ragu-Ragu / Flag Question ]`.
                - Grid Sheet Navigator (Drawer daftar nomor soal lengkap dengan warna status: *Sudah Dijawab*, *Belum Dijawab*, *Ragu-Ragu*).
            - **Security & Anti-Cheat Engine (Client-side)**:
                - Fullscreen Enforcer (Otomatis *pause* & muncul modal peringatan saat siswa keluar dari mode *fullscreen*).
                - Tab Switch Detector (Mengirim sinyal *warning log* ke menu `Monitor > Live Proctoring`).
                - Block Shortcut (Mematikan fungsi Copy-Paste, Inspect Element, dan Klik Kanan).
            
            ### 2. Student Portal & Result Analytics (Tampilan Student Pasca Ujian)
            
            Tampilan bagi siswa untuk melihat hasil dan perkembangan belajar mereka.
            
            - **Score & Grade Card**:
                - Total Skor, Persentase, dan Status Kelulusan (`Pass / Fail` berdasarkan *Passing Grade*).
                - Gamification Reward Badge (Poin reward yang didapatkan).
            - **Sub-Assessment Breakdown**:
                - Grafik Radar / Bar Chart performa per Sub-test (misal: TWK 80%, TIU 60%, TKP 90%).
            - **Answer Review & Discussion**:
                - Disesuaikan dengan *Explanation Policy* dari Workspace (`After Submit` / `After Program Ends`).
                - Menampilkan Kunci Jawaban, Pembahasan Lengkap, dan Kategori Topik Soal.
            
            ### 3. Data Flow & Integration Lifecycle (Siklus Alur Data)
            
            Untuk memastikan pengembang (*Developer*) memahami hubungan antarlayer, berikut adalah alur data dari hulu ke hilir:
            
            ```
            [ LAYER 1: ASSESSMENT ]
              1. Admin membuat Context & Soal di Question Bank.
                     │
                     ▼
            [ LAYER 2: COMPONENT ]
              2. Admin merangkai Soal menjadi Paket Assessment Template (Bobot, Timer Teknis, Visual Mode).
                     │
                     ▼
            [ LAYER 3: WORKSPACE ]
              3. Admin Program memasukkan Paket Assessment ke Program (Setting Jadwal, Passing Grade, Token, & Sertifikat).
              4. Siswa melakukan pendaftaran via Sub Menu Enrollment.
                     │
                     ▼
            [ CLIENT EXAM INTERFACE ]
              5. Siswa memasukkan Token di kelas -> Mengerjakan Ujian dengan Aturan CBT.
                     │
                     ▼
            [ LAYER 4: MONITOR ]
              6. Pengawas memantau pengerjaan via Live Proctoring.
              7. Hasil pengerjaan masuk ke Assessment Result & Item Analytics.
              8. Jika Lulus -> Sistem menerbitkan Sertifikat & Poin Gamifikasi secara otomatis.
            ```
            
            Apakah skema lanjutan untuk tampilan siswa dan alur data ini perlu kita detailkan lagi ke bentuk rancangan UI-nya?
            
    - Certificate | From System to Student
        
        Bagian ini hanya berupa template dan penomoran dasar untuk certificate
        
        Untuk setiap participant (role student) nanti ditautkan ke nomor sertificate tertentu (bisa juga sama, bisa juga berbeda) dan memiliki sistem approve di menu **Monitor> Certificate Validation** 
        
        - **Template Design:** Pilih desain sertifikat (*Master Template*).
        - **Certificate Numbering Pattern:** Format nomor sertifikat (contoh: `ARK/PRG/{YEAR}/{MONTH}/{ID}`).
    - Forum | From Admin to System when Student Enroll, to Student
        
        Student | Program | Title | Forum Link (Edit, Save)
        
        - Whatsapp Group Link, Saat member sukses jadi student dan enroll, maka muncul perintah disini
        
        1. Student Enroll, maka disini muncul dengan isian Forum Linknya masih kosong
        2. Admin mengisinya kemudian save
        3. System lalu menampilkan pemberitahuan dan di My Program Workspace itu tampil di studentnya, Link Grup WA
    - Partisipant | From Admin to System When Student Enroll, to Student
        
        > Terkait dengan Finance > Transaction
        > 
        - **Cohort / Batch Grouping:** Pembagian kelompok/kelas siswa.
        - **Max Enrolled Limit:** Kuota maksimum peserta dalam 1 program/batch.
        - **Access Lifetime:** Masa aktif akses program (misal: 30 hari, 90 hari, atau *Lifetime*).
        
        Saat member sukses jadi student dan enroll, maka muncul perintah disini
        
        Single seperti pada umumnya
        
        Double, maka yang pertama harus jadi leader dan yang lain memilih status sebagai member, dan nanti admin yang mencocokkan sesuai di whatsapp, bisa juga menggunakan sistem kode invitasi jadi semua member enroll dulu program baru diaktifkan bahan programnya saat memasukkan kode invitasi itu
        
        Ngatur Participant disini, ada Student Leader dan Student Member
        
    - Schedule | From Mentor & Admin to System, When Student Enroll
        
        Dibagian ini mencocokkan antara availbale time dnegan booking siswa
        
        1. Member Enroll, berubah role menjadi Student
        2. Setelah Enroll, di My Program, Schedule ini masih kosong dan belum diatur
        3. Mentor menyediakan Available Time
        4. Student memilih mentor, dsb, lalu status berubah menjadi Booked
        5. date time status, duration, mentor, student, QR Attendance
        6. Bisa filter mentor, filter student, filter programnya with studentnya utnuk memudahkan jika tampilan dalam bentuk calender
        7. Smart Booking System (Same Branch Filtering)
        
        Durasi | rekap kehadiran | dokumentasi
        
        Jenis ruangan yang 3 itu
        
        BAGIAN INI FOKUS KE MENTOR, ada QR CODE yang ditampilan atau PIN VALIDATION yang harus di scan atau di Input oleh Student. REKAP DAFTAR STUDENT YANG HADIR, itu MUNCUL DI bagian MONitor
        
        Nama Kelas + Nama grup Whatsapp
        
        ### *Fallback Mechanism* & Pengelolaan Penjadwalan Ulang (*Reschedule*)
        
        Pada Tipe Program 3 (Online) dan Tipe 4 (Offline), interaksi jadwal sangat dinamis. Buat aturan penanganan kondisi darurat (*edge cases*):
        
        - **Mentor Halangan / Sakit:** Sediakan alur bagi admin di menu *Enrollment/Schedule* untuk mentransfer sesi siswa ke mentor lain yang sedang *Available* di *Sub Composer*, atau mengajukan *reschedule* otomatis ke siswa.
        - **Pembatalan dari Siswa:** Atur kebijakan *reschedule* di tingkat *Component* (misal: "Siswa hanya bisa mengajukan pindah jadwal maksimal H-1 sesi sebanyak 1 kali").
        
        - **Schedule Mode:** *Online Live Meeting* atau *Offline On-Site*.
        - **Linked Sub-Component:** Sambungkan ke *Available Time Mentor* dan *Physical Room* (jika offline).
        - **Attendance Weight / Minimum Attendance:** Persentase minimum kehadiran untuk syarat lulus (misal: min. 80% hadir).
        - **Reschedule Policy:** Aturan dan batas kuota pengajuan jadwal ulang oleh siswa.
    - Link | From Mentor to Student
        
        Menyediakan slot untuk mentor mengisi di programnya jika ada yang perlu dibagikan
        
- Workspace
    - 📌CATATAN
        
        <aside>
        💡
        
        ### **Dynamic Entitlement Architecture** (atau *Component-Based Enrollment*).
        
        ### Alur Skenario Teknis
        
        1. **Master Program Tetap Bersih**
            
            Admin menetapkan Program A sebagai *Pure Self-Learning* di tabel `programs`. Tidak ada komponen jadwal pada skema dasar program ini.
            
        2. **Pembentukan Instance Enrollment**
            
            Saat Siswa X mendaftar, sistem mencatat baris baru di `enrollments` dan menyalin komponen dasar ke `enrollment_components` (hanya `LEARNING_PATH`).
            
        3. **Penyimpanan Progress Independen**
            
            Siswa X menyelesaikan 50% materi. Progress tersimpan di `user_learning_progress` berdasarkan `(enrollment_id, content_id)`.
            
        4. **Injeksi Komponen Add-On**
            
            Siswa X membeli 3 sesi Live Session. Sistem menyisipkan baris baru di `enrollment_components` milik Siswa X dengan `component_type: SCHEDULE_ONLINE` dan `is_addon: true`.
            
        5. **Penjadwalan (Assignment)**
            
            Siswa X memilih/di-assign ke slot sesi di `enrollment_schedules` (baik dari *Schedule Pool* maupun *1-on-1*).
            
        6. **Evaluasi Kelulusan Dinamis**
            
            Fungsi `check_completion_status` membaca seluruh komponen aktif milik Siswa X. Syarat lulus otomatis berubah menjadi: **Progress Learning Path 100% AND Presensi Schedule Minimal 80%**.
            
        
        ### Contoh Penerapan Kasus Nyata
        
        **Kondisi**: Kelas *Math Dasar* (Pure Self-Learning).
        
        | **Entitas** | **Status Siswa X (Beli Add-On)** | **Status Siswa Y (Reguler)** |
        | --- | --- | --- |
        | **Komponen Aktif** | `LEARNING_PATH` + `SCHEDULE_ONLINE` | `LEARNING_PATH` saja |
        | **Progress Awal** | 50% (Membaca/Menonton) | 50% (Membaca/Menonton) |
        | **Dampak Add-On** | Progress 50% **tetap aman** | Progress 50% **tetap aman** |
        | **Kriteria Lulus** | - LP Progress = 100%
        
        - Kehadiran Sesi = 3/3 | - LP Progress = 100% |
        | **Hasil Akhir** | Wajib selesaikan materi **DAN** hadir sesi Live | Cukup selesaikan seluruh materi Mandiri |
        
        ### Key Takeaway Arsitektur
        
        - **Prinsip Utama**: Evaluasi kelulusan terikat pada `enrollment_id` (instance), bukan pada `program_id` (master data).
        - **Keamanan Data**: Penambahan add-on di tengah jalan bersifat *additive* (menambahkan syarat), bukan *destructive* (tidak mengubah atau menghapus data progress historis).
        </aside>
        
    - Component
        
        Disini terdapat daftar Sub Menu Component (Media Library, Assesment, dsb) 
        
        Title | Total | dsb
        
        Sub-menu ini berfungsi sebagai ringkasan (*dashboard view*) dari seluruh unit komponen yang tersedia dan siap dipanggil ke dalam program.
        
        - **List & Filter Component**: Menampilkan daftar komponen (Media Library, Assessment, Schedule, Certificate, Forum, dsb) beserta statusnya (*Active/Draft/Archived*).
        - **Usage Counter (Total Program Used)**: Menunjukkan berapa banyak program yang sedang menggunakan komponen tersebut.
        - **Component Versioning**: Pengaturan versi komponen agar jika ada revisi isi kuis atau materi, program lama tidak ikut terpengaruh.
        - **Global Default Settings**: Pengaturan bawaan komponen (misal: *passing grade* standar 70, batas kehadiran standar 80%) yang bisa di-*override* saat dimasukkan ke dalam program spesifik.
        
    - Tag
        
        Digunakan untuk kategorisasi dan pemicu filter/pencarian program
        
        Sub-menu ini digunakan untuk taksonomi, kategorisasi, dan algoritma *filtering* program di sisi siswa/Landing Page.
        
        - **Tag Name & Slug**: Nama label (contoh: `#WebDevelopment`, `#BimbelSD`, `#OfflineBandung`, `#LevelBeginner`).
        - **Tag Group / Category**: Mengelompokkan tag berdasarkan tipe, seperti:
            - *Topic/Skill* (misal: Python, Accounting).
            - *Target Age/Grade* (misal: SMA, Umum).
            - *Location/Branch* (misal: Cabang Jakarta, Online).
            - *Program Type* (Self Learning, Live Cohort).
        - **Visibility Setting**: Opsi apakah tag ditampilkan publik di katalog atau hanya untuk internal admin (*internal tracking*).
        
    - Program
        
        PROGRAM - LEARNING PATH - SECTION | SECTION | COMPONENT
        
        Toggle Block - Collapsible Content
        
        Right Sticky Side Navigation From Section Content 
        
        - Step 1: Program General Profile
            - **Program Title & Description**: Identitas program (misal: *Bimbel CPNS Masterclass Batch 1*).
            - **Purchase Type**: `Subscription` (Berlangganan berulang) atau `One-Time Purchase` (Sekali bayar / Akses seumur hidup).
            - **Certificate Claim Window**: Masa berlaku penerbitan sertifikat program.
        - Step 2: Learning Path Timeline Assembly
            - **Sequence Builder**: Merangkai urutan modul program secara berurutan:
                1. *Activity 1*: Component Assessment (Pre-Test)
                2. *Activity 2*: Component Media Library (Video/PDF)
                3. *Activity 3*: Live Mentoring Session
                4. *Activity 4*: Component Assessment (Post-Test)
            - **Activity Prerequisite Rules**: Mengatur syarat pembukaan modul (misal: Activity 4 baru terbuka jika Activity 1–3 *Completed*).
        - Step 3: Assessment Delivery & Execution Rules
            
            Mengatur perilaku *Component Assessment* khusus di dalam Program ini:
            
            ```
            [ CONFIGURATION FOR: Post-Test SKD CPNS ]
            
            1. Schedule & Access Window:
               - Access Mode : ( ) Self-Paced    (o) Scheduled Window
               - Date Range  : [ 2026-10-25 08:00 ] to [ 2026-10-25 10:00 ]
               
               - **Scheduled / Token-based (Ujian Terjadwal)**
                - Memiliki *Start Date* & *End Date* spesifik.
                - Membutuhkan **Token Ujian** (bisa di-generate dinamis oleh admin/proctor) untuk membuka soal.
                
            
            2. Attempt Policy:
               - Max Attempts Allowed : [ 1 ] Attempt
               - Lifetime Access Rule : [x] Allow access after Certificate Window ends
               **Max Attempts:** Batas percobaan (misal: 1x, 3x, atau *Unlimited*).
            Jumlah kesempatan (*attempts allowed*)
            Periode Attemps atau tanpa batas waktu
            
            3. Passing Grade & Rewards:
            		Range, Score, Percentage
            		Passing Grade / Score Threshold: Batas minimum nilai lulus (misal: 75/100).
            		
               - Result Type     : (o) Passing Grade (Pass/Fail)   ( ) Score Only
               - Passing Score   : [ 311 ] Pts
               - Gamification    : Award [ 100 ] Points on passing
               - Certificate Gate: [x] Mandatory completion for Certificate Claim
            
            4. Answer Key & Explanation Policy:
               - Show Discussion : ( ) After Submit   (o) After Program Ends   ( ) Never  
            5. Security Level Checklist:
               - [x] Require Exam Token to Start
               - [x] Fullscreen Lock & Block Tab Switch
               - [x] Disable Copy-Paste & Right-Click
               | [x] Auto-submit when section time expires  
            ```
            
        - Certificate Set
            
            ## [1] KRITERIA KELULUSAN (COMPLETION CRITERIA)
            
            Minimal Kehadiran (%)         : [ 80 ] %
            Minimal Progress Completion   : [ 100 ] %
            Passing Grade CBT             : [ 75 ] / 100
            
            Syarat Feedback / Evaluasi    : (•) Wajib isi feedback sebelum sertifikat terbit
            ( ) Opsional (Sertifikat langsung terbit)
            
            ---
            
            ## [2] DESAIN & FORMAT SERTIFIKAT
            
            Master Template Design        : [ Select Template  ▼ ]  [ Preview Template ]
            (•) Standard Academic
            ( ) Corporate Dark Mode
            ( ) Modern Minimalist
            
            Certificate Numbering Pattern : [ ARK/PRG/{YEAR}/{MONTH}/{ID}                      ]
            Variabel yang tersedia: {YEAR}, {MONTH}, {DAY}, {ID}
            Contoh output: ARK/PRG/2026/10/00142
            
            Validity Period               : (•) Lifetime / Seumur Hidup
            ( ) Berlaku Selama: [ 2 ] [ Tahun ▼ ]
            
            ---
            
            ## [3] Pemicu Penerbitan (ISSUANCE TRIGGER)
            
            Mekanisme Terbit              : (•) Automatic (Otomatis terbit saat kriteria terpenuhi)
            ( ) Manual Approval (Membutuhkan verifikasi Admin)
            
            ---
            
            ```
                                                      [ Batal ]   [ Simpan Pengaturan ]
            ```
            
            ========================================================================================
            
        - UI Program di Sisi Student
            
            ```
            ========================================================================================
             [ Syarat Kelulusan Kamu ]
             --------------------------------------------------------------------------------------
              [✓] Kehadiran               : 90% (Min. 80%)
              [✓] Progress Completion     : 100%
              [✓] Nilai CBT               : 85 (Passing Grade 75)
              [!] Feedback & Evaluasi     : Belum Diisi
            
             --------------------------------------------------------------------------------------
              STATUS SERTIFIKAT:
              [!] Kamu perlu mengisi form feedback terlebih dahulu untuk mengunduh sertifikat.
            
              [ Isi Form Feedback Sekarang ]   [ Unduh Sertifikat (Disabled) ]
            ========================================================================================
            ```
            
        
        - % kehadiran, Progress COmpletion, Passing Grade CBT
            - **Issuance Trigger Condition:**
                - *Automatic:* Otomatis terbit jika seluruh centang kelulusan terpenuhi.
                - *Manual Approval:* Membutuhkan verifikasi admin/mentor terlebih dahulu.
            
            Apakah perlu ngisi feedback dulu baru bisa terbit
            
            **Completion Criterion: Untuk Media Library**
            • *Video:* Ditonton ≥X % atau sampai selesai.
            • *PDF/Link:* Tombol "Mark as Done" diklik / halaman terakhir dibaca.
            
        
        - Section 0
            
            
            Di dalam pembuatan program, komponen-komponen dapat dikelompokkan ke dalam **Section** (misal: *Section 1: Pengenalan*, *Section 2: Latihan & Live Session*, dst.).
            
            Tambahkan Section Khusus Add On Schedule (yang bisa bayar untuk pertemuan tambahan)
            
            Sistem enrollment  juga akna mengakomodir perubahan misalnya penambahan komponen pada program yang sudah di enroll saja.
            
            Terdapat Section
            
            Branch 
            
            Learning Path
            
        - Section 1
            
            Wajib : Terhubung ke Branch, Personality, Voucher, Price, Participants
            
            Section khusus TAG
            
            Section yang memanggil dari Component
            
            Section untuk menambahkan tautan zoom atau google drive upload tugas
            
            Section yang seperti lintree ada Section Group, ada title section, teks juga 
            
            Status dsb | Published, Draft, Archived, Deleted
            
            Enrollment Code
            
            INI YANG TERUSUL - Durasi, Harga, Fasilitas, OPSI Cicilan, Referral
            
            Dynamic Paywall & preview Mode
            
            UNTUK CARD: Thumbnail, Title, Tag, Pricae
            
            Goals atau tujuan
            
            Padlock & Preview
            
            Freemium
            
            Edit Program, Duplicate, Change Status, Delete
            
            Access Periode (tanggal dan Jam)
            
            Visibility
            
            TOMBOL ADD Section dan Add Componet
            
        - *Expiration / Access Duration Mechanism*
            - **Batas Waktu Akses Program (Lifetime vs Time-bound):**
                - Di level *Workspace > Program*, tambahkan pengaturan **Durasi Masa Aktif Akses** (misal: *Akses 30 Hari setelah Enrollment* atau *Selamanya*).
                - Ini penting terutama untuk Tipe 1 & 2 (Self Learning), agar sumber daya server (*Media Library*) dan akses kuis tidak disalahgunakan atau diakses selamanya jika sistem Anda menggunakan model langganan/berbayar per periode.
        - **Tab 1: Basic Information**
            - Judul Program, Slug URL, Deskripsi Singkat & Lengkap, Banner/Thumbnail Image.
            - Pemilihan **Program Type**: *Self Learning*, *Self Learning + Assessment*, *Online Live*, atau *Offline*.
            - Penetapan **Tag**: Menghubungkan tag yang sudah dibuat.
            - Harga (*Pricing*): Free / Paid, Harga Coret (Diskon), Sistem Pembayaran (Sekali Bayar / Cicilan).**Tab 2: Section Builder (Struktur Kurikulum)**
            - Menambah **Section** (contoh: *Section 1: Dasar-dasar*, *Section 2: Evaluasi Sesi 1*).
            - **Attach Component into Section**: Memanggil komponen ke dalam section tertentu.
            - **Sequence & Locking (Drip Content)**:
                - *Sequential Mode:* Siswa wajib menyelesaikan item sebelumnya untuk membuka item berikutnya.
                - *Free Navigation Mode:* Siswa bebas memilih urutan materi.**Tab 3: Enrollment Rules & Syarat Kelulusan**
            - **Access Lifetime**: Batas waktu akses program (misal: *30 Hari*, *1 Tahun*, atau *Selamanya*).
            - **Completion Rules Checklist**: Menentukan kombinasi syarat lulus (Progress Media 100% + Assessment Score $\ge X$ + Attendance $\ge Y\%$).
            - **Auto-Certificate Issuance**: Centang untuk menerbitkan sertifikat otomatis saat *Completion Rules* terpenuhi.
        
        ### 1. Tempat Setting Utama: `Workspace > Program > Pricing`
        
        Fitur cicilan dikonfigurasi di level **Program**, bukan di dalam komponen tunggal, karena cicilan terkait dengan total harga satu paket program.
        
        Di tab **Pricing**, admin mengaktifkan toggle **Allow Installment** dan menentukan skema cicilan:
        
        - **Jumlah Term/Termin:** (Misal: 2x atau 3x cicilan).
        - **Nominal per Termin / DP (Down Payment):** (Misal: Termin 1 = Rp 500.000, Termin 2 = Rp 500.000).
        - **Jatuh Tempo (Due Date Trigger):**
            - *Based on Time:* Tiap tanggal tertentu atau X hari setelah Termin 1.
            - *Based on Milestone/Section:* Sebelum masuk ke *Section 2* atau sebelum pertemuan/sesi ke-N.
        
        ### 2. Komponen yang Terpengaruh oleh Sistem Cicilan
        
        Agar sistem cicilan berjalan otomatis tanpa perlu dicek manual oleh admin, berikut adalah bagaimana **Component** dan **Sub Component** merespons pembayaran cicilan:
        
        - A. **Access Control / Drip Component (Pencegat Materi)**
            - **Fungsi:** Mengunci *Section* atau *Media Library* tertentu jika cicilan berikutnya belum dilunasi.
            - **Penerapan:**
                - Pembayaran DP/Termin 1 membuka **Section 1 & Sesi Pertemuan 1–3**.
                - Jika tanggal jatuh tempo Termin 2 tiba dan siswa belum bayar, **Section 2 ke atas otomatis terkunci** (berstatus *"Locked - Installment Due"*).
        - B. **Schedule Component & Available Time (Pencegat Presensi/Sesi)**
            - **Fungsi:** Mencegah siswa memilih jadwal mentor atau masuk ke ruang bimbel/zoom jika ada tunggakan.
            - **Penerapan:**
                - **Tipe 3 (Online):** Link Zoom/Google Meet di komponen *Link/Schedule* otomatis tersembunyi (*hidden*) atau tidak bisa diklik jika status Termin $N$ belum Lunas (*Unpaid/Overdue*).
                - **Tipe 4 (Offline):** QR Code presensi atau slot di *Physical Room* dibekukan sementara. Mentor/Tentor saat mengabsen akan melihat status siswa *"Pending Payment"* sehingga tidak diizinkan masuk kelas offline.
        - C. **Assessment & Certificate Component (Pencegat Kelulusan)**
            - **Fungsi:** Mengunci hasil akhir/sertifikat.
            - **Penerapan:**
                - Siswa tetap boleh ikut kuis/ujian, tetapi **Certificate Component** tidak akan ter-generate otomatis selama status pembayaran di menu *Enrollment* belum *Full Paid* (Lunas 100%), meskipun semua syarat kelulusan nilai dan kehadiran sudah terpenuhi.
        
        ### 3. Pengelolaan di Menu `Workspace > Enrollment`
        
        Di menu *Enrollment*, admin dapat memantau dan mengelola siklus cicilan tiap siswa:
        
        - **Payment Status Tracker:** `Paid (DP)` $\rightarrow$ `Overdue` $\rightarrow$ `Fully Paid`.
        - **Automated Reminders:** WhatsApp/Email otomatis H-3 sebelum jatuh tempo cicilan berikutnya.
        - **Manual Payment Approval / Bypass:** Opsi bagi admin untuk memberikan kelonggaran (misal: "Beri perpanjangan akses 3 hari meski cicilan ke-2 terlambat").
        - Ringkasan Alur Sistem Cicilan
            
            $$\text{Konfigurasi Skema Cicilan di Program} \longrightarrow \text{Siswa Bayar DP/Termin 1} \longrightarrow \text{Komponen Sesi 1 Unlocked}$$
            
            $$\downarrow$$
            
            $$\text{Jatuh Tempo Termin 2} \longrightarrow \begin{cases} \text{Jika Lunas} \rightarrow \text{Akses Sesi \& Section Lanjutan Terbuka} \\ \text{Jika Belum} \rightarrow \text{Schedule \& Link Terkunci Otomatis} \end{cases}$$
            
            **Pre-requisite / Prasyarat Program**
            
            - *Fungsi:* Mengunci program/section tertentu sampai siswa menyelesaikan program/section lain.
            - *Kegunaan:* Memastikan siswa tidak melompati materi tingkat lanjut sebelum menguasai dasar.
            
            Single Payment dan Term Payment
            
            Aturan jika cicilan maka apa yang terjadi
            
    - Enrollment
        
        **Integrasi Notifikasi Pasca-Enrollment:**
        
        - Karena Tipe 3 (Online) dan Tipe 4 (Offline) membutuhkan pemilihan jadwal/sesi setelah siswa *enroll*, sering kali siswa lupa untuk memilih jadwal atau hadir di sesi tersebut.
        - Tambahkan modul *Notification Trigger* di sistem yang mengirimkan WhatsApp/Email otomatis:
            - *Trigger 1:* "Selamat! Pembelian berhasil. Klik link ini untuk memilih jadwal mentor Anda."
            - *Trigger 2 (H-1 Sesi):* "Pengingat: Sesi offline Anda besok pukul 14.00 di Ruang A, Cabang Bimbel X."
            - *Trigger 3 (Post-Assessment):* "Nilai Assessment Anda keluar. Klik di sini untuk melihat kelulusan."
        
        Ketika *Member* membeli/mendaftar, data transaksi masuk ke menu *Enrollment* dan memicu *Instance Program* khusus untuk siswa tersebut.
        
        Daftar program yang terhubung ke student, statusnya, progresnya, dsb
        
        STart pending Finish, Schedule yang dilalui
        
        Active, Completed, Expired, Suspended, Archived,
        
        Progress Bar, dan log Kehadiaran r/n
        
        Di bagian *Workspace > Enrollment*, sediakan *Status Tracker* komponen untuk tiap siswa yang terdaftar:
        
        - **Status Jadwal:** Apakah siswa sudah memilih slot jadwal mentor/ruangan atau belum (*Unscheduled* vs *Scheduled*).
        - **Status Assessment:** Berapa kali percobaan (*attempts*) yang sudah dilakukan dan nilai tertinggi.
        - **Status Kelulusan:** Visualisasi berupa *Checklist Indicator* (misal: Media 100% [v], Assessment [v], Schedule Attendance [x]) untuk mempermudah admin memantau siapa yang berhak mendapatkan sertifikat.
        - 
        
        Sub-menu ini menangani data pendaftaran siswa yang sudah masuk ke dalam program beserta pengelolaan pasca-pendaftaran.
        
        - **Enrollment List & Status**: Filter data siswa berdasarkan status pendaftaran (*Pending Payment*, *Active*, *Completed/Graduated*, *Expired*, *Cancelled*).
        - **Cohort / Batch Allocation**: Mengelompokkan siswa yang *enroll* ke dalam grup/kelompok tertentu (sangat berguna untuk Tipe 3 Online & Tipe 4 Offline).
        - **Post-Enrollment Schedule Matcher (Khusus Tipe 3 & 4)**:
            - Menghubungkan siswa dengan slot **Available Time Mentor** dan **Physical Room**.
            - Opsi *Manual Assignment* oleh Admin atau *Self-Select Schedule* oleh Siswa.
        - **Manual Enrollment Override**:
            - Fitur *Add Student Manually* (untuk pendaftaran *offline* via kasir bimbel/transfer manual).
            - Fitur *Extend Access Period* (memperpanjang durasi akses siswa).
            - Fitur *Force Complete / Grant Certificate* (tindakan diskresi admin untuk meluluskan siswa secara manual).
- Monitor
    - Assessment Proctoring
        
        │    ├── Session Selector (Pilih Program, Kelas, & Jadwal Ujian)
        │    ├── Token Management Panel
        │    │    ├── Active Token Display
        │    │    └── Button: [ Generate New Token ] / [ Refresh Token ]
        │    └── Live Student Monitoring Grid
        │         ├── Student Status: Online, Submitted, Disconnected, Warning
        │         ├── Tab Switch Violation Counter (Notifikasi real-time kecurangan)
        │         └── Action Controls: [ Pause/Resume ] | [ Force Submit ] | [ Grant Extra Time ]
        
        REQUIRE EXAM TOKEN (Butuh token untuk mulai mengerjakan)                              
        |     Token Code: [ K3J9A2 ]  [ Generate Random Token ]
        
        +-------------------------------------------------------------------------------------------------+
        | UJIAN: Tryout UTBK SNBT Batch 1  | Sesi: Sesi 1 (08:00 - 10:00) | Ruang: Lab Komputer 1         |
        | Token Saat Ini: [ K3J9A2 ] (Auto-refresh dalam 04:52)             [ Reset Token ] [ Hentikan ]  |
        +-------------------------------------------------------------------------------------------------+
        | Total Peserta: 40 | Mengerjakan: 36 | Selesai: 2 | Belum Login: 2 | Terindikasi Curang: 1 (!)   |
        +-------------------------------------------------------------------------------------------------+
        
        | No. Peserta | Nama Siswa | Status | Sisa Waktu | Progres | Pelanggaran | Aksi |
        | --- | --- | --- | --- | --- | --- | --- |
        | 2026-001 | Andi Wijaya | <span style="color:green">Mengerjakan</span> | 45 Min | 25/30 Soal | 0 | [ Force Submit ] |
        | 2026-002 | Budi Santoso | <span style="color:red">Pindah Tab (2x)</span> | 50 Min | 18/30 Soal | <span style="color:red">2 Tab Switch</span> | [ Warning ] [ Lock ] |
        | 2026-003 | Citra Dewi | <span style="color:blue">Selesai</span> | - | 30/30 Soal | 0 | [ Reset Session ] |
        | +------------------------------------------------------------------------------------- |  |  |  |  |  |  |
    - Assessment Sessions
        
        +-------------------------------------------------------------------------------------------------+
        | MANAJEMEN SESI & RUANG UJIAN                                               [ + Tambah Ruang ]   |
        +-------------------------------------------------------------------------------------------------+
        
        | Ruang Ujian | Sesi | Waktu | Kapasitas | Pengawas Ditugaskan |
        | --- | --- | --- | --- | --- |
        | Lab Komputer 1 | Sesi 1 (Pagi) | 08:00 - 10:00 WITA | 40 Siswa | Ahmad Subagja, S.Pd. |
        | Lab Komputer 2 | Sesi 1 (Pagi) | 08:00 - 10:00 WITA | 35 Siswa | Rina Melati, M.Pd. |
        | Ruang Aula Utama | Sesi 2 (Siang) | 10:30 - 12:30 WITA | 100 Siswa | Hendra Gunawan |
        | +-------------------------------------------------------------------------------------------- |  |  |  |  |
    - Assessment Result
        
        │    ├── Master Scoreboard (Tabel Nilai, Persentase, Status Lulus/Tidak Lulus)
        │    ├── Individual Student Report (Detail Jawaban, Waktu Pengerjaan, Log Kecurangan)
        │    └── Export & Print Center
        │         ├── Export Data to Excel / CSV
        │         ├── Download PDF Rekapitulasi Nilai
        │         └── Print Official Documents (Berita Acara & Daftar Hadir Ujian)
        
    - Assessment Analysis
        
        #### Menu Analisis & Evaluasi (Post-Exam & Recalculate)
        
        - **UI Element:**
            - **Action Control Bar:**
                - Tombol Utama: **`[ Jalankan Engine Kalkulasi IRT ]`**
                - Status Indicator: `Belum Dihitung` | `Sedang Memproses (35%)` | `Selesai (Diperbarui: 16 Oct 2026, 14:30)`
            - **Tab 1: Summary & Distribution:**
                - Metric Card: *Mean Theta ($\theta$)*, *Standard Deviation*, *Reliability Coefficient (Cronbach's Alpha / IRT Reliability)*.
                - Kurva Distribusi Kemampuan Peserta (Histogram $\theta$).
            - **Tab 2: Item Analysis Table (Analisis Butir Soal):**
                - Tabel memuat: Nomor Soal | Wacana (Context) | % Jawaban Benar | Difficulty ($b$) | Discrimination ($a$) | Pseudo-guessing ($c$) | Status Soal (*Valid / Fit* / *Drop*).
            - **Tab 3: Student Results (Rekap Nilai Peserta):**
                - Tabel memuat: Nomor Peserta | Nama | Benar/Salah | Estimated Ability ($\theta$) | Converted Score (Scale 0–100 / Scale 1000) | Rank.
                - Tombol Aksi: **`[ Publish Nilai ke Peserta ]`** & **`[ Export Excel / PDF ]`**.
        
        ### Rancangan Tabel UI Layout
        
        Berikut struktur kolom tabel yang ideal untuk diimplementasikan **Item Analysis Table**:
        
        | **No** | **Preview Soal / Context** | **% Benar (CTT)** | **Tingkat Kesukaran (b)** | **Daya Beda (a)** | **Tebakan Acak (c)** | **Status & Rekomendasi** | **Aksi** |
        | --- | --- | --- | --- | --- | --- | --- | --- |
        | **1** | Tentukan turunan pertama... | 85% | **-1.82**
        
        *(Mudah)* | **0.45**
        
        *(Baik)* | 0.20 | **Pertahankan** *(Fit)* | `[Edit]` `[Drop]` |
        | **2** | Berdasarkan grafik... | 25% | **+2.10**
        
        *(Sangat Sulit)* | **0.10**
        
        *(Buruk)* | 0.25 | **Perlu Revisi** *(Unfit)* | `[Edit]` `[Drop]` |
        | **3** | Hitunglah integral tentu... | 55% | **+0.15**
        
        *(Sedang)* | **1.20**
        
        *(Sangat Baik)* | 0.18 | **Pertahankan** *(Fit)* | `[Edit]` `[Drop]` |
        
        ### Catatan Penting untuk Implementation & UX
        
        - **Penyatuan Kolom Angka & Interpretasi:**
            
            Pada kolom **Tingkat Kesukaran ($b$)** dan **Daya Beda ($a$)**, gabungkan angka mutlak IRT dengan label verbalnya (misal: `-1.82 (Mudah)`). Angka negatif pada $b$ menunjukkan soal mudah, sedangkan angka positif menunjukkan soal sulit.
            
        - **Fitur Toggle / View Mode (Opsional):**
            
            Di atas tabel, Anda bisa menambahkan *toggle* mode tampilan jika ingin tampilan yang lebih bersih:
            
            - **Mode Sederhana (Default):** Menampilkan No, Preview, % Benar, Tingkat Kesukaran (Label), Daya Beda (Label), dan Status Soal.
            - **Mode Advanced (IRT Focus):** Menampilkan kolom lengkap beserta nilai presisi $b$, $a$, $c$, dan nilai *Infit/Outfit MNSQ* (jika menggunakan model Rasch).
        - **Anulir Soal (Drop Question):**
            
            Jika status soal bernilai **"Unfit"** atau **"Perlu Revisi"**, sediakan tombol **Drop / Anulir** di kolom *Aksi*. Jika diklik, sistem akan mengecualikan soal tersebut dari kalkulasi ulang IRT (*Recalculate*).
            
    - Assessment Analysis**:** Cara Tabel Mengakomodasi Metode & Jenis Soal Lain
        
        ### Cara Tabel Mengakomodasi Metode & Jenis Soal Lain
        
        #### 1. Penyesuaian Kolom Statistik Berdasarkan Metode Penilaian
        
        Setiap metode penilaian akan menampilkan metrik statistik yang relevan di kolom utama:
        
        - **Same Weight / Custom Weight:**
            - **Metrik Utama:** *Avg. Score (Rata-rata Skor)*, *Max Points*, dan *Difficulty Rate (% Benar)*.
            - **Contoh Kolom:** `Poin Maksimal` | `Rata-rata Skor Dikerjakan` | `Tingkat Kesukaran`
        - **Scale Score (misal: TKP CPNS / Skala Likert 1–5):**
            - **Metrik Utama:** *Rata-rata Poin per Nomor*, *Distribusi Opsi (Berapa % yang memilih poin 5, 4, 3, dst.)*, dan *Opsi Favorit*.
            - **Contoh Kolom:** `Skor Maksimal (5)` | `Rata-rata Skor (3.82)` | `Opsi Dominan (B - Poin 5)`
        - **IRT / Classical:**
            - **Metrik Utama:** *Difficulty ($b$)*, *Discrimination ($a$)*, *Pseudo-guessing ($c$)*, dan *Item Fit*.
        
        #### 2. Penyesuaian Berdasarkan Jenis Soal (*Type Soal*)
        
        Tabel dapat menampilkan indikator khusus sesuai bentuk/format soalnya:
        
        | **Jenis Soal** | **Indikator Utama di Tabel** | **Catatan Khusus untuk Sistem** |
        | --- | --- | --- |
        | **Pilihan Ganda (Single/Multiple)** | % Benar, Distractor Analysis (Pengecoh) | Menampilkan analisis seberapa efektif opsi salah (*pengecoh*) dipilih peserta. |
        | **Esai / Isian Singkat (Short/Long Text)** | Rata-rata Nilai Koreksi, Inter-Rater Reliability | Jika diperiksa manual oleh beberapa pengawas/guru, tabel menampilkan konsistensi koreksi. |
        | **Skala / Likert / TKP** | Sebaran Bobot Poin (1–5) | Menampilkan persentase peserta yang memilih tiap gradasi poin. |
        | **Studi Kasus / Soal Ber-Wacana** | Grouping Label (Context ID) | Baris tabel secara otomatis mengelompokkan soal-soal di bawah ID Wacana (*Context*) yang sama. |
        
        ### UI Mockup: Tabel Analisis Universal (Multi-Metode & Multi-Soal)
        
        Berikut adalah contoh bagaimana bentuk tabel tersebut di tingkat antarmuka (UI) ketika mengakomodasi berbagai jenis soal dan metode pembobotan dalam satu assessment:
        
        | **No** | **Preview Soal & Tipe** | **Metode / Bobot** | **Rata-rata / % Benar** | **Indikator Utama** | **Status Soal** | **Aksi** |
        | --- | --- | --- | --- | --- | --- | --- |
        | **1** | **[Pilihan Ganda]**
        
        Tentukan nilai $x$... | Custom Weight
        
        *(10 Pts)* | **75%** *(7.5 Pts)* | **Daya Beda:** 0.42 *(Baik)*
        
        **IRT $b$:** -0.85 | **Sangat Baik** | `[Detail]` |
        | **2** | **[Skala / TKP]**
        
        Menghadapi rekan kerja... | Scale Score
        
        *(1–5 Pts)* | **3.95 Pts** | **Distribusi:**
        
        Opsi A (Poin 5): 60%
        
        Opsi C (Poin 4): 25% | **Efektif** | `[Detail]` |
        | **3** | **[Esai]**
        
        Jelaskan proses photosynthesis... | Custom Weight
        
        *(20 Pts)* | **12.4 Pts** | **Tingkat Kesulitan:** Sedang
        
        **Koreksi:** 100% Selesai | **Evaluasi Bobot** | `[Detail]` |
        
        ### Komponen Penting yang Perlu Ditambahkan pada UI
        
        1. **Badge/Pill Tipe Soal & Metode:**
            
            Tambahkan label visual kecil di setiap baris (misal: `[PG]`, `[Esai]`, `[Scale]`) untuk memudahkan pembuat soal membedakan karakteristik analisisnya.
            
        2. **Modal / Panel Drill-down (`[Detail]`):**
            
            Ketika tombol `[Detail]` diklik, tampilkan pop-up yang menyajikan analisis lebih mendalam sesuai tipe soal:
            
            - **PG:** Kurva Pengecoh (Distractor Chart) & Kurva IRT.
            - **Skala/TKP:** Bar Chart sebaran pemilih opsi A, B, C, D, E.
            - **Esai:** Distribusi skor yang diberikan oleh korektor/penilai.
    - Certificate Validation
        
        Student | Program | Validation Status | Certificate Number |
        
        1. Setiap student yang sudah enroll ke program dan memiliki fitur certificate, jika itu bentuknya Manual Approve, maka
        2. Munculkan disini daftarnya, kemudian admin harus memicu penerbitan di kolom Validation Status
    - Schedule Evaluation
        - Students Attendance
            
            (Dari Schedule yang berisi mentor dan jadwalnya, di ambil disisi ini untuk rekap siswanya, yaitu siswa ini status, hadir, izin, sakit, dsb)
            
        - Feedback for Mentor
            - *Fungsi:* Formulir ulasan/kuisioner kepuasan siswa terhadap materi, mentor, atau fasilitas ruangan.
            - *Kegunaan:* Syarat tambahan sebelum sertifikat terbit (opsional) untuk memastikan admin selalu mendapatkan umpan balik paska-program.
            
            Rating 1-10 untuk mentor
            
        - Feedback for Student
            
            Feedback untuk Siswa
            
            Kritik Saran Lainnya
            
- Material
    - Learning Topic
    - Support Clasification
    - Other Support for Learning Topic
    - Education
- Finance
    
    Voucher
    
    Order - list order dengan status pending, paid, cancelled dsb, dan dapat generate invoice
    
    Transaction - Mengatasi juga traksasi pencairan
    
    Invoice - list invoice yang ada pada seluruh transaksi dan dapat generate
    
    Report - Laporan Akhir (termasuk Saldo Mentor yang belum dicairkan, saldo siswa yang belum dikovnersi, dst
    
    Uji Coba pemisahan uang langsung saat setelah schedule dilaksanakan atau assessment selesai dijalankan, yaitu antara Honor Mentor, Operasional, dan Kas
    
- Store
    - E-Catalog
        
        Point Value | Price Value | Stok, Status, Kategori
        
    - Point
    
    Expiry & Burn Mechanisme
    
    - Shipment
        
        Pengirman, status dsb
        
- System
    
    Menu Management
    
    Appearance
    
    Documentation
    
- Database
    
    Data Management
    
    Backup
    
- Catatan satu
    
    urutan transaksi program
    confirmed, approve, atau reject
    
    tahapan seleksi
    Program Khusus Mentor
    ada tahapan seleksi
    
    Sistem Cicilan
    Referral
    Reward di program tertentu
    
    kondisi jika membeli program, dapat point
    jika mengajak beli program, referral bisa dpt point
    yang diajak dikasih voucher sama dan dapat diskon
    
    transaksi approve atau rollback/refund
    
    ada convertion rate juga di finance itu
    di bagian report
    ada slip gaji
    invoice murid,
    

---

---

- To Do
    
    📌**lms.arkanin.my.id** harus memiliki button penghubung ke blospot **arkanin.my.id**
    
    Memperbaiki penjelasan notion ini perihal jenis permission di RBAC
    
    Uuslan Role Ganda
    
    - [ ]  Membuat logo untuk setiap kelima jenis website tersebut
    - [ ]  Membuat 3 cabang yaitu Anggrek, Bougenville, dan Camelia
    - [ ]  Untuk Profile mentor dan jenis cabang bisa liahn ERD karena menyangkut isian bank juga, cek bagian finalisasi.
    - [ ]  Menambah pembatas bagi admin pada akses di mainsite supaya tidak mengulang logika yang salah
- Status Pendaftaran Mentor
    
    Applied > Under Review > Assesment > Interview > Hired | Rejected, Withdraw
    
- Logika Kadaluarsa & Batas Waktu Transaksi (Payment Timeout & Invoice Expiration)
    - Untuk mencegah *double-spending* ketika Student atau Mentor mengajukan pencairan dana (*withdrawal*) atau penggunaan saldo.
    - **Rekomendasi:** Logika *Hold Balance* (dana ditahan sementara) diterapkan saat pengajuan pencairan dibuat, dan saldo baru benar-benar terpotong/berkurang setelah Admin Keuangan (ASD) menyetujui (*Approve*) transaksi tersebut.
- SISTEM BANK SOAL DARI MENTOR
    
    Draft > Submitted / Under Review > Approved > Published to Bank Soal (mentor dapat Point)
    
    Rejected / Revision Needed
    
- **Usulan & Ide Tambahan untuk Ekosistem**
    - **Dynamic Paywall & Preview Mode pada Workspace (Member)**
    - Member yang belum menjadi Student dapat melihat struktur *curriculum tree* atau *silabus* program unggulan di Workspace, tetapi materi video/soal CBT dikunci dengan ikon gembok dan tombol *"Unlock via Enrollment Code / Beli Program"*. Ini meningkatkan dorongan konversi (*FOMO trigger*).
    - **Fitur Expiry & Burn Mechanism untuk Poin Gamifikasi**
    - Untuk menjaga stabilitas kas di modul Keuangan Cabang (ASD), berikan *expiration date* pada poin (misal: kadaluarsa dalam 6 bulan). Ditambah lagi dengan kampanye *"Point Flash Sale"* di Store untuk mendorong penukaran barang fisik sebelum poin hangus.
    - **Smart Session Booking System untuk Mentor Luring**
    - Pada modul *Booking Mentor Luring* di Workspace Student, tambahkan sistem *quota* sederhana agar Student hanya bisa memesan jadwal mentor yang berada di cabang yang sama dan sesuai *slot* waktu luang mentor.
- **Usulan untuk Assessment**
    - **Offline Mode / PWA (Progressive Web App):**
        - **Cara Kerja:** Saat siswa membuka halaman ujian (dengan internet), soal dan *media context* (gambar, LaTeX script) langsung di-*cache* ke penyimpanan lokal browser (*IndexedDB* / *Service Worker*).
        - **Saat Koneksi Terputus:** Jawaban siswa disimpan secara lokal di browser.
        - **Auto-Sync:** Ketika koneksi internet kembali terhubung, sistem otomatis mengirimkan (*sync*) akumulasi jawaban ke server tanpa mengganggu pengerjaan siswa.
    - **Pencetakan Berita Acara & Kartu Ujian (PDF Generator):**
        - Menyediakan *template* standar instansi (Logo Sekolah/Bimbel, Kop Surat, Kolom Tanda Tangan Pengawas, QR Code Verifikasi Kartu Peserta).
- **Tujuan Utama Penetapan Tiga Tingkatan Ini (Guest, Member, Student)**
    - **Pengoptimalan *Marketing Funnel* & *Conversion Rate:*** Penetapan tingkat ini menciptakan alur bertahap (*freemium*): **Guest** mendaftar gratis menjadi **Member** untuk mencoba fitur terbatas membeli program untuk menjadi **Student**.
    - **Presisi Analisis Data & *Customer Journey***
    - **Data Conversion Tracker:** Memudahkan pelacakan *conversion rate* dari total registrasi **Member** menjadi **Student** berbayar, serta mengidentifikasi program pemicu pembelian pertama.
    - **Behavioral Analysis:** Memantau frekuensi pembelian ulang (*repeat purchase*), efektivitas program, dan preferensi pola belajar pengguna.
    - **Fleksibilitas Akses Berbasis *Enrollment Code:*** Hak akses **Student** tidak dikunci secara kaku pada level peran umum, melainkan melekat pada **Program/Enrollment Code** yang dibeli. Hal ini memungkinkan tim operasional memberikan bonus materi, CBT tambahan, atau voucher *Store* khusus pada program tertentu untuk mendukung strategi *upselling* dan *cross-selling*.
    - **Retensi Pengguna & Gamifikasi Poin:** Member maupun Student terdorong untuk terus beraktivitas di platform karena setiap pengerjaan Tryout menghasilkan poin yang dapat ditukarkan dengan produk fisik di **Store**.
- ***Versioning / Archiving System* untuk Sub Component**
    
    ### **Perlindungan Data Historis (Data Integrity):**
    
    - Jika sebuah *Question*, *Context*, atau *Media Library* dari *Sub Composer* diubah oleh admin/mentor di kemudian hari, ubahlah statusnya menjadi **Version 2** dan bukannya menimpa (*overwrite*) data lama.
    - *Mengapa ini penting?* Agar data pengerjaan assessment atau materi dari siswa yang *enroll* di masa lalu tidak rusak atau tidak sesuai dengan histori nilai yang tercatat di menu *Monitor*.
- ***Audit Trail & Change Log* (Pencatatan Aktivitas Admin & Mentor)**
    
    Karena sistem ini melibatkan banyak *role* (Admin Pusat, Admin Cabang/Branch, dan Mentor) yang bisa mengubah *Sub Component* maupun status *Enrollment*, sediakan fitur **Log Aktivitas**:
    
    - **Tracking Perubahan Data:** Catat siapa yang mengubah data kuis, menambahkan jadwal, atau mengubah batas kapasitas *Physical Room*, lengkap dengan timestamp-nya.
    - **Keamanan Operasional:** Mencegah terjadinya konflik seperti mentor mendadak membatalkan slot jadwal tanpa sepengetahuan admin pusat, atau admin cabang mengubah kapasitas ruangan di luar standar.
- **Assignment / Task (Tugas Praktik / Essay Submit)**
    - *Fungsi:* Siswa mengunggah file/link tugas (misal: PDF, repository GitHub, video) untuk diperiksa & dinilai manual oleh mentor/admin.
    - *Kegunaan:* Sangat cocok untuk Program Tipe 2, 3, dan 4 yang membutuhkan verifikasi keahlian praktis, bukan sekadar kuis pilihan ganda.
- **Announcement / Broadcast Channel**

Langkah berikutnya

1. Selesaikan program
2. Termasuk bagian schedule (termasuk SOP Offline to Online)
3. Transaction, Financial, Point
4. UI Admin

Flow 

Apakah jadi memisahkannya menjadi online dan offline?