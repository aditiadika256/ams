Dokumen ini adalah blueprint praktis agar project bisa dimulai oleh 1 orang lalu mudah didelegasikan ke developer berikutnya tanpa bongkar ulang. Fokus: modular-monolith (bisa dipecah ke microservices nanti), API-first, dan developer experience yang rapi.

0) Tujuan & Prinsip
Mulai solo-friendly: satu repo, setup mudah, dokumentasi jelas.
Modular-monolith: per fitur sebagai domain/module terpisah (bisa diekstrak jadi service).
API-first: Next.js konsumsi API; mobile app bisa reuse.
Security & RBAC: role-based (superadmin, admin, trainer, siswa, finance), audit log.
Scalable: Redis cache & queue, Postgres, struktur siap horizontal split.
1) Strategi Repo & Struktur Direktori
Monorepo (1 repo) agar solo dev mudah; tetap terstruktur agar delegasi gampang.

Catatan: Bila tim bertambah, /packages bisa diisi lib shared (utils, ESLint configs, tsconfig, dll).

2) Domain/Module (Back-end Laravel)
Gunakan feature-by-domain di dalam Laravel: setiap domain punya Controllers, Models, Actions, Policies, Requests, Resources, Routes.

Package utama yang direkomendasikan

spatie/laravel-permission (RBAC)
laravel/sanctum (API token / SPA auth)
laravel/scout (opsional untuk search)
barryvdh/laravel-debugbar (dev only)
laravel/horizon (queue monitoring, bila pakai Redis queue)
Konvensi

Controller tipis → panggil Action (mis. CreateOrderAction, StartExamAction).
Validasi di Form Request; mapping response via API Resource.
Logika domain di Domain Services/Actions.
Semua endpoint lewat /api/v1/ (versi di route).
3) Struktur Front-end (Next.js 14)
Frontend libs

Tailwind CSS + shadcn/ui (komponen)
TanStack Query (data fetching cache)
Zod + React Hook Form (validasi form)
Chart.js/Recharts (grafik)
Next SEO (SEO)
Polanya

Semua call ke API melalui api client (/lib/api.ts) dengan interceptor (token, error-handling).
Gunakan Server Components untuk halaman marketing (SEO) dan Client Components untuk portal interaktif.
4) Skema Data (Ringkas per Domain)
Gunakan PostgreSQL. Nama tabel pakai snake_case; FK ditandai _id.

Auth & Users
users(id, name, email, phone, password_hash, status, last_login_at)
roles(id, name) dan model_has_roles, permissions, role_has_permissions (spatie)
user_profiles(user_id, avatar_url, school_level[sd|smp|sma|cpns], city)
audit_logs(id, user_id, action, entity, entity_id, payload, created_at)
CMS
posts(id, title, slug, content, status[draft|published], author_id, published_at)
pages(id, title, slug, content, status, published_at)
media(id, path, mime, size, meta)
Sales
programs(id, name, level, type[tryout|bimbel], price, active)
program_bundles(id, name, price) & bundle_items(bundle_id, program_id)
orders(id, user_id, status[pending|paid|expired|failed], total, snap_token, payment_provider, created_at)
order_items(id, order_id, program_id, price)
coupons(id, code, type[percent|fixed], value, expires_at, max_uses)
Finance
Minimum: transactions(id, user_id|null, type[income|expense], category, amount, ref, occurred_at, meta)
(Opsional simple-ledger): ledgers(id, name), entries(id, ledger_id, debit, credit, ref_type, ref_id)
invoices(id, order_id, number, status, issued_at, due_at)
Trainer
trainers(id, user_id, bio, rating)
schedules(id, trainer_id, title, start_at, end_at, mode[online|offline], link|location)
curricula(id, name, level, description)
curriculum_items(id, curriculum_id, title, type[video|pdf|quiz|assignment], order_no, resource_url)
CBT
question_banks(id, name, level, subject, difficulty_range)
questions(id, bank_id, type[mcq|multi|essay], stem, options(jsonb), answer_key(jsonb), difficulty)
exam_packages(id, name, level, duration_minutes, randomize, show_result_mode[immediate|after])
exam_sections(id, package_id, subject, num_questions, bank_id, difficulty_mix(jsonb))
exam_sessions(id, package_id, user_id, status[scheduled|ongoing|finished|expired], start_at, end_at)
exam_attempts(id, session_id, started_at, submitted_at, score_total, meta)
exam_answers(id, attempt_id, question_id, answer(jsonb), is_correct, score)
proctor_events(id, attempt_id, type[focus_blur|screenshot|suspicious], meta, created_at)
Indexing & Perf

