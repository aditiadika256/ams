# Panduan Pengguna: Inventaris Ruang Fisik (Schedule Tool)
# Arkanin Management System (AMS)

Modul **Physical Rooms** digunakan oleh Administrator Cabang dan Tim Operasional untuk mengelola ruangan kelas tatap muka, kapasitas kursi belajar, serta fasilitas pendukung di setiap cabang Arkanin.

---

## 1. Menambahkan Ruangan Kelas Baru

Menu: **Schedule Tool** $\rightarrow$ **Physical Room** (`admin://view/schedule-physical-room`)

1. Klik tombol **+ Tambah Ruangan Baru**.
2. Pilih **Kantor Cabang** lokasi ruangan berada.
3. Masukkan **Nomor / Kode Ruang** (misal: *R.201* atau *Lab-CBT*). Nomor ruangan tidak boleh kembar di cabang yang sama.
4. Masukkan **Nama Ruang** (misal: *Ruang Teori Galileo*).
5. Masukkan **Kapasitas Kursi** (misal: *35 Siswa*).
6. Centang fasilitas yang tersedia di ruangan: *AC*, *Projector*, *Whiteboard*, *Sound System*, *WiFi*, *CCTV*.
7. Klik **Simpan Ruangan**.

---

## 2. Pemantauan & Pencegahan Jadwal Bentrok

- Saat admin program membuat jadwal sesi bertipe *Offline*, sistem akan mewajibkan pemilihan ruangan fisik dari cabang terkait.
- Jika kapasitas siswa melebihi kuota ruangan, sistem akan memberikan peringatan kapasitas.
- Ruangan yang sedang terpakai pada rentang jam yang sama tidak dapat dipilih untuk sesi kelas lain (*Double Booking Prevention*).
