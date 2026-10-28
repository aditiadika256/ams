# User Guide: Panduan Pengelolaan Role, Permission & Menu Admin

Panduan operasional bagi Super Admin, Direktur, dan Administrator Sistem dalam mengelola pohon menu navigasi serta matriks perizinan pengguna pada Arkanin Management System (AMS).

---

## 1. Konsep Dasar Hak Akses AMS

1. **Role (Peran)**: Jabatan atau fungsi kerja pengguna dalam organisasi (misal: *Super Admin, Direktur, Manajer Cabang, Admin Keuangan, Admin Akademik, Proctor, Mentor Utama*).
2. **Permission (Hak Izin)**: Izin spesifik untuk melakukan aksi tertentu (misal: `program.publish`, `assessment-question.create`, `finance-withdrawal.approve`).
3. **Menu (Navigasi)**: Antarmuka yang tampil pada sidebar atau topbar. Setiap menu dapat dibatasi dengan satu atau beberapa permission tertentu.

---

## 2. Mekanisme Otomatis saat Pembuatan Menu

Sebagai Super Admin, Anda memiliki kebebasan penuh merancang menu baru di halaman **System > Menu Management**:
- **Tidak Perlu Khawatir Terkunci**: Setiap kali Anda membuat menu baru dan menentukan `Required Permission` (misal: `custom-analytics.view`), sistem backend AMS **secara otomatis**:
  1. Mendaftarkan izin tersebut ke dalam master data permission.
  2. Memberikan hak akses izin tersebut langsung ke akun **Super Admin** dan **Direktur**.
  3. Menyegarkan cache sistem sehingga menu langsung tampil dan dapat diakses seketika tanpa perlu restart server.
- **Dukungan Multi-Permission**: Jika Anda ingin sebuah menu dapat dilihat oleh pemegang izin A atau izin B, cukup ketikkan dengan pemisah garis tegak `|`, contoh:
  ```
  finance-transaction.view|view_finance_analytics
  ```

---

## 3. Langkah Mengatur Matriks Perizinan Role

1. Masuk ke panel **Personal > Role Permission** (`admin://view/roles`).
2. Pilih role yang ingin disesuaikan (misal: *Admin Keuangan* atau *Manajer Cabang*).
3. Centang atau hilangkan centang pada izin per fitur yang diinginkan:
   - **Dashboard**: Akses ringkasan ekosistem global, cabang, keuangan, atau akademik.
   - **Master Assessment**: Hak membuat wacana stimulus dan bank soal CBT.
   - **Workspace**: Hak membuat, mengedit, dan mempublikasikan program belajar.
   - **Monitor**: Hak mengakses live proctoring, pause/resume ujian, dan analisis butir IRT.
   - **Finance**: Hak menyetujui penarikan saldo mentor (*Hold Balance to Released*) dan kelola invoice.
4. Klik tombol **Simpan Perubahan**. Perubahan hak akses langsung berlaku efektif pada sesi pengguna yang bersangkutan.

---

## 4. Akun Bawaan Sistem (Demo & Standar)

Sistem menyediakan akun awal terstandarisasi untuk kebutuhan pengujian:

| Akun Peran | Email | Kata Sandi Standar | Cakupan Akses |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@arkanin.com` | `password` | Akses penuh 100% ke seluruh fitur dan pengaturan sistem |
| **Direktur** | `direktur@arkanin.com` | `password` | Akses penuh tingkat eksekutif |
| **Manajer Cabang** | `manajer.jkt@arkanin.com` | `password` | Khusus operasional, jadwal, dan siswa di Cabang Jakarta |
| **Admin Keuangan** | `finance@arkanin.com` | `password` | Transaksi, invoice, approval penarikan saldo, dan cicilan |
| **Admin Akademik** | `akademik@arkanin.com` | `password` | Bank soal, stimulus wacana, blueprint ujian, dan silabus |
| **Pengawas (Proctor)**| `proctor@arkanin.com` | `password` | Live proctoring CBT, generate token, dan kontrol ujian |
