# Edutech Platform

Monorepo untuk platform bimbel & tryout berbasis Laravel API + Next.js.

## Struktur
- `/apps/api` : Backend Laravel 11
- `/apps/web` : Frontend Next.js 14
- `/packages/ui` : Komponen UI shared
- `/docs` : Dokumentasi, ADR, ERD, API Spec
- `/ops` : Docker, nginx, CI/CD

Ikuti instruksi di `/docs/quickstart.md` untuk desain & high-level setup.

## Quickstart (development)

This repo is configured to run the full development stack with Docker Compose (recommended).

- Start the dev stack (from repository root):
	- Use the Compose files under `/ops` (they build the API image which includes required PHP extensions like pdo_pgsql).
- Run migrations & seeders inside the API container (recommended) so you don't depend on host PHP extensions.

For detailed operational steps, troubleshooting and common commands see: `docs/ops/README.md`.
