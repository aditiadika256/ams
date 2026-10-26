# Panduan Pengguna: Pemeliharaan Database (Database Manager)
# Arkanin Management System (AMS)

Modul **Database Manager** dirancang khusus untuk Super Administrator dan Tim DevOps guna memantau kesehatan tabel basis data, membersihkan cache sistem, dan memicu snapshot darurat dari antarmuka web.

---

## 1. Memeriksa Kesehatan Tabel

Menu: **Database** $\rightarrow$ **Data Manager** (`admin://view/database-manager`)

- Menampilkan daftar tabel utama sistem (Users, Programs, Questions, Exam Responses, Wallets).
- Menampilkan jumlah record aktif terkini.
- Memantau latensi koneksi ke server PostgreSQL Aiven Cloud.

---

## 2. Menjalankan Aksi Pemeliharaan Rutin

1. **Bersihkan Cache Kadaluwarsa (*Clear Cache*)**:
   - Membuang sisa cache token, kuota, atau query Redis yang sudah usang agar performa kueri kembali segar.
2. **Re-indeks Riwayat Transaksi (*Reindex Transactions*)**:
   - Menata ulang indeks B-Tree pada tabel transaksi buku besar keuangan untuk mempercepat pencarian filter tanggal.
3. **Optimasi Analisis Kueri (*Vacuum Analyze*)**:
   - Memperbarui statistik perencana kueri PostgreSQL agar eksekusi JOIN tetap optimal.
4. **Buat Snapshot Cadangan (*Backup Snapshot*)**:
   - Merekam titik penanda cadangan data sebelum perubahan besar sistem dilakukan.
