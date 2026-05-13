# Deployment Guide: Option B (Monorepo with Vercel & PaaS)

Panduan ini ditujukan bagi developer yang ingin melakukan *deployment* project **Arkanin** (Monorepo: Laravel + Next.js) dalam 1 repository yang sama dengan menggunakan layanan pihak ketiga yang mudah dikelola (PaaS) tanpa pusing memikirkan setup Docker manual di VPS.

Kita akan menggunakan **Vercel** untuk Frontend (Next.js) dan layanan seperti **Railway / Render** untuk Backend (Laravel API).

---

## 🏗️ 1. Persiapan Database (Gratis & Terkelola)
Sebelum backend menyala, kita butuh database terpisah (karena PaaS seperti Vercel tidak menyediakan database langsung yang gratis seperti di server lokal).

- **Opsi Provider DB:** [Supabase](https://supabase.com), [Neon.tech](https://neon.tech), atau [Aiven](https://aiven.io) (Opsi PostgreSQL gratis).
- **Aksi:**
  1. Buat project baru pada salah satu platform tersebut.
  2. Dapatkan kredensial databasenya (*Host, Port, Database Name, Username, Password*).
  3. Simpan parameter ini untuk di-*inject* ke Environment variabel Backend.

---

## ⚙️ 2. Deployment API Backend (Laravel) via Railway / Render
Karena repo kita adalah *Monorepo*, tools PaaS modern harus diberitahu folder (Root Directory) mana yang menjadi letak source code Laravel. Dalam hal ini adalah `apps/api`.

### Menggunakan Railway.app (Sangat Direkomendasikan untuk Laravel)
1. Pergi ke **Railway.app** -> *New Project* -> *Deploy from GitHub repo*.
2. Pilih repo project Arkanin.
3. Setelah service terbentuk (mungkin di awal akan *failed*), masuk ke pengaturan service tersebut -> **Settings**.
4. Cari bagian **Root Directory**, ubah valuenya menjadi: `/apps/api`.

> [!IMPORTANT]
> **Railpack Provider Detection (Monorepo)**
> Karena `apps/api` memiliki `package.json` (untuk Vite asset bundling) **dan** `composer.json`, Railpack bisa salah mendeteksi project ini sebagai Node.js alih-alih PHP. File `railpack.json` sudah ditambahkan di `apps/api/` untuk memaksa deteksi provider PHP:
> ```json
> {
>     "$schema": "https://schema.railpack.com",
>     "provider": "php"
> }
> ```
> Railpack akan otomatis menggunakan **FrankenPHP** sebagai web server dan menjalankan `composer install` saat build.
>
> **Catatan:** File `Dockerfile` di `apps/api/` sudah di-rename menjadi `Dockerfile.dev` agar Railway tidak menggunakannya. Railway akan memprioritaskan Dockerfile jika ada, padahal Dockerfile tersebut hanya untuk development lokal (tanpa `COPY` source code). Docker Compose lokal sudah diupdate untuk mereferensikan `Dockerfile.dev`.

> [!TIP]
> **Environment Variables Railway yang Berguna:**
> - `RAILPACK_PHP_EXTENSIONS` — Ekstensi PHP tambahan (contoh: `gd,redis,imagick`)
> - `RAILPACK_SKIP_MIGRATIONS` — Set `true` jika ingin menjalankan migrasi secara manual
> - `RAILPACK_PHP_ROOT_DIR` — Override document root (default: `/app/public`)

5. Masuk ke tab **Variables**, lalu masukkan `.env` production-mu:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY="base64:xxx..." (generate yang baru)
   APP_URL=https://<domain-railway-kamu>.up.railway.app
   
   # Konfigurasi Database dari Tahap 1
   DB_CONNECTION=pgsql
   DB_HOST=<dari_supabase_atau_neon>
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USERNAME=postgres
   DB_PASSWORD=<password_kamu>

   # Konfigurasi Sanctum / Auth
   SANCTUM_STATEFUL_DOMAINS=<domain-vercel-frontend-nanti.vercel.app>
   SESSION_DOMAIN=.<domain-railway-kamu>.up.railway.app

   # Google OAuth (Bila Ada)
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   GOOGLE_REDIRECT_URL=https://<domain-railway-kamu>.up.railway.app/api/v1/auth/google/callback
   ```
6. **Custom Command (Jika diperlukan):** Di bagian `Deploy -> Custom Start Command`, isi dengan:
   `php artisan migrate --force && php serve --host=0.0.0.0 --port=$PORT` (atau biarkan kosong jika Railway otomatis mendeteksi konfigurasi nginx/nixpacks-nya).
7. Klik **Deploy**. Salin dan catat alamat API URL yang dihasilkan.

---

## 🌐 3. Deployment Frontend (Next.js) via Vercel
Vercel sangat cocok dan asli dibuat untuk Next.js. Deploy Frontend di dalam project monorepo lewat Vercel sangatlah praktis.

1. Buka dashboard **Vercel** -> *Add New* -> *Project*.
2. Hubungkan ke repositori GitHub milikmu dan pilih repo Arkanin.
3. Pada halaman *Configure Project*:
   - Biarkan **Framework Preset** ke Next.js (secara default akan terdeteksi).
   - **PENTING!** Pada bagian **Root Directory**, klik Edit lalu pilih direktori: `apps/web`.
4. Buka bagian **Environment Variables** dan tambahkan dari konfigurasi lokalmu:
   ```env
   # Arahkan ke URL API Laravel dari Railway tadi
   NEXT_PUBLIC_API_URL=https://<domain-railway-kamu>.up.railway.app

   # URL frontend kamu yang akan terbentuk
   NEXT_PUBLIC_URL=https://<domain-vercel-sementara>.vercel.app
   ```
5. Klik **Deploy** dan Vercel akan mengeksekusi `npm ci` dan `npm run build` khusus dari scope `apps/web` saja.

---

## 🔒 4. Poin Kritis: Sambungan Autentikasi (CORS & Sanctum)
Karena *Frontend* dan *Backend* kamu kini berada di 2 domain yang berbeda sama sekali (Satu `.vercel.app` dan satu `.railway.app`), Laravel Sanctum wajib disesuaikan agar bisa "mempercayai" request dari Vercel.

**Di sisi Railway (Laravel Env):**
Pastikan variabel `SANCTUM_STATEFUL_DOMAINS` sama persis dengan domain Vercel yang di-_generate_ (tanpa `https://` atau trailing slash `/`).
Contoh: `SANCTUM_STATEFUL_DOMAINS=arkanin-frontend.vercel.app`

`CORS_ALLOWED_ORIGINS=https://arkanin-frontend.vercel.app`

**Di Sisi Google Cloud Platform:**
Perbarui setelan **Authorized JavaScript origins** di OAuth Consent Screen ke URL *Frontend Vercel*, dan perbarui **Authorized redirect URIs** menuju URL *Backend Railway* kamu.

---

## 🚦 Monitoring & Pemeliharaan
- Jika ada *update* dari github, Vercel dan Railway akan langsung membaca repo tersebut, lalu memisah eksekusi *build* *frontend* (oleh Vercel) dan *backend* (oleh Railway) secara otomatis.
- Jalankan pengecekan fitur login segera setelah semuanya online, pastikan _cookies_ autentikasi tersimpan sempurna.