Index FK, created_at, dan kolom pencarian (email, slug, code, etc).
Gunakan jsonb untuk opsi jawaban/metadata fleksibel.
5) API Design & Versioning
Base URL: /api/v1
Auth: Sanctum (SPA token) atau Personal Access Token untuk integrasi.
Konvensi response: { data, meta, error }.
Contoh endpoints:
Auth/Users

POST /auth/login, POST /auth/logout, POST /auth/register
GET /me → profile + roles/permissions
Sales/Payments

GET /programs (filter level=sd|smp|sma|cpns)
POST /orders → buat order + dapatkan payment token (Midtrans/Xendit)
POST /payments/callback → webhook update status order
CBT

POST /exams/{package_id}/start → buat session/attempt + lock
GET /exams/attempts/{id} → pertanyaan (batasi: kirim per-batch/paging)
POST /exams/attempts/{id}/answers → autosave
POST /exams/attempts/{id}/submit → hitung skor, finalize
GET /exams/results/{id} → hasil & analitik
Admin

GET /admin/finance/reports?from=&to=
POST /admin/cms/posts, PUT /admin/cms/posts/{id}, PATCH /admin/users/{id}/roles
Anti-cheat minimal

Frontend kirim focus/blur events → POST /exams/attempts/{id}/events (rate-limited)
6) Autentikasi, Otorisasi, Keamanan
Sanctum untuk SPA auth; token disimpan via HttpOnly cookie.
RBAC via spatie/laravel-permission: roles superadmin, admin, trainer, siswa, finance.
Policies untuk akses resource (contoh: hanya pemilik attempt yang bisa melihat hasilnya).
Rate limiting untuk endpoint sensitif (login, answers autosave).
Audit log setiap aksi penting (ubah nilai, tambah soal, ubah skor manual, refund).
Validation ketat di Form Request + Zod di frontend.
7) Caching, Queue, & Observability
Redis: cache query berat (program list, paket ujian), session/queue.
Queue (Redis/Database): email, generate sertifikat, rekalkulasi skor besar, laporan.
Log: channel terpisah untuk payments, cbt.
Monitoring: Laravel Horizon (queue), Telescope (dev), Health Check endpoint.
8) Testing Strategy
Backend: Pest/PHPUnit → unit (Actions/Services), feature (Endpoints), policy tests.
Frontend: Vitest + Testing Library untuk komponen; Playwright untuk e2e alur CBT & checkout.
Seed data: factories + seeders untuk demo (users/roles, paket ujian, bank soal contoh).
9) Workflow Developer
Issue-first di GitHub/GitLab dengan label domain/CBT, domain/Finance, dsb.

Trunk-based

branch: feature/<domain>-<desc>
PR kecil, code review dengan checklist (test, docs, types, lint).
Commit lint (conventional commits): feat(cbt): add answer autosave.

Docs: tulis ADR (Architecture Decision Record) di /docs/adr/ per keputusan penting.

10) CI/CD & Deployment (VPS / Docker Compose)
Docker Compose (solo dev & staging)

Containers:

api: php-fpm + Laravel
queue: worker Horizon
web: Next.js (Node)
nginx: reverse proxy untuk api dan web
postgres, redis
minio (opsional) untuk object storage lokal (S3 compatible)
GitHub Actions (ringkas)

Lint & test (backend+frontend)
Build images → push ke registry
SSH deploy (pull image, php artisan migrate --force, cache clear, Horizon restart)
Env minimal

API .env: DB creds, REDIS, SANCTUM_STATEFUL_DOMAINS, PAYMENT_KEYS, FILESYSTEM_DISK=s3
WEB .env: NEXT_PUBLIC_API_URL, NEXTAUTH_URL (jika pakai next-auth), analytics key
11) Konvensi Kode & Tooling
Backend

