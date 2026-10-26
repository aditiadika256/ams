# Panduan Pengguna: Master Assessment (Layer 1 CBT)
# Arkanin Management System (AMS)

Modul **Master Assessment** merupakan Layer 1 dari sistem CBT Arkanin yang berfungsi mengelola seluruh bank soal dan stimulus bacaan/kasus panjang secara terpusat sebelum dirangkai ke dalam Blueprint Ujian (Layer 2).

---

## 1. Konsep Wacana Induk (Context Bank)

Wacana Induk (*Context Bank*) digunakan ketika satu teks bacaan panjang, infografis grafik, klip audio mendengarkan (*listening*), atau studi kasus hukum/ekonomi digunakan sebagai rujukan untuk **lebih dari satu nomor soal**.

### Keunggulan Context Bank:
- **Teks Tidak Berulang**: Peserta ujian tidak perlu membaca ulang teks panjang yang sama pada setiap nomor soal.
- **Dukungan Rumus Ilmiah**: Mendukung penulisan rumus Matematika/Fisika menggunakan sintaks TeX/LaTeX (misal `$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$`) yang otomatis dirender rapi via KaTeX.
- **Media Multimedia**: Dapat menyematkan gambar grafik beresolusi tinggi, audio *listening*, atau video studi kasus.

---

## 2. Cara Mengelola Context Bank

1. Masuk ke menu **Master Assessment** $\rightarrow$ **Context Bank** (`admin://view/assessment-contexts`).
2. Klik tombol **+ Tambah Wacana Baru**.
3. Isi informasi wacana:
   - **Judul Wacana**: Nama pengenal wacana (misal: *Wacana Analisis Fiskal Negara 2026*).
   - **Isi Teks / Stimulus**: Tulis teks kaya format Markdown atau masukkan rumus TeX.
   - **Tipe Media & URL (Opsional)**: Pilih `image`, `audio`, atau `video` dan masukkan tautan media pendukung.
4. Klik **Simpan Wacana**.

---

## 3. Menautkan Soal ke Wacana

Saat menyusun butir soal di menu **Question Bank** (`admin://view/assessment-questions`):
1. Pilih **Wacana Induk** pada dropdown *Tautkan ke Wacana*.
2. Tentukan estimasi waktu pengerjaan butir soal (misal 60 detik).
3. Pilih tingkat kesulitan: *Mudah*, *Sedang*, *Sulit*, atau *HOTS*.
4. Input teks pertanyaan, kunci jawaban, dan pembahasan lengkap.
5. Soal yang tertaut otomatis akan ditampilkan berdampingan (*split view*) di layar ujian siswa CBT.
