# Panduan Pengguna: Cicilan & Drip Payment Lock (Layer 3)
# Arkanin Management System (AMS)

Modul **Enrollment Manager & Installment Tracker** mengelola akses berjenjang siswa ke materi program berdasarkan status pelunasan skema cicilan (Down Payment / Termin).

---

## 1. Konsep Drip Payment Lock

Ketika calon siswa membeli program belajar berbayar tinggi dengan skema cicilan (misal 2x atau 3x):
1. **Termin 1 (Down Payment / DP)**: Siswa membayar DP $\rightarrow$ Akses program terbuka untuk Section / Modul tahap 1.
2. **Termin 2 / Pelunasan**: Jatuh tempo secara otomatis terhitung $X$ hari setelah pendaftaran (misal 30 hari).
3. **Penguncian Akses (Drip Lock)**:
   - Jika Termin 2 belum dilunasi hingga melewati tanggal jatuh tempo, modul lanjutan (Section 2 ke atas) otomatis berstatus terkunci (*LOCKED_OVERDUE*).
   - Sertifikat kelulusan tidak dapat diterbitkan (*Certificate Blocked*) hingga pembayaran berstatus lunas penuh (*FULL_PAID*).

---

## 2. Cara Mengelola Cicilan Siswa

Menu: **Workspace** $\rightarrow$ **Enrollment Manager** (`admin://view/enrollments`)

1. Pada daftar siswa terdaftar, tinjau kolom **Status Pembayaran**:
   - 🟢 **Lunas Penuh (Full Paid)**: Seluruh materi terbuka bebas.
   - 🟡 **Cicilan Aktif (Partial Active)**: Telah membayar DP, cicilan berikutnya belum jatuh tempo.
   - 🔴 **Terkunci / Jatuh Tempo (Overdue Locked)**: Melewati batas jatuh tempo tanpa pelunasan.
2. **Mencatat Pembayaran Manual Kasir**:
   - Klik tombol **Bayar Termin** pada baris siswa terkait.
   - Masukkan nominal pembayaran.
   - Sistem akan langsung membuka modul yang terkunci.
3. **Memberikan Toleransi (Manual Bypass)**:
   - Jika siswa meminta dispensasi khusus dengan persetujuan Kepala Cabang:
   - Klik tombol **Manual Bypass**.
   - Masukkan alasan dispensasi untuk pencatatan berita acara audit.
   - Akses section modul siswa akan dibuka seketika.
