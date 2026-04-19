# Ops / Development runbook

This document explains how to run and troubleshoot the development stack for the Edutech monorepo. It assumes you are working on Windows or Linux and have Docker & Docker Compose installed.

Paths & important files
- `ops/docker-compose.yml` - main compose file which builds the `api` image (includes pdo_pgsql). Use this file to run the stack.
- `apps/api/Dockerfile` - PHP image used for the API. Builds with required extensions (pdo_pgsql, mbstring, etc).
- `ops/nginx` - nginx reverse-proxy configuration used in the development compose.

Why use Docker for development
- Ensures consistent PHP extensions (pdo_pgsql) and avoids host-specific issues.
- Keeps database/redis/minio services reproducible for every contributor.

Prerequisites
- Docker Desktop (Windows) or Docker Engine + Compose (Linux/macOS)
- Optional: nvm for Node development, Composer & PHP only required if you plan to run artisan on host

Common commands (PowerShell on Windows)
- Start dev stack (build images):
  cd .\ops; docker compose up -d --build

- Stop stack:
  cd .\ops; docker compose down

- View container logs:
  cd .\ops; docker compose logs -f

- Run artisan in the API container (migrations, seeders, cache clear):
  cd .\ops; docker compose exec api php artisan migrate --force
  cd .\ops; docker compose exec api php artisan db:seed --class=DatabaseSeeder --force
  cd .\ops; docker compose exec api php artisan route:list

- Install/update PHP dependencies (run inside container to avoid host extension issues):
  cd .\ops; docker compose exec api composer install

- Install/update Node dependencies for frontend (from repo root or apps/web):
  cd .\apps\web; npm install
  # or use nvm to pin node version for local dev

- Run frontend dev server (locally inside container or on host):
  cd .\apps\web; npm run dev

- Running tests (backend)
  cd .\ops; docker compose exec api php artisan test

Troubleshooting
- php artisan migrate fails with "could not find driver":
  - Ensure you run migrations inside the `api` container. The host PHP may not have pdo_pgsql installed.
  - `cd .\ops; docker compose exec api php -m | Select-String pgsql` should show `pdo_pgsql`.

- Composer network timeouts or curl 28 errors:
  - Retry the command; check Docker Desktop or system network.
  - If using Windows WSL2, ensure WSL has network and DNS correctly configured.

- Tailwind / PostCSS errors in the frontend (`The PostCSS plugin has moved`):
  - Ensure `postcss.config.cjs` exists (repo uses ESM package.json). Install `@tailwindcss/postcss` as dev dependency.

Production notes & next steps
- Remove `unsafe-inline` from CSP before shipping to staging/production.
- Configure secrets via Docker secrets or environment variable manager in CI/CD.
- Add CI workflow for `phpunit` & `vitest` and a `docker compose --profile ci` for ephemeral test runs.

If you hit anything not covered here, paste error output and I'll help diagnose further.