# Quickstart

## Prasyarat
- Docker & Docker Compose
- Node.js (Next.js)
- PHP 8.3+ (Laravel)

## Langkah Awal
1. Clone repo ini
2. Copy `.env.example` ke `.env` di `/apps/api` dan `/apps/web`
3. Jalankan `docker compose up --build` dari folder `/ops`
4. Akses Laravel API di `localhost:8000`, Next.js web di `localhost:3000`

## Struktur Monorepo
- `/apps/api` : Backend Laravel 11
- `/apps/web` : Frontend Next.js 14
- `/packages/ui` : Komponen UI shared
- `/docs` : Dokumentasi, ADR, ERD, API Spec
- `/ops` : Docker, nginx, CI/CD

## Dokumentasi Lanjut
- Lihat `/docs/` untuk arsitektur, ADR, ERD, API Spec
- Ikuti SOP di `/docs/` untuk workflow developer
