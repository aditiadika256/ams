# Panduan Setup Lokal (Tanpa Docker)

Dokumen ini menjelaskan langkah-langkah untuk menjalankan project Arkanin v1 secara lokal tanpa menggunakan Docker.

## Prasyarat

Pastikan software berikut sudah terinstall di komputer Anda:

1.  **Git** (untuk clone repository)
2.  **PHP** (versi 8.2 atau lebih baru)
3.  **Composer** (Package manager untuk PHP)
4.  **Node.js** (versi 20 atau lebih baru) & **NPM**
5.  **PostgreSQL** (Database server)

## 1. Clone Repository

Buka terminal dan jalankan perintah berikut untuk mengunduh source code project:

```bash
git clone https://github.com/aditiadika256/ams.git
cd ams
```

*(Catatan: Sesuaikan URL repository jika berbeda)*

## 2. Setup Backend (Laravel API)

Backend terletak di folder `apps/api`.

### Langkah-langkah:

1.  Masuk ke direktori backend:
    ```bash
    cd apps/api
    ```

2.  Duplikasi file konfigurasi environment:
    ```bash
    cp .env.example .env
    ```
    *(Di Windows Powershell: `copy .env.example .env`)*

3.  Install dependensi PHP menggunakan Composer:
    ```bash
    composer install
    ```

4.  Generate application key:
    ```bash
    php artisan key:generate
    ```

5.  **Konfigurasi Database**:
    *   Buat database baru di PostgreSQL (misalnya: `edutech`).
    *   Buka file `.env` dan sesuaikan konfigurasi database Anda:
        ```ini
        DB_CONNECTION=pgsql
        DB_HOST=127.0.0.1
        DB_PORT=5432
        DB_DATABASE=edutech
        DB_USERNAME=postgres
        DB_PASSWORD=password_anda
        ```

6.  Jalankan migrasi database dan seeder (untuk mengisi data awal):
    ```bash
    php artisan migrate --seed
    ```

7.  (Opsional) Install dependensi frontend untuk API (jika diperlukan):
    ```bash
    npm install
    npm run build
    ```

8.  Jalankan server development Laravel:
    ```bash
    php artisan serve
    ```
    API akan berjalan di `http://localhost:8000`.

## 3. Setup Frontend (Next.js Web)

Frontend terletak di folder `apps/web`.

### Langkah-langkah:

1.  Buka terminal baru (biarkan terminal API tetap berjalan).

2.  Masuk ke direktori frontend:
    ```bash
    cd apps/web
    ```

3.  Duplikasi file konfigurasi environment:
    ```bash
    cp .env.example .env
    ```
    *(Di Windows Powershell: `copy .env.example .env`)*

4.  **Konfigurasi Environment**:
    Buka file `.env` di folder `apps/web` dan pastikan `NEXT_PUBLIC_API_URL` mengarah ke URL root backend (tanpa path `/api/v1` karena kode akan menambahkannya secara otomatis):
    ```ini
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

5.  Install dependensi Node.js:
    ```bash
    npm install
    ```

6.  Jalankan server development Next.js:
    ```bash
    npm run dev
    ```
    Aplikasi web akan berjalan di `http://localhost:3000`.

## 4. Akses Aplikasi

Setelah kedua server (Backend dan Frontend) berjalan, Anda dapat mengakses aplikasi melalui browser:

*   **Aplikasi Web**: [http://localhost:3000](http://localhost:3000)
*   **API Endpoint**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
*   **API Documentation (Swagger)**: [http://localhost:8000/api/documentation](http://localhost:8000/api/documentation) (Jika tersedia)

## Troubleshooting

*   **Database Error**: Pastikan service PostgreSQL sudah berjalan dan kredensial di `.env` sudah benar.
*   **Permission Error**: Pada Linux/Mac, pastikan folder `storage` dan `bootstrap/cache` di `apps/api` memiliki izin tulis (`chmod -R 775 storage bootstrap/cache`).
*   **Missing Dependencies**: Jika terjadi error terkait class atau package yang tidak ditemukan, coba jalankan `composer install` atau `npm install` lagi.
*   **API Connection Error**: Pastikan backend berjalan di port 8000. Jika berjalan di port lain, sesuaikan `NEXT_PUBLIC_API_URL` di frontend.