PHP 8.3+
Static analysis: Larastan (phpstan), PHP CS Fixer
Folder Actions mengikuti pattern: App\Actions\<Domain>\<Verb><Noun>Action
Frontend

TypeScript strict
ESLint + Prettier + Husky (pre-commit) + lint-staged
TanStack Query untuk server state; Zustand untuk UI state ringan
12) UX Spesifik Fitur CBT (Best Practices)
Timer di server (kebenaran waktu) + sinkronisasi ke client per 15-30 detik.
Autosave jawaban per 3–10 detik atau onChange (debounce) → endpoint khusus.
Randomization: urutan soal & opsi, per section; simpan seed di attempt.
Blocking: satu attempt aktif per user per paket; lock concurrency.
Rekalkulasi skor: job async; simpan breakdown skor per section.
Anti-cheat level ringan**: event focus/blur, deteksi multi-tab (heartbeat), peringatan & log.
Analytics: waktu per soal, subject mastery, rekomendasi belajar.
13) Roadmap Implementasi (Solo → Tim)
Minggu 1–2 (MVP Fundamentals)

Setup monorepo, Docker, CI minimal
Auth + RBAC (users, roles), CMS pages sederhana
Programs & Orders (tanpa gateway dulu), CBT skeleton (bank soal, paket, attempt start)
Minggu 3–4 (Core CBT & Sales)

Autosave answers, submit & scoring MCQ
Payment gateway (Midtrans/Xendit) + webhook
Dashboard admin (order list, user list), trainer basic (jadwal)
Minggu 5–6 (Finance & Analytics)

Transaksi & laporan range tanggal, export CSV/PDF
Analytics hasil ujian & rekomendasi belajar
Hardening keamanan, rate limit, audit log
Delegasi ke tim

Backend dev: domain CBT & Finance
Frontend dev: Portal siswa (CBT UI) & Admin UI
QA: test e2e Playwright + seed test data
14) Contoh Kontrak API (Ringkas)
Start Attempt

POST /api/v1/exams/{package_id}/start
Res: { data: { attempt_id, ends_at, sections: [{id, subject, total_questions}] } }
Fetch Questions (paging)

GET /api/v1/exams/attempts/{id}/questions?section_id=&page=&limit=
Res: { data: [{question_id, type, stem, options:[...] }], meta:{ page, total } }
Autosave Answer

POST /api/v1/exams/attempts/{id}/answers
Req: { question_id, answer }
Res: { data: { saved: true, at: "2025-08-14T10:00:00Z" } }
Submit

POST /api/v1/exams/attempts/{id}/submit
Res: { data: { score_total, breakdown: {...} } }
15) Dokumentasi & Onboarding
/docs/ berisi: Quickstart, Arsitektur, Styleguide, API Spec (OpenAPI), ERD.
Script make dev (atau npm run dev:all) jalankan semuanya lokal via compose.
Checklist PR: lint, tests, update docs, demo URL.
16) Siap Dipecah ke Microservices (Nanti)
Pisahkan Payments dan CBT lebih dulu bila load tinggi.
Introduce message bus (Kafka/RabbitMQ) untuk events (OrderPaid, AttemptSubmitted).
Tarik domain jadi service terpisah; web tetap konsumsi via API Gateway.
Lampiran A: Sample Folder Detail Domain (Laravel)
Lampiran B: Checklist Keamanan Minimum
HTTPS wajib, HSTS, secure cookie, CSRF untuk panel admin
Input validation dua sisi (backend FormRequest, frontend Zod)
Limit upload ukuran & mime; simpan di S3/Wasabi; private ACL untuk bahan ujian
Rate limit login & autosave; IP throttling untuk callback payment
Rotasi kunci rahasia; gunakan .env.example
Penutup
Blueprint ini cukup untuk mulai coding sendirian, namun siap dibagi per domain saat tim bertambah. Jika perlu, kita bisa lanjut bikin OpenAPI spec (YAML) awal + template kode (skafolding) untuk Laravel & Next.js mengikuti struktur di atas.