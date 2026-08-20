# AMS API

Laravel 11 API untuk katalog Program, administrasi Program modular, entitlement, dan Personal Workspace.

## Kontrak Program

- `ProgramAccess` adalah satu-satunya sumber kebenaran entitlement.
- Order menyimpan snapshot historis dan baru memberi akses setelah callback pembayaran tervalidasi.
- Pembayaran, voucher, enrollment code, program gratis, dan admin grant memakai grant service yang sama.
- Program lama berbasis `ProgramLevel`/`ProgramType` tidak memiliki endpoint kompatibilitas.
- Workspace selalu di-scope ke user terautentikasi dan berorientasi pada access instance/Batch.
- Curriculum serta CBT memerlukan `ProgramAccess` aktif dan component Program yang tersedia.

Semua endpoint berada di bawah `/api/v1`. Endpoint utama kontrak baru:

```text
GET  /api/v1/programs
GET  /api/v1/admin/programs
GET  /api/v1/workspace
GET  /api/v1/workspace/accesses/{access}
POST /api/v1/access/redeem-voucher
POST /api/v1/access/redeem-enrollment-code
POST /api/v1/admin/program-accesses/grant
```

## Setup development

Jalankan melalui Compose dari root repository:

```bash
docker compose -p ams_program_workspace -f ops/docker-compose.yml up -d
docker compose -p ams_program_workspace -f ops/docker-compose.yml exec api php artisan migrate:fresh --seed
```

`migrate:fresh --seed` hanya untuk database development/test pada cutover big-bang ini. Jangan arahkan perintah tersebut ke database yang perlu dipertahankan.

Payment callback memakai `PAYMENT_WEBHOOK_SECRET`. Signature dihitung dengan SHA-512 atas `order_id + status_code + gross_amount + secret`.

## Verification

Suite default memakai SQLite in-memory:

```bash
composer test
```

Race condition dan lock diverifikasi terpisah pada PostgreSQL yang sudah dimigrasikan:

```bash
DB_CONNECTION=pgsql DB_DATABASE=edutech_test php vendor/bin/pest tests/Postgres --compact
```

Gunakan database test khusus. SQLite tidak membuktikan perilaku `lockForUpdate()` atau constraint PostgreSQL.
