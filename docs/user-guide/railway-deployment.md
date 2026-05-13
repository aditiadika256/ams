# Railway Deployment — User Guide

Panduan singkat untuk men-deploy **Arkanin API (Laravel)** ke Railway.

## Prasyarat

- Akun [Railway.app](https://railway.app)
- Repository GitHub yang berisi project Arkanin
- Database PostgreSQL (bisa dari Supabase, Neon, atau Railway Add-on)

## Langkah Deployment

### 1. Buat Project Baru di Railway

1. Buka [Railway Dashboard](https://railway.app/dashboard)
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repository Arkanin

### 2. Konfigurasi Root Directory

Karena project ini adalah **monorepo**, Railway perlu tahu folder mana yang menjadi source code API:

1. Buka **Settings** pada service yang terbuat
2. Set **Root Directory** ke: `/apps/api`

### 3. Konfigurasi Environment Variables

Masuk ke tab **Variables** dan tambahkan:

| Variable | Contoh Value | Keterangan |
|---|---|---|
| `APP_ENV` | `production` | Mode production |
| `APP_DEBUG` | `false` | Nonaktifkan debug |
| `APP_KEY` | `base64:xxx...` | Generate dengan `php artisan key:generate --show` |
| `APP_URL` | `https://<domain>.up.railway.app` | URL Railway |
| `DB_CONNECTION` | `pgsql` | PostgreSQL |
| `DB_HOST` | `<host-database>` | Dari provider database |
| `DB_PORT` | `5432` | Port default PostgreSQL |
| `DB_DATABASE` | `postgres` | Nama database |
| `DB_USERNAME` | `postgres` | Username database |
| `DB_PASSWORD` | `<password>` | Password database |
| `SANCTUM_STATEFUL_DOMAINS` | `arkanin.vercel.app` | Domain frontend (tanpa https://) |

### 4. Deploy

Klik **Deploy**. Railway akan:
1. Membaca `railpack.json` → mendeteksi sebagai project **PHP**
2. Menjalankan `composer install`
3. Memulai server menggunakan **FrankenPHP**

### 5. Verifikasi

Setelah deploy berhasil, akses URL Railway yang diberikan dan pastikan:
- Endpoint `/api/v1` merespons dengan benar
- Swagger docs bisa diakses di `/api/documentation`

## Troubleshooting

### Build Error: "Error creating build plan with Railpack"

**Penyebab:** Railway mendeteksi Node.js dari `package.json` (Vite) alih-alih PHP dari `composer.json`.

**Solusi:** Pastikan file `apps/api/railpack.json` ada dengan konten:
```json
{
    "$schema": "https://schema.railpack.com",
    "provider": "php"
}
```

### PHP Extensions Tidak Tersedia

Tambahkan environment variable di Railway:
```
RAILPACK_PHP_EXTENSIONS=gd,redis,imagick
```

### Migrasi Database Gagal Saat Build

Database Railway menggunakan URL internal yang tidak tersedia saat proses build. Solusi:
1. Set `RAILPACK_SKIP_MIGRATIONS=true` di environment variables
2. Jalankan migrasi secara manual via Railway CLI atau shell

### CORS Error dari Frontend

Pastikan `SANCTUM_STATEFUL_DOMAINS` diset ke domain frontend yang benar (tanpa `https://` dan tanpa trailing `/`).
