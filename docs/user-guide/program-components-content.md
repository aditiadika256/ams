# Panduan Pengguna: Pengelolaan Komponen & Konten Langsung pada Program Wizard

Panduan operasional bagi Administrator AMS untuk mengonfigurasi komponen dan materi pembelajaran secara langsung pada wizard pembuatan/edit program tanpa perlu membuka tab terpisah.

---

## 1. Latar Belakang & Kemudahan Alur

Sebelumnya, penambahan materi atau berkas modul mengharuskan admin menyelesaikan konfigurasi program terlebih dahulu, kembali ke tabel daftar program, lalu membuka menu aksi **"Kelola isi"**. 

Pada pembaruan ini, seluruh pengaturan materi, unggah file modul, penautan Media Library, dan penyematan video streaming dapat dilakukan **langsung pada Langkah Komponen (`ProgramComponentsStep`)** baik saat **Tambah Program Baru** maupun **Edit Konfigurasi**.

---

## 2. Langkah-Langkah Penggunaan

### A. Menambahkan Komponen ke Program
1. Buka menu **Workspace > Program Builder**.
2. Klik tombol **Tambah Program** atau klik menu aksi baris program **Edit konfigurasi**.
3. Navigasikan ke langkah **Komposisi Komponen** (Langkah 3).
4. Pilih komponen yang ingin ditambahkan dari dropdown atau klik tombol **Tambah Cepat** (misalnya: *Materi*, *Media / Video*, *Asesmen*, *Jadwal Pertemuan*).

### B. Mengatur Isi & Materi Komponen Secara Langsung
1. Pada kartu komponen yang ditambahkan, klik tombol **[+ Atur Isi & Materi]** (atau **[Edit Isi & Materi]**).
2. Panel kaca (*glassmorphism expansion drawer*) akan terbuka tepat di bawah kartu komponen tersebut.
3. Pilih **Jenis Materi / Sumber Konten**:
   - **File Privat / Modul**: Untuk mengunggah dokumen PDF, slide PPTX, modul DOCX, atau arsip ZIP materi.
   - **Video Streaming**: Untuk menyematkan URL video YouTube, Vimeo, atau HLS stream aman.
   - **Wacana / Teks**: Untuk menulis materi teori langsung dalam bentuk teks atau studi kasus.
   - **Tautan Eksternal**: Untuk menyematkan link Google Drive tugas atau referensi eksternal.

### C. Mengunggah Berkas Baru atau Memilih dari Media Library
- **Unggah Langsung (Direct Upload)**:
  - Tarik file materi ke area dropzone bertitik (*dashed zone*) atau klik untuk memilih file dari komputer Anda.
  - Pada mode **Edit Konfigurasi**, file langsung diunggah secara otomatis ke server dengan indikator persentase progres.
  - Pada mode **Tambah Program Baru**, file akan berstatus *Staged* dan otomatis diunggah seketika Anda mengklik simpan pada langkah Review.
- **Pilih dari Media Library**:
  - Klik tombol **Ambil dari Media Library** untuk melihat berkas yang sudah pernah diunggah sebelumnya pada program tersebut.
  - Klik **Pilih File** pada berkas yang diinginkan tanpa perlu mengunggah ulang.

### D. Melengkapi Detail & Publikasi Materi
- **Judul Materi**: Sesuaikan judul modul atau materi pembelajaran siswa.
- **Estimasi Durasi Belajar**: Masukkan perkiraan waktu belajar siswa dalam menit (misal: 30 menit).
- **Ringkasan / Catatan**: Masukkan instruksi singkat atau hal penting yang wajib diperhatikan peserta.
- **Publikasikan Materi**: Aktifkan saklar agar materi langsung tampil di dashboard siswa yang terdaftar.
- **Preview Terbuka (Gratis)**: Aktifkan jika materi ini dapat diakses secara gratis oleh calon siswa sebelum membeli program.
- Klik **Selesai Atur Isi** atau tutup panel. Kartu komponen akan menampilkan lencana ringkasan materi secara rapi.

---

## 3. FAQ & Catatan Penting
- **Apakah menu "Kelola isi" di aksi baris program masih ada?**
  Ya, menu tersebut tetap dipertahankan dengan nama **"Kelola isi (Lanjutan / Detail)"** bagi administrator yang ingin menyusun kurikulum multi-modul dan sub-lesson bertingkat secara mendalam.
- **Berapa ukuran maksimal file yang dapat diunggah?**
  Batas maksimal per file adalah 100 MB dengan format aman seperti `.pdf`, `.docx`, `.pptx`, `.mp4`, `.zip`, `.png`, dan `.jpg`.
