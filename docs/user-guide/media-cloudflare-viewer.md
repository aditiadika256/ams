# Panduan Pengguna: Pengelolaan Media Cloudflare CDN & View Page Google Drive / PDF

Panduan ini menjelaskan cara mengunggah dan mengelola materi pembelajaran di **Arkanin Management System (AMS)** menggunakan penyimpanan **Cloudflare CDN**, serta menyematkan berkas **Google Drive** atau **PDF** yang langsung tampil sebagai **View Page interaktif** bagi siswa.

---

## 1. Opsi Sumber Materi Pembelajaran

Pada menu **Master Program** -> Langkah **3. Komponen & Modul**, klik tombol **+ Atur Isi & Materi** pada kartu komponen yang diinginkan. Anda akan disajikan 5 pilihan sumber materi:

1. **Upload Cloudflare (R2 & CDN Edge)**:
   - Unggah berkas dokumen (PDF, DOCX, PPTX), video (MP4), audio, atau arsip (ZIP).
   - Berkas otomatis tersimpan di Cloudflare Object Storage (R2) dengan pengantaran cepat edge CDN global tanpa jeda (zero egress bandwidth costs).
2. **Link Drive / PDF (View Page Interaktif)**:
   - Sediakan tautan berkas Google Drive (Docs, Sheets, Slides, Drive file) atau tautan langsung dokumen PDF eksternal.
   - Materi akan otomatis terbuka di portal siswa sebagai **View Page interaktif** tanpa perlu mengunduh terlebih dahulu.
3. **Video Streaming**:
   - Tautan video YouTube, Vimeo, atau HLS streaming.
4. **Wacana / Teks**:
   - Artikel teori, petunjuk praktikum, atau modul bacaan langsung di portal.
5. **Tautan Lainnya**:
   - Tautan eksternal ke website, repositori GitHub, atau referensi luar.

---

## 2. Cara Menggunakan Fitur Link Drive & Dokumen PDF

### A. Menyematkan Google Drive Link
1. Salin tautan berkas dari Google Drive Anda (misalnya: `https://drive.google.com/file/d/1A2B3C4D.../view?usp=sharing`).
2. Pastikan izin berbagi pada Google Drive telah diatur ke **"Siapa saja yang memiliki link dapat melihat"** (Anyone with the link can view).
3. Pilih opsi **"Link Drive / PDF"** pada formulir komponen.
4. Tempel tautan pada kolom URL.
5. Sistem akan otomatis mendeteksi format Google Drive dan menampilkan badge **"Google Drive Terdeteksi: Embed View Page Siap"**.
6. Klik tombol **"Pratinjau View Page"** untuk melihat simulasi tampilan siswa secara langsung sebelum menyimpan!

### B. Menyematkan URL Dokumen PDF Langsung
1. Masukkan URL berkas PDF publik (misalnya: `https://contoh.com/materi-modul.pdf`).
2. Sistem akan mendeteksi format `.pdf` dan menampilkan badge **"Dokumen PDF Terdeteksi: Interactive PDF Viewer Siap"**.
3. Siswa akan mendapatkan pengalaman membaca dokumen PDF langsung di halaman browser dengan kontrol zoom, layar penuh, dan unduhan.

---

## 3. Tampilan View Page di Sisi Siswa (Portal Belajar)

Ketika siswa membuka materi pada komponen tersebut di portal belajar mereka:
- **Tampilan Glassmorphism Mewah**: Viewer dirancang dengan estetika glass modern (`style glass`) yang elegan, responsif, dan nyaman untuk membaca.
- **Fitur Interaktif Terpadu**:
  - **Layar Penuh (Fullscreen)**: Memperbesar viewer hingga memenuhi layar untuk fokus belajar optimal.
  - **Buka di Tab Baru**: Membuka materi pada tab baru peramban jika siswa ingin membaca terpisah.
  - **Tombol Unduh**: Opsi unduhan lokal tetap disediakan jika siswa ingin menyimpan salinan offline.
  - **Indikator Sumber**: Label jelas menunjukkan apakah materi berasal dari Google Drive, Dokumen PDF, atau Cloudflare CDN.

---

## 4. Tips dan Pemecahan Masalah

- **Google Drive Meminta Login**: Jika iframe meminta siswa login ke Google atau tidak dapat diakses, periksa kembali izin tautan Google Drive tersebut di Google Drive Anda. Pastikan akses bukan "Restricted", melainkan "Anyone with the link".
- **Ukuran File Maksimal Cloudflare**: Maksimal berkas yang dapat diunggah langsung adalah 100 MB per berkas.
- **Draft Unggahan**: Pada saat pembuatan program baru, file yang Anda pilih akan berstatus **Draft Unggah** dan akan mulai diunggah ke Cloudflare secara otomatis saat Anda menekan tombol simpan program di langkah terakhir (Review).
