# Panduan Pengguna: Media Library & Pengelolaan Materi Program

Panduan lengkap bagi Administrator dan Instruktur untuk mengelola bank materi pembelajaran digital melalui **Media Library**, menggunakan formulir unggah terpisah, memeriksa pratinjau interaktif berdasarkan format berkas, dan menautkannya ke silabus program di Arkanin Management System (AMS).

---

## 1. Mengenal Media Library

**Media Library** adalah pusat penyimpanan berkas pembelajaran digital (modul PDF, slide presentasi, dokumen Word, lembar kerja Excel, video, audio, gambar, dan arsip) yang terintegrasi langsung dengan jaringan CDN Cloudflare berkecepatan tinggi.

### Manfaat Media Library
- **Upload Sekali, Gunakan Berkali-kali**: Modul umum (misalnya: Panduan Instalasi Tools atau Silabus Dasar) cukup diunggah satu kali di Media Library, lalu dapat ditautkan ke banyak program yang berbeda.
- **Pemisahan Tampilan & Formulir (Clean Architecture)**: Antarmuka penjelajah berkas (*view*) dan formulir input pengunggahan (*form*) dipisahkan secara modular untuk kenyamanan kerja dan kecepatan respons aplikasi.
- **Pratinjau Format-Spesifik Lengkap**: Setiap jenis format berkas disajikan dengan penampil (*viewer*) khusus yang interaktif (PDF, Office, Video, Audio, Gambar dengan Zoom, Teks/Kode, dan ZIP).
- **Akses Cepat & Aman**: Seluruh berkas disimpan di Cloudflare Storage dan dilayani melalui Edge CDN global sehingga siswa dapat membuka modul atau memutar materi dengan instan tanpa buffering.

---

## 2. Cara Mengakses Menu Media Library

1. Buka dashboard admin AMS.
2. Pada menu sidebar sebelah kiri, buka bagian **Component Tool** lalu pilih **Media Library** (`admin://view/media-library`).
3. Anda akan melihat halaman Media Library dengan antarmuka bergaya *Glassmorphism*, menampilkan:
   - **Kartu Ringkasan Metrik**: Jumlah total berkas, kapasitas penyimpanan terpakai, status CDN Cloudflare, dan jumlah program terhubung.
   - **Bar Filter & Pencarian**: Pencarian instan berdasarkan nama berkas, filter program, filter folder, dan filter jenis tipe file.
   - **Mode Tampilan Ganda**: Beralih antara Grid Kartu visual atau Tabel Rinci.
   - **Tombol Aksi**: Refresh data dan "Unggah Berkas Baru" untuk memunculkan formulir input mandiri.

---

## 3. Formulir Unggah Media Library (`MediaLibraryForm`)

Pengunggahan berkas kini ditangani oleh modul formulir tersendiri (`MediaLibraryForm`) yang bersih dan fokus:

1. Klik tombol **Unggah Berkas Baru** di pojok kanan atas halaman Media Library.
2. Formulir unggah mandiri akan terbuka:
   - **Area Drag & Drop Berkas**: Tarik berkas dari komputer Anda ke dalam kotak bertitik, atau klik untuk memilih file melalui dialog file browser. Berkas yang dipilih akan menampilkan ikon format spesifik, ukuran, dan status kesiapan.
   - **Kaitkan ke Program (Opsional)**: Pilih program dari daftar *dropdown* jika berkas khusus untuk program tersebut. Pilih opsi *Tanpa Program (Berkas Global Workspace)* jika materi bersifat umum.
   - **Kategori / Nama Folder**: Masukkan folder kategori, atau klik salah satu tombol saran cepat (`materials`, `documents`, `curriculum`, `slides`, `videos`, `audio`, `exams`).
   - **Alasan Pengunggahan / Catatan Audit**: Masukkan catatan singkat mengenai tujuan pengunggahan untuk kebutuhan riwayat pelacakan audit.
3. Klik tombol **Unggah ke Cloudflare R2**.
4. Sistem akan menampilkan progress bar pengunggahan secara *real-time* (0% - 100%) dan memberikan notifikasi sukses seketika setelah berkas tersimpan aman di Cloudflare R2 & Edge CDN.

