# User Guide — Login dengan Google

Panduan ini menjelaskan cara login atau mendaftar menggunakan akun Google di platform Arkanin.

## Cara Login dengan Google

1. Buka halaman **Login** (`/auth/login`) atau **Register** (`/auth/register`).
2. Klik tombol **Google** di bawah form.
3. Anda akan diarahkan ke halaman pemilihan akun Google.
4. Pilih akun Google yang ingin digunakan.
5. Tunggu proses verifikasi — Anda akan melihat animasi loading.
6. Setelah berhasil, Anda akan otomatis diarahkan ke dashboard.

## Apa yang Terjadi Saat Login Google

- Jika Anda **belum pernah mendaftar**, sistem akan otomatis membuat akun baru dengan data dari Google (nama, email, foto profil).
- Jika Anda **sudah pernah mendaftar** dengan email yang sama, sistem akan langsung login ke akun yang ada.
- Role default untuk akun baru adalah **Student**.

## Status Halaman Callback

Setelah memilih akun Google, Anda akan melihat halaman callback dengan 3 kemungkinan status:

| Status | Tampilan | Keterangan |
|--------|----------|------------|
| **Memproses** | Ikon loading berputar | Sistem sedang memverifikasi akun Google Anda |
| **Berhasil** | Ikon centang hijau + pesan selamat datang | Login berhasil, mengalihkan ke dashboard |
| **Gagal** | Ikon X merah + pesan error | Ada masalah — klik "Kembali ke Login" untuk coba lagi |

## Troubleshooting

### Tombol Google tidak merespon
- Pastikan koneksi internet Anda stabil.
- Coba refresh halaman dan klik kembali.

### Muncul pesan "403 Access Denied" di halaman Google
- Akun Google Anda mungkin belum terdaftar sebagai test user (untuk environment development).
- Hubungi administrator untuk menambahkan email Anda.

### Muncul halaman error setelah memilih akun Google
- Klik tombol **Kembali ke Login** dan coba lagi.
- Jika masalah berlanjut, coba login menggunakan email dan password sebagai alternatif.

### Redirect loop atau halaman kosong
- Clear cache browser Anda.
- Pastikan cookies pada browser diaktifkan.
