# Panduan Pengguna: Blueprint Paket Ujian (Layer 2 CBT)
# Arkanin Management System (AMS)

Modul **Component Assessments / Blueprint Builder** merupakan Layer 2 dari arsitektur CBT Arkanin. Modul ini digunakan oleh tim kurikulum dan pengajar untuk merangkai butir-butir soal dari Layer 1 (*Question Bank*) menjadi satu kesatuan paket ujian komprehensif dengan aturan navigasi, model visualisasi, dan formula penilaian tertentu.

---

## 1. Visual Mode (Tampilan Ujian CBT)

Arkanin CBT mendukung 6 mode visualisasi antarmuka ujian agar peserta merasakan pengalaman yang identik dengan ujian resmi target mereka:

| Mode Visual | Karakteristik Tampilan | Target Penggunaan |
| :--- | :--- | :--- |
| **CPNS CAT (BKN)** | Navigasi vertikal/grid nomor di sebelah kanan, nomor soal besar, tombol simpan & lanjut, timer melayang (*floating*). | Tryout SKD/SKB CPNS & Kedinasan |
| **UTBK SNBT** | Antarmuka modular dengan pembagian subtes ketat, timer subtes per bagian, blok navigasi modern. | Persiapan Masuk PTN |
| **AKM / Asesmen Nasional** | Layout ramah anak & literasi/numerasi dengan penekanan stimulus soal cerita dan tabel data interaktif. | Siswa SD/SMP/SMA |
| **OSN / Olimpiade Sains** | Fokus pada area pengerjaan soal esai, rumus TeX/LaTeX kompleks, tanpa petunjuk nomor kunci. | Olimpiade Sains & Matematika |
| **OMI (Madrasah)** | Desain terintegrasi dengan konteks studi keislaman & sains terpadu. | Kompetisi Sains Madrasah |
| **Standard** | Layout bersih, minimalis, dan serbaguna untuk evaluasi harian atau kuis reguler. | Kuis & Penilaian Harian |

---

## 2. Aturan Penilaian (Scoring Mode)

Admin dapat memilih metode kalkulasi nilai akhir paket ujian:
- **Same Weight (Bobot Seragam)**: Setiap soal bernilai sama (misal 1 poin jika benar, 0 jika salah).
- **Custom Weight (Bobot Bebas)**: Poin soal ditentukan per butir sesuai tingkat kesulitan.
- **Skala Bertingkat (TKP)**: Poin 1 sampai 5 untuk pilihan jawaban A-E (standar tes kepribadian CPNS).
- **IRT 2PL / Rasch (Item Response Theory)**: Bobot nilai dihitung secara dinamis pasca-ujian berdasarkan daya pembeda ($a$) dan tingkat kesulitan butir ($b$).

Admin juga dapat mengaktifkan **Sistem Minus / Negative Marking** (misal: benar $+4$, salah $-1$, kosong $0$) untuk simulasi UTBK klasik atau olimpiade.

---

## 3. Langkah Merangkai Paket Blueprint

1. Buka menu **Programs & Components** $\rightarrow$ **Component Assessments** (`admin://view/component-assessments`).
2. Klik tombol **+ Buat Blueprint Baru**.
3. Isi informasi dasar paket:
   - **Nama Blueprint**: misal *Simulasi SKD CPNS 2026 Gelombang 1*.
   - **Tingkat Kesulitan**: Pemula, Menengah, Mahir, atau Semua Level.
   - **Durasi Total**: misal *100 Menit*.
   - **Pilih Mode Visual**: Pilih mode CAT yang sesuai.
   - **Pilih Metode Penilaian**: Tentukan bobot atau skala bertingkat.
   - **Acak Urutan Soal**: Aktifkan toggle jika urutan soal ingin diacak per siswa.
4. Tambahkan **Sub-tes (Exam Sections)**:
   - Klik **+ Tambah Sub-tes**.
   - Masukkan nama sub-tes (misal *TWK*, *TIU*, *TKP*).
   - Tentukan **Mode Transisi**:
     - *Lanjut Otomatis (Continuous)*: Siswa langsung melanjutkan ke sub-tes berikutnya tanpa jeda.
     - *Jeda Istirahat (Intermission Break)*: Siswa diberi jeda istirahat terukur (misal 180 detik) sebelum sub-tes berikutnya dapat dibuka.
   - Tentukan **Timer Khusus Sub-tes (Opsional)**: Membatasi pengerjaan hanya untuk sub-tes tersebut.
5. Klik **Simpan Blueprint**. Blueprint siap dihubungkan ke silabus program belajar.