> [!NOTE]
> Format file yang didukung: PDF, DOCX, XLSX, PPTX, MP4, WEBM, MP3, WAV, PNG, JPG, JPEG, SVG, WEBP, ZIP, RAR, TXT, JSON. Ukuran maksimal per file adalah 100 MB.

---

## 4. Pratinjau Interaktif Berdasarkan Format Berkas (Format-Specific Viewer)

Pada setiap kartu atau baris berkas di Media Library, klik tombol **Pratinjau** (ikon mata) untuk membuka jendela simulasi materi sebagaimana akan dilihat oleh siswa di portal belajar:

### A. Dokumen PDF (`.pdf`)
- Membuka **Interactive PDF Viewer** dengan toolbar navigasi halaman, tombol download, dan mode layar penuh (*fullscreen*).

### B. Dokumen Microsoft Office (Word, Excel, PowerPoint)
- **Word (`.docx`, `.doc`)**: Pratinjau daring via Microsoft Office Online Viewer dengan tampilan tata letak dokumen asli, dilengkapi tombol buka di Office Online dan unduh.
- **Excel (`.xlsx`, `.xls`, `.csv`)**: Pratinjau lembar kerja tabel dengan kisi data rapi.
- **PowerPoint (`.pptx`, `.ppt`)**: Pratinjau slide presentasi interaktif.

### C. Video Pembelajaran (`.mp4`, `.webm`, `.mov`)
- Pemutar video HTML5 responsif dengan kontrol play/pause, pengatur volume, pemilih kecepatan pemutaran (*playback speed*), dan layar penuh.

### D. Audio Pembelajaran (`.mp3`, `.wav`, `.m4a`)
- Pemutar audio khusus dengan visual badge, durasi waktu, dan kontrol pemutaran halus.

### E. Gambar & Grafis (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`)
- Penampil gambar beresolusi tinggi dengan kontrol **Zoom In** (+25%), **Zoom Out** (-25%), persentase zoom (50% - 300%), dan tombol **Reset Zoom**.

### F. Dokumen Teks & Kode Sumber (`.txt`, `.json`, `.md`, `.xml`)
- Pembaca teks terisolasi dengan font monospaced yang nyaman untuk membaca kode, konfigurasi JSON, atau catatan rilis.

### G. Paket Arsip (`.zip`, `.rar`, `.7z`)
- Kartu inspeksi arsip yang menampilkan informasi ukuran paket terkompresi, jenis arsip, dan tombol unduh langsung.

---

## 5. Informasi Teknis & Audit Trail Lengkap pada Modal Detail

Jendela pratinjau materi kini juga dilengkapi dengan kartu **Detail Teknis & Audit Trail**:
- **Integritas Berkas**: Checksum SHA-256 kriptografis lengkap untuk memverifikasi keaslian file.
- **Kapasitas Penyimpanan**: Ukuran berkas dalam satuan format (KB/MB) dan jumlah persis byte.
- **Kepemilikan & Pelacakan**:
  - Nama pengunggah (`uploader_name` / `created_by`).
  - Waktu pembuatan berkas (`created_at`).
  - Waktu pembaruan terakhir (`updated_at`).
  - Storage Disk (`cloudflare_r2`).
- **Aksi Cepat**: Tombol **Salin URL CDN**, tombol **Unduh Berkas**, dan tombol **Hapus Berkas** (dengan dialog konfirmasi audit).

---

## 6. Cara Menautkan Materi pada Program Components Step

Saat menyusun kurikulum pada menu **Programs**:
1. Buka langkah **Komposisi Komponen & Konten Program**.
2. Klik tombol **Pilih dari Media Library** pada komponen materi.
3. Dialog pemilih media akan muncul:
   - Pilih tab **Semua Media Library** untuk berkas sentral atau tab **Program Ini** untuk berkas terikat.
   - Cari materi berdasarkan nama atau filter folder.
   - Klik **Pratinjau** untuk menguji tampilan berkas sesuai formatnya.
   - Klik **Pilih Materi** untuk menautkannya ke komponen.
4. Anda juga dapat memilih opsi **Unggah Baru & Tautkan Langsung** di dalam modal jika memiliki berkas baru yang belum ada di perpustakaan.
