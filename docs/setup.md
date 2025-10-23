# Setup Guide untuk Developer Baru

Panduan ini menjelaskan langkah-langkah setup project Edutech Platform untuk developer baru. Ikuti langkah-langkah berikut dengan urutan yang tepat.

## Table of Contents
- [Prasyarat](#prasyarat)
- [Initial Setup](#initial-setup)
- [Docker Setup](#docker-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Verifikasi](#verifikasi)
- [Perintah Development](#perintah-development)
- [Troubleshooting](#troubleshooting)

## Prasyarat

Software yang harus diinstall:

1. **Wajib**:
   - Git (latest version)
   - Docker Desktop
   - Visual Studio Code

2. **Opsional** (jika ingin development di host):
   - Node.js v20+ (rekomendasi: gunakan nvm)
   - PHP 8.3+
   - Composer 2.6+

3. **VS Code Extensions** (rekomendasi):
   - Laravel Extension Pack
   - Docker
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - PHP Intelephense

## Initial Setup

1. Clone repository dan checkout main branch:
```bash
# Clone repo
git clone https://github.com/aditiadika256/ams.git
cd ams

# Checkout dan pull main branch
git checkout main
git pull origin main
```

2. Setup environment files:
```bash
# Backend .env
cd apps/api
cp .env.example .env

# Frontend .env
cd ../web
cp .env.example .env

# Kembali ke root
cd ../../
```

3. Sesuaikan konfigurasi di file `.env`:

Backend (`apps/api/.env`):
```ini
APP_NAME=EduTech
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=edutech
DB_USERNAME=edutech_user
DB_PASSWORD=secretpassword

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost

AWS_ACCESS_KEY_ID=minio
AWS_SECRET_ACCESS_KEY=minio123
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=edutech
AWS_ENDPOINT=http://minio:9000
AWS_URL=http://localhost:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

Frontend (`apps/web/.env`):
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Docker Setup

1. Build dan jalankan container:
```bash
cd ops
docker compose up -d --build
```

2. Verifikasi container berjalan:
```bash
docker compose ps
```

Pastikan semua container status-nya "Up":
- edutech_api
- edutech_web 
- edutech_nginx
- postgres
- redis
- adminer
- minio

## Backend Setup

1. Install dependencies dan setup Laravel:
```bash
# Masuk ke container API
docker compose exec api bash

# Di dalam container:
composer install
php artisan key:generate
php artisan migrate --force
php artisan db:seed
php artisan storage:link
exit
```

2. Verifikasi instalasi backend:
```bash
docker compose exec api php artisan --version
```

## Frontend Setup

1. Install dependencies Next.js:
```bash
# Masuk ke container Web
docker compose exec web bash

# Di dalam container:
npm install
exit
```

2. Development server akan auto-start di port 3000

## Verifikasi

Cek service berikut di browser:

1. **Laravel API**: http://localhost:8000
   - Seharusnya muncul halaman Laravel
   - Test endpoint: http://localhost:8000/api/v1/ping

2. **Next.js Frontend**: http://localhost:3000
   - Seharusnya muncul halaman Next.js

3. **Adminer (Database UI)**: http://localhost:8080
   - System: PostgreSQL
   - Server: postgres  
   - Username: edutech_user
   - Password: secretpassword
   - Database: edutech

4. **Minio Console**: http://localhost:9000
   - Username: minio
   - Password: minio123

## Perintah Development

### Container Management
```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Restart specific container
docker compose restart [container_name]

# View logs
docker compose logs -f
```

### Backend Commands
```bash
# Artisan commands
docker compose exec api php artisan [command]

# Contoh commands umum:
docker compose exec api php artisan migrate
docker compose exec api php artisan db:seed
docker compose exec api php artisan route:list
docker compose exec api php artisan cache:clear
```

### Frontend Commands
```bash
# NPM commands
docker compose exec web npm [command]

# Contoh commands umum:
docker compose exec web npm run dev
docker compose exec web npm run build
docker compose exec web npm run lint
```

## Troubleshooting

### 1. Database Connection Issues
```bash
# Restart database
docker compose restart postgres

# Clear config cache
docker compose exec api php artisan config:clear

# Cek koneksi
docker compose exec api php artisan migrate:status
```

### 2. Permission Issues
```bash
# Fix storage permissions
docker compose exec api chown -R www-data:www-data storage bootstrap/cache
```

### 3. Node_modules Issues
```bash
# Rebuild node_modules
docker compose exec web rm -rf node_modules .next
docker compose exec web npm install
```

### 4. Composer Issues
```bash
# Clear composer cache
docker compose exec api composer clear-cache

# Reinstall dependencies
docker compose exec api composer install --no-cache
```

## Development Workflow

1. **Selalu pull latest main**:
```bash
git checkout main
git pull origin main
```

2. **Buat feature branch**:
```bash
git checkout -b feature/nama-fitur
```

3. **Setup environment**:
- Copy `.env.example` ke `.env` (jika belum)
- Jalankan container: `docker compose up -d`
- Install dependencies dan migrate database

4. **Development loop**:
- Coding di local
- Test di container
- Commit changes
- Push branch dan buat PR

## Catatan Penting

1. **File Mapping**:
   - Folder `apps/api` di-mount ke container API
   - Folder `apps/web` di-mount ke container Web
   - Perubahan code langsung ter-reflect (hot reload)

2. **Database**:
   - Data persistent di Docker volume
   - Backup dilakukan otomatis setiap hari
   - Gunakan Adminer untuk mengecek/edit database

3. **Security**:
   - Jangan commit file `.env`
   - Jangan expose port selain yang didefinisikan di docker-compose
   - Gunakan strong password di production

4. **Resources**:
   - Dokumentasi API: `/docs/api`
   - Architecture decisions: `/docs/adr`
   - Operational guide: `/docs/ops`

## Pertanyaan & Bantuan

Jika ada masalah atau pertanyaan:
1. Cek `docs/troubleshooting.md`
2. Review logs container terkait
3. Tanyakan di group development