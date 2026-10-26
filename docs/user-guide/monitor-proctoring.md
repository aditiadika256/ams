# Panduan Pengguna: Live Proctoring & IRT Engine (Layer 4 CBT)
# Arkanin Management System (AMS)

Modul **Live Proctoring & Item Analysis** merupakan Layer 4 dari ekosistem CBT Arkanin yang berfungsi sebagai pusat kendali pengawasan jalannya ujian online, deteksi anomali kecurangan, serta analisis psikometrik kualitas butir soal pasca-ujian menggunakan teori respons butir (*Item Response Theory*).

---

## 1. Pusat Pengawasan Ujian (Live Proctoring Grid)

Menu: **Monitor** $\rightarrow$ **Live Proctoring** (`admin://view/monitor-proctoring`)

### A. Fitur Token Ujian Dinamis
Untuk mencegah kebocoran soal sebelum waktu yang ditentukan:
1. Pengawas memilih paket ujian target pada dropdown.
2. Klik tombol **Generate Token Ujian**.
3. Sistem akan menerbitkan kode unik 6-karakter (misal: `ARK79Q`) dengan masa aktif 30 menit.
4. Bagikan token ini kepada peserta di ruangan atau melalui kanal broadcast resmi.

### B. Grid Status Siswa Real-time
Setiap kartu peserta menampilkan:
- **Badge Status**:
  - 🟢 **Active**: Siswa sedang aktif mengerjakan soal dengan koneksi stabil.
  - 🟡 **Idle / Warning**: Siswa tidak berinteraksi atau terdeteksi berpindah jendela (*tab switch*).
  - 🔴 **Disqualified**: Siswa didiskualifikasi karena pelanggaran berat.
  - 🔵 **Completed**: Ujian telah diselesaikan dan jawaban tersimpan.
- **Tindakan Cepat Pengawas**:
  - **Kirim Peringatan (*Warn*)**: Mengirim notifikasi visual peringatan ke layar siswa.
  - **Jeda Ujian (*Pause*)**: Menghentikan sementara timer siswa jika ada kendala teknis.
  - **Lanjutkan Ujian (*Resume*)**: Mengaktifkan kembali timer siswa.
  - **Reset Sesi (*Reset Attempt*)**: Memberikan kesempatan ulang bagi siswa yang mengalami listrik padam / kegagalan perangkat.
  - **Diskualifikasi (*Disqualify*)**: Membatalkan sesi siswa dan memberikan nilai nol.

---

## 2. Analisis Butir Soal & IRT Engine (Psychometrics)

Menu: **Monitor** $\rightarrow$ **Assessment Analysis** (`admin://view/monitor-analysis`)

### Parameter Psikometrik:
- **Tingkat Kesukaran ($b$)**: Rentang $-3.00$ (sangat mudah) hingga $+3.00$ (sangat sulit). Soal ideal berada di rentang $-1.00$ s/d $+1.00$.
- **Daya Pembeda ($a$)**: Kemampuan soal membedakan kelompok siswa pintar dan kelompok siswa lemah. Soal yang baik memiliki $a \ge 0.30$. Nilai negatif menandakan soal menyesatkan.
- **Efisiensi Distraktor**: Persentase peserta yang memilih opsi pengecoh A, B, C, D, dan E. Distraktor efektif jika dipilih minimal 5% peserta kelompok bawah.

### Fitur "Drop Question" (Anulir Butir Soal):
Jika pengawas atau pembuat kurikulum menemukan butir soal yang cacat logika, kunci ganda, atau memiliki daya pembeda negatif ($a < 0$):
1. Cari butir soal tersebut pada tabel analisis.
2. Klik tombol **Anulir Soal (Drop Question)**.
3. Masukkan alasan pembatalan.
4. Sistem akan secara otomatis mengabaikan soal tersebut dari perhitungan dan mereevaluasi skor total seluruh siswa seketika, **tanpa menghapus soal dari Bank Soal induk** untuk keperluan audit kurikulum.

---

## 3. Papan Peringkat & Hasil Ujian (Scoreboard)

Menu: **Monitor** $\rightarrow$ **Assessment Results** (`admin://view/monitor-assessment-results`)

- Menampilkan peringkat nasional dan peringkat per cabang.
- Menampilkan perbandingan *Raw Score* (skor mentah) dan *Scaled Score* (skala UTBK 0 - 1000 atau CAT BKN).
- Fitur ekspor data instan ke format CSV untuk arsip berita acara ujian resmi.
