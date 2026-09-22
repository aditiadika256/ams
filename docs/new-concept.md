> [!NOTE]
> **STATUS DOKUMEN: SUDAH DIFORMALISASIKAN KE PRD RESMI**
> Catatan draf konsep dan mekanisme baru pada dokumen ini telah diformalisasikan secara lengkap ke dalam:
> - 📄 **[2026-09-21-PRD-ekosistem-dan-mekanisme-baru.md](file:///d:/project/ams/docs/plans/2026-09-21-PRD-ekosistem-dan-mekanisme-baru.md)**
> - 📋 **[Master To-Do List](file:///d:/project/ams/docs/to-do-list.md)**
> 
> Silakan gunakan PRD resmi tersebut sebagai sumber kebenaran (*single source of truth*) implementasi teknis.

Deskripsi Aplikasi
1. Pemetaan Role & Area Sistem
Area Management (Back-Office / Admin Area):
Super Admin: Mengakses Full AMS (Kontrol sistem global, pembuat cabang, master data, dan arus kas pusat).
Tim Cabang (Manager, Keuangan, Operasional, Pemasaran, Kemitraan, Teknologi): Mengakses dashboard ASA (Manajemen operasional cabang) dan ASD (Manajemen keuangan cabang).
Area Public / User (Front-End & Workspace Area):
Guest: Pengunjung tanpa login (melihat landing page, katalog program, store buku, info kemitraan sekolah).
Member: User terdaftar yang belum/sedang membeli layanan.
Student (A-Plus): Memiliki akses ke Workspace Student (CBT 5 jenis pertanyaan, materi, jadwal, poin).
Mentor Utama (A-Teams): Memiliki akses ke Workspace Mentor (Karyawan tetap, mengampu program/kelas spesifik).
Mentor Harian (A-Teams): Memiliki akses ke Workspace Mentor (Pengajar lepas/freelance, mengampu sesi/kelas harian).
Catatan Catatan Penting: Jika seorang Mentor di kemudian hari ditunjuk menjadi bagian dari manajemen cabang (misal: merangkap Admin Operasional), akun tersebut tinggal diberikan tambahan hak akses (permission) ke modul ASA di area Management.

2. Visual Arsitektur Aplikasi (lms.arkanin.my.id)
                       ┌─────────────────────────┐
                       │    lms.arkanin.my.id    │
                       └────────────┬────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        [ Area Public & User ]            [ Area Management ]
        (Front-End / Workspace)           (Back-Office Dashboard)
                    │                               │
        ┌───────────┼───────────┐         ┌─────────┴─────────┐
        ▼           ▼           ▼         ▼                   ▼
     Student     Mentor      Mentor    Super Admin       Admin Cabang
    (A-Plus)     Utama       Harian    (Full AMS)     (Sistem ASA & ASD)
               (A-Teams)   (A-Teams)

3. Alur Akses Berdasarkan Status Login
Satu Pintu Masuk: Semua pengguna (Student, Mentor Utama, Mentor Harian, hingga Tim Cabang) melakukan login melalui domain yang sama (lms.arkanin.my.id).
Pengarahan Tampilan (Redirection):
Student, Mentor Utama, & Mentor Harian akan diarahkan ke antarmuka User/Workspace (A-Plus / A-Teams).
Super Admin & Admin Cabang akan diarahkan ke antarmuka Management Dashboard (AMS / ASA / ASD).
Penyesuaian arsitektur ini sudah tepat dan terkunci. Apakah kita bisa melanjutkannya ke pembahasan alur pendaftaran program dan pembayaran (cicilan/full), atau ingin langsung masuk ke detail fitur Workspace?

PENJELASAN ALUR DIAGRAM (STEP-BY-STEP)
1. Alur Autentikasi & Onboarding User
Autentikasi (Register / Log In / Log Out):
Calon pengguna mendaftar (Register) menggunakan email/WhatsApp dengan verifikasi OTP.
Hasil pendaftaran otomatis menetapkan pengguna pada role awal sebagai Member.
Percabangan Onboarding:
Jalur Student:
Member melengkapi Data Identitas di Profil (tanpa perlu mengunggah berkas/dokumen pendaftaran).
Member melakukan pembelian program di Katalog Program.
Setelah konfirmasi pembayaran dan disetujui (Approve) oleh Admin, role otomatis menjadi Student dan hak akses Workspace terbuka.
Jika transaksi ditolak (Reject) atau dibatalkan, dana otomatis masuk ke Saldo Akun Student.
Jalur Mentor (Seleksi & Enrollment):
Member mendaftar pada program seleksi pengajar dan mengunggah berkas (Identitas, CV, Sertifikat, Tes Tulis, Video Mengajar).
Mengikuti tahapan seleksi: Applied $\rightarrow$ Under Review $\rightarrow$ Assessment $\rightarrow$ Interview $\rightarrow$ Hired / Rejected / Withdrawn.
Setelah divalidasi oleh Admin Operasional atau Manajer Cabang, pengguna ditetapkan menjadi Mentor Harian (Pengajar lepas) atau Mentor Utama (Karyawan tetap).
2. Alur Program, Transaksi, Keuangan & Sistem Saldo
Modul Program (Student & Mentor):
Menyediakan pilihan program bimbingan/pelatihan (durasi, harga, fasilitas). Baik Student maupun Mentor sama-sama dapat membeli program.
Mendukung fitur Referral & Reward serta opsi Sistem Cicilan.
Verifikasi Transaksi (E-Payment) & Approval:
Pembayaran diproses otomatis melalui Payment Gateway (Virtual Account, E-Wallet, QRIS, Transfer Bank).
Sistem melakukan Auto-Generate Invoice, konfirmasi pembayaran via WhatsApp/Email, dan pencatatan tagihan.
Transaksi dikonfirmasi via WhatsApp untuk di-approve oleh Admin. Jika tidak di-approve, terjadi rollback atau refund yang langsung dialokasikan ke Saldo Akun.
Sistem Saldo (Wallet/Balance Engine) - Student & Mentor:
Sisi Student: Menampung dana refund/rollback akibat pembatalan transaksi program. Saldo dapat digunakan untuk membeli program lain, produk Store, atau ditarik kembali (withdrawal).
Sisi Mentor: Menampung akumulasi pencairan Honor/Gaji mengajar. Mentor dapat memantau saldo dan melakukan penarikan (drawdown/withdraw) langsung ke rekening bank pribadi.
Modul Keuangan (AMS / ASD):
Merekam pencatatan laba-rugi, komisi/gaji mentor berdasarkan sesi mengajar, slip gaji otomatis, invoice murid, penarikan saldo, serta pengeluaran operasional cabang (listrik, sewa, dll.).
Mengatur kebijakan rollback poin dan penyesuaian saldo jika terjadi pembatalan transaksi.
3. Ekosistem Poin, Store, & Gamifikasi
Sumber Perolehan Poin:
Pembelian program (reward/cashback poin).
Pencapaian pengerjaan TryOut CBT 5 jenis pertanyaan (Gamification System).
Pembelian poin langsung (top-up poin) di Store.
Penggunaan Poin di Store:
Poin digunakan untuk membeli produk fisik (buku/materi) atau layanan di Store.
Masa berlaku poin dan penyesuaian rate nilai konversi poin diatur secara fleksibel melalui modul ASD (Keuangan).
4. Modul Workspace & Pengalaman Pengguna (Unified UI)
Tampilan Seragam (Unified Interface): Antarmuka dasar Program, Workspace, dan Store dibuat sama antara Student dan Mentor.
Fitur Kondisional Mentor: Khusus untuk akun dengan role Mentor Utama atau Mentor Harian, sistem secara otomatis menampilkan menu tambahan (conditional rendering):
Manajemen sesi mengajar dan input absensi siswa.
Rekapitulasi honor, riwayat gaji, indikator Saldo Mentor, dan tombol penarikan slip gaji/dana.
5. Struktur Manajemen Cabang (AMS, ASA, ASD)
Super Admin (AMS): Kontrol global atas seluruh cabang, pembuat cabang baru, penetapan konten pusat, dan konsolidasi keuangan global.
Manajer Cabang (ASA): Mengawasi kinerja cabang (jumlah siswa, mentor, arus kas, poin).
Tim Admin Spesifik:
Admin Keuangan (ASD): Verifikasi transaksi, pengolahan withdrawal Saldo (Student & Mentor), kelola arus kas cabang, dan laporan laba-rugi.
Admin Operasional (ASA): Pengelolaan jadwal bimbingan, verifikasi profil student, dan penugasan mentor.
Admin Kemitraan (ASA): Mengelola program sekolah gratis dan penetapan wilayah referral.
Admin Pemasaran & Teknologi (ASA): Mengelola campaign lokal dan dukungan kendala sistem.

Perbedaan UI Version & Strategi Marketing
1. Dinamika Logo & Identitas Role (Header Area)
Logo "A" di sudut kiri atas beradaptasi secara dinamis sesuai dengan status login/role pengguna:
Klik Logo: Mengarahkan kembali ke domain utama ARKANIN.MY.ID. (saat ini deploy project ams ada pada lms.arkanin.my.id)
Student: Branding logo berubah menjadi A+.
Mentor: Branding logo berubah menjadi A-team.
Admin Cabang (ASA): Arkanin Super App.
Keuangan Cabang (ASD): Arkanin Super Diamond.
Super Admin (AMS): Arkanin Management System.
Detail : 
Logonya berubah mengikuti Role
A+ untuk Student
A-team untuk Mentor
Arkanin Super App untuk Admin
Arkanin Super Diamond untuk Keuangan
Arkanin Management System untuk Super Admin
Manajemen logo dapat di kelola pada sisi admin pada menu Appearance.
Appearance berisi color pallete saat ini dan site logo
2. Perbedaan UI Version: Guest vs Logged-In User
A. Tampilan Mobile untuk Guest (Belum Login)
Header / Top Navigation: Menyediakan Hamburger Menu (Beranda, Program, Store), Keranjang Belanja, dan Pengaturan.
Bottom Navigation (5 Tombol utama):
Beranda: Landing page, banner promo, voucher.
Program: Katalog produk (detail produk akan mengarahkan ke login jika belum punya akses).
Login / Register: Tombol tengah untuk masuk/daftar akun.
Store: Katalog produk fisik & poin (dilengkapi keranjang).
Activity: Pengumuman promo, iklan, dan notifikasi voucher sukses.
B. Tampilan Mobile untuk Member, Student, & Mentor (Logged-In)
Perubahan Utama BottomNav: Tombol Login/Register di bagian tengah berubah menjadi Workspace.
Perubahan Fitur Activity: Tombol paling kanan (lonceng) berubah fungsi fokus menjadi Announcement.
Profile Dropdown (Akses Avatar): Membuka pop-up navigasi internal yang berisi: Profile, Achievement, Setting, dan Log Out.
Hamburger Side Pop-Up (TopBar): Menampilkan navigasi utama Beranda, Program, Workspace, dan Store.
3. Strategi Marketing Lapisan I (Gratis Fitur Terbatas / Freemium)
Strategi ini memanfaatkan keterikatan pengguna secara bertahap (Gamification Funnel):
Onboarding: Pengguna mendaftar secara gratis sebagai Member.
Claim/Enroll: Member mengakses menu Program dan memasukkan Enrollment Code (kode pendaftaran gratis/promosi).
Execution (Workspace): Pengguna masuk ke Workspace untuk mengikuti kompetisi/pengerjaan TryOut.
Reward & Retention (Gamifikasi Poin):
Setiap pengerjaan TryOut memberikan reward berupa Point.
Semakin aktif member berlatih, semakin banyak Point yang dikumpulkan.
Point tersebut digunakan untuk menukarkan buku atau merchandise fisik di menu Store.

Urutan Prioritas Pengembangan
Berdasarkan wireframe Miro yang Anda lampirkan (Program, Workspace, Store) serta draf ERD Anda, berikut adalah Peta Urutan (Roadmap 5 Tahap) yang harus dipikirkan dan diselesaikan secara berurutan agar UI dan Admin bisa saling terhubung dengan rapi:
Tahap 1: Pondasi Master Data & Katalog (Mental Model: Katalog Program)
Selesaikan ini terlebih dahulu sebelum memikirkan transaksi atau jadwal.
Atur Struktur Program & Bank Soal/Materi (Admin Sisi Operasional):
Bank Soal & Modul: Buat dulu modul/materi (PDF, Video) dan Bank Soal Tryout/CBT.
Master Program: Gabungkan materi & bank soal tersebut ke dalam entitas Program.
Atribut Program: Judul, harga dasar, diskon, tag/kategori, dan tipe delivery (Online/Offline).
UI User yang Terbentuk:
Halaman Program (Katalog): Card program, filter tag, detail program, dan form input Enrollment Code.
Tahap 2: Transaksi, Keuangan & Pembuatan Enrollment (Mental Model: Checkout & Wallet)
Setelah program ada, atur bagaimana user membelinya dan bagaimana dana bergerak.
Logika Transaksi (Admin Sisi Keuangan):
Transaksi terjadi $\rightarrow$ Menghasilkan record Transaction.
Jika bayar lunas/klaim kode $\rightarrow$ Sistem membuatkan Enrollment unik untuk user.
Logika Wallet / Saldo (Refund & Pengembalian):
Jika terjadi pembatalan/refund, dana tidak ditransfer balik manual, melainkan dimasukkan ke User_Wallet (Saldo).
Saldo ini bisa dipakai checkout program lain.
UI User yang Terbentuk:
Halaman Store / Wallet: Menampilkan sisa Saldo, Riwayat Order (Belum Bayar, Dikemas, Selesai, Dibatalkan), dan PIN Transaksi.
Tahap 3: Workspace & Penjadwalan (Mental Model: Aktivitas Belajar/Mengajar)
Setelah user memiliki Enrollment, baru atur area belajarnya.
Workspace Student:
Mengambil data dari Enrollment.
Menampilkan tab status: Active, Waiting, Done (sesuai wireframe Miro Anda).
Di dalam Workspace: Akses Assessment (CBT/Tryout), Class (Materi/PDF/Video), Schedule (Jadwal Zoom/Luring), dan Progress Tracker (% completion).
Workspace Mentor & Honor:
Jadwal & Absensi: Admin memetakan mentor ke Sesi/Batch. Mentor mengisi absensi di Workspace.
Pencatatan Honor Mentor: Setiap kali sesi kelas diselesaikan & di-absensi, sistem menambahkan saldo ke Mentor_Wallet (Pencatatan keuangan otomatis).
UI User yang Terbentuk:
Halaman Workspace (Siswa & Mentor).
Tahap 4: Gamifikasi & Store Reward (Mental Model: Insentif)
Atur fitur pelengkap untuk motivasi belajar setelah aktivitas utama belajar berjalan.
Poin Gamifikasi:
Siswa lulus kuis/CBT atau presensi 100% $\rightarrow$ Mendapatkan Gamification_Points.
Store Reward:
Katalog penukaran Poin dengan Buku Fisik atau Merchandise (sesuai wireframe Miro Anda).
UI User yang Terbentuk:
Tab Store (Poin & Merchandise).
Tahap 5: Sertifikasi & Sistem Cabang (branch_id)
Tahap akhir untuk penguncian sistem.
Master Certificate Engine: Penyetujuan kelulusan otomatis berdasarkan passing grade CBT & presensi $\rightarrow$ Penerbitan Sertifikat.
Penyelipan branch_id: Menambahkan atribut cabang pada Program, User, Mentor, dan Laporan Keuangan/Operasional.
Kesimpulan Ringkas: Dari Mana Harus Mulai Hari Ini?
Langkah 1: Rapikan ERD Program & Bank Soal terlebih dahulu (Programs, Modules, Lessons, Question_Bank).
Langkah 2: Buat ERD Transaksi & Enrollment (Transactions, Enrollments, Wallets).
Langkah 3: Baru kemudian buat Mockup / UI Workspace berdasarkan data dari Enrollment tersebut.
Dengan mengikuti urutan ini, Anda tidak perlu memikirkan semuanya sekaligus. Cukup selesaikan Tahap 1 (Master Program) terlebih dahulu!