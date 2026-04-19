# Deployment Guide

Panduan ini menjelaskan cara men-deploy monorepo Edutech (Laravel API + Next.js) secara bertahap, mulai dari demo gratis hingga produksi berbayar dengan Docker Compose di VPS, sesuai blueprint di `blueprint.md`.

## Table of Contents
- [Ringkasan Arsitektur](#ringkasan-arsitektur)
- [Prinsip Deployment](#prinsip-deployment)
- [Stage 0: Lokal via Docker Compose](#stage-0-lokal-via-docker-compose)
- [Stage 1: Demo Gratis / Low Cost](#stage-1-demo-gratis--low-cost)
- [Stage 2: VPS Tunggal (Staging/Produksi Awal)](#stage-2-vps-tunggal-stagingproduksi-awal)
- [Stage 3: CI/CD dan Container Registry](#stage-3-cicd-dan-container-registry)
- [Stage 4: Scale Up dan Managed Services](#stage-4-scale-up-dan-managed-services)
- [Catatan node_modules dan Docker](#catatan-node_modules-dan-docker)
- [Checklist Environment Production](#checklist-environment-production)

## Ringkasan Arsitektur

Secara garis besar, deployment mengikuti pola modular-monolith dengan Docker:

- Laravel API (`apps/api`) berjalan sebagai service `api`
- Next.js Web (`apps/web`) berjalan sebagai service `web`
- `postgres` sebagai database utama
- `redis` untuk cache dan queue
- `minio` sebagai object storage kompatibel S3 (opsional)
- `nginx` sebagai reverse proxy di depan `api` dan `web`

Semua komponen ini sudah didefinisikan di `ops/docker-compose.yml`.

## Prinsip Deployment

- Satu repo untuk seluruh stack (monorepo)
- Lingkungan lokal, staging, dan produksi sebisa mungkin mirip (Docker Compose)
- Rahasia (`APP_KEY`, password DB, API key payment) selalu via `.env`, bukan hardcode
- Mulai sederhana (VPS tunggal), lalu bisa dipecah ke microservices bila beban naik

## Stage 0: Lokal via Docker Compose

Tujuan stage ini adalah development di mesin lokal, bukan untuk publik, tapi penting karena pola deployment di VPS hampir sama.

- Lokasi konfigurasi utama: `ops/docker-compose.yml`
- Ikuti panduan detail di `docs/setup.md` dan `docs/ops/README.md`

Perintah dasar dari root repo:

```bash
cd ops
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose down
```

Setelah stack berjalan:

- API Laravel: `http://localhost:8000`
- Next.js web: `http://localhost:3000`
- Adminer DB: `http://localhost:8080`
- Minio: `http://localhost:9000`

Stage ini memastikan aplikasi benar-benar jalan sebelum dipindah ke server.

## Stage 1: Demo Gratis / Low Cost

Stage ini cocok untuk:

- Demo ke stakeholder
- Landing page marketing
- Proof of Concept tanpa komit biaya besar

Karena blueprint menargetkan Docker dan service lengkap (API + CBT + pembayaran), biasanya layanan gratis penuh akan terbatas. Strategi yang realistis:

1. Deploy frontend saja (Next.js) di layanan gratis
   - Contoh: layanan hosting statis atau SSR gratis/low cost
   - Build Next.js:
     ```bash
     cd apps/web
     npm install
     npm run build
     ```
   - Deploy hasil build ke platform pilihan
   - API bisa sementara diarahkan ke environment lokal atau staging kecil

2. Backend Laravel + DB di environment kecil/bersama
   - Contoh: shared hosting yang mendukung Laravel, atau free tier PaaS kecil
   - Fitur CBT dan pembayaran bisa dibatasi (tidak full traffic produksi)

Keterbatasan stage ini:

- Tidak ideal untuk trafik besar
- Queue dan Redis mungkin belum aktif penuh
- Monitoring dan logging masih minimal

Gunakan stage ini hanya untuk demo ringan, bukan transaksi penting.

Contoh provider dan tools:

- Frontend Next.js
  - Vercel (gratis/low cost, support Next.js bawaan)
  - Netlify (Static/SSR dengan adaptor Next.js)
  - Render (static site atau web service kecil)
- Backend Laravel dan database
  - Render, Railway, Fly.io, Koyeb (web service + Postgres free/low tier)
  - Shared hosting yang mendukung PHP 8.3+ dan PostgreSQL atau MySQL
- Tools pendukung
  - GitHub/GitLab untuk repository
  - GitHub Actions sederhana untuk build Next.js sebelum deploy manual

## Stage 2: VPS Tunggal (Staging/Produksi Awal)

Ini adalah rekomendasi utama untuk staging dan produksi awal, selaras dengan blueprint bagian “CI/CD & Deployment (VPS / Docker Compose)”.

### 1. Siapkan VPS

- Provider bebas (contoh: VPS 2–4 vCPU, 4–8 GB RAM)
- Install:
  - Docker
  - Docker Compose
  - Git

### 2. Clone repo di VPS

```bash
ssh user@server-ip
git clone <url-repo> edutech
cd edutech
```

### 3. Siapkan environment production

- Copy dan sesuaikan file `.env`:
  - `apps/api/.env` untuk Laravel
  - `apps/web/.env` untuk Next.js
- Sesuaikan nilai:
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `DB_*` mengarah ke service `postgres` di Docker
  - `REDIS_*` mengarah ke service `redis`
  - `SANCTUM_STATEFUL_DOMAINS` menggunakan domain produksi web
  - `NEXT_PUBLIC_API_URL` mengarah ke domain API di belakang nginx

### 4. Jalankan stack dengan Docker Compose

```bash
cd ops
docker compose up -d --build
docker compose ps
```

Pastikan semua container statusnya `Up`:

- `edutech_api`
- `edutech_web`
- `edutech_nginx`
- `postgres`
- `redis`
- `minio`

### 5. Inisialisasi Laravel di VPS

```bash
cd ops
docker compose exec api composer install --no-dev --optimize-autoloader
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --force
docker compose exec api php artisan db:seed --force
docker compose exec api php artisan storage:link
docker compose exec api php artisan config:cache
docker compose exec api php artisan route:cache
```

### 6. Build Next.js untuk produksi

Idealnya, ada flow build khusus produksi. Pola sederhananya:

```bash
cd apps/web
npm install
npm run build
```

Lalu jalankan dengan `npm run start` atau gunakan Docker image yang menjalankan Next.js dalam mode production. Untuk tahap awal, pola dev server di `docker-compose.yml` bisa tetap dipakai, lalu dioptimalkan di tahap berikutnya.

### 7. Arahkan domain ke VPS

- Konfigurasi DNS `A` record ke IP VPS
- Pastikan konfigurasi nginx di `ops/nginx/*.conf` sesuai domain
- Tambahkan TLS/HTTPS (contoh dengan reverse proxy lain atau menambahkan certbot di VPS)

Contoh provider dan tools:

- VPS
  - Hetzner, DigitalOcean, Vultr, Linode, atau provider lokal (IDC, dsb.)
  - OS umum: Ubuntu Server LTS
- Reverse proxy dan TLS
  - nginx (sudah dipakai di `ops/nginx`)
  - Caddy atau Traefik (opsional, jika ingin auto HTTPS)
- Manajemen deployment
  - Git + SSH untuk pull langsung ke server
  - Docker dan Docker Compose (sudah dipakai repo ini)
  - Watchtower atau script sederhana untuk auto-reload container (opsional)

## Stage 3: CI/CD dan Container Registry

Setelah staging/produksi awal stabil, langkah berikutnya adalah mengotomasi build dan deployment.

Target:

- Setiap push ke branch `main`:
  - Menjalankan lint dan test
  - Build Docker image untuk `api` dan `web`
  - Push image ke container registry
  - Deploy ke VPS

Langkah umum:

1. Buat container registry
   - Bisa memakai registry bawaan Git provider atau layanan registry lain

2. Tambah workflow CI (misal GitHub Actions)
   - Step:
     - Checkout repo
     - Install dependency minimal (jika perlu)
     - Jalankan test backend (`php artisan test`) dan frontend (`npm run test` atau `npm run lint`)
     - Build Docker image dan push ke registry

3. Tambah step deploy
   - SSH ke VPS
   - Pull image terbaru
   - Jalankan `docker compose up -d` dengan image tag terbaru
   - Jalankan `php artisan migrate --force` di dalam container API

Dengan pola ini, developer tidak perlu SSH manual setiap kali rilis.

Contoh provider dan tools:

- CI/CD
  - GitHub Actions
  - GitLab CI/CD
  - Bitbucket Pipelines
- Container registry
  - GitHub Container Registry
  - GitLab Container Registry
  - Docker Hub
  - Registry privat dari cloud provider (ECR, GCR, ACR)

## Stage 4: Scale Up dan Managed Services

Jika beban mulai tinggi atau tim membesar, infrastruktur bisa di-scale:

- Pindahkan database ke layanan PostgreSQL terkelola
- Pindahkan file storage ke S3/Wasabi
- Jalankan queue worker (Horizon) sebagai service terpisah
- Pisahkan layanan `api`, `web`, dan `queue` ke beberapa server atau cluster
- Tambahkan monitoring dan alerting untuk:
  - Error aplikasi (Sentry, dsb.)
  - Kesehatan queue dan job gagal
  - Penggunaan CPU, RAM, dan disk

Blueprint juga membuka opsi memecah domain tertentu (misalnya Payments atau CBT) menjadi service sendiri di tahap ini.

Contoh provider dan tools di tahap ini:

- Infrastruktur
  - AWS: EC2 atau ECS/Fargate untuk container, RDS PostgreSQL, ElastiCache (Redis), S3 untuk storage
  - GCP: Compute Engine atau Cloud Run/GKE, Cloud SQL PostgreSQL, Memorystore (Redis), Cloud Storage
  - Azure: Virtual Machines atau AKS, Azure Database for PostgreSQL, Azure Cache for Redis, Blob Storage
- Observability dan monitoring
  - APM/logging: Sentry, New Relic, Datadog, atau Elastic Stack (ELK/EFK)
  - Metrics: Prometheus + Grafana, atau Cloud-native monitoring dari provider
- Delivery dan konfigurasi
  - GitHub Actions / GitLab CI untuk build & deploy
  - Terraform / Pulumi / Ansible untuk provisioning infrastruktur

## Catatan node_modules dan Docker

Folder `node_modules` di monorepo akan sangat besar karena:

- Setiap aplikasi memiliki dependency sendiri (`apps/web`, paket shared, tools build)
- Banyak library frontend dan build tool (Next.js, Tailwind, ESLint, Vitest, dsb.)
- Termasuk dev dependencies yang hanya dipakai saat development dan build

Terkait deployment:

- Untuk Docker:
  - Image `web` menggunakan base image Node dan menjalankan `npm install` di dalam container
  - Dalam `ops/docker-compose.yml`, source code di-mount ke container, sehingga `node_modules` di dalam container dapat berbeda dari di host
- Untuk server tanpa Docker:
  - Pada saat deploy, server akan menjalankan `npm install` lagi di environment server
  - `node_modules` di laptop tidak dikirim begitu saja ke server

Implikasi:

- Ukuran `node_modules` besar di lokal tidak otomatis membebani server produksi
- Yang perlu diperhatikan adalah:
  - Gunakan `.dockerignore` agar `node_modules` lokal tidak ikut saat build image
  - Pisahkan dev dependencies dan gunakan flag produksi (`--production`) bila perlu

Singkatnya, besar kecilnya `node_modules` lokal lebih berpengaruh ke ruang disk di laptop dan kecepatan install, bukan langsung ke beban di server produksi.

## Checklist Environment Production

Gunakan checklist singkat ini sebelum go-live:

- Konfigurasi
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `APP_KEY` sudah di-set dan aman
  - `DB_*` mengarah ke database produksi
  - `REDIS_*` mengarah ke Redis produksi
  - `SANCTUM_STATEFUL_DOMAINS` sesuai domain web
  - `NEXT_PUBLIC_API_URL` sesuai domain API
- Keamanan
  - HTTPS aktif
  - Tidak ada credential rahasia di repo
  - Rate limiting aktif untuk endpoint sensitif (login, payment, CBT)
  - Backup database terjadwal
- Operasional
  - Monitoring error dan log
  - Proses update jelas (CI/CD atau SOP manual)
  - Dokumentasi deployment diupdate jika ada perubahan signifikan

Dengan panduan ini, alur dari development lokal hingga produksi di VPS menjadi jelas dan konsisten dengan blueprint arsitektur project.

