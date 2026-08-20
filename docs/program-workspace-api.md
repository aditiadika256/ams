# Program Workspace API

Kontrak ini adalah satu-satunya kontrak aktif setelah cutover big-bang. Semua URL berada di bawah `/api/v1`; endpoint user dan admin memakai Sanctum kecuali katalog dan payment webhook.

## Katalog dan administrasi

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/programs` | Katalog `PUBLISHED` yang aman untuk publik |
| `GET` | `/programs/{slug-or-id}` | Detail katalog publik |
| `GET/POST` | `/admin/programs` | Daftar dan membuat draft Program |
| `GET/PUT/DELETE` | `/admin/programs/{program}` | Detail, update, atau hapus draft |
| `POST` | `/admin/programs/{program}/{publish|unpublish|archive|restore}` | Lifecycle Program dengan `reason` |
| `PUT` | `/admin/programs/{program}/tags` | Sinkronisasi `tag_ids` dengan audit reason |
| `PUT` | `/admin/programs/{program}/components` | Sinkronisasi komponen dan konfigurasi |
| `PUT` | `/admin/programs/{program}/relations` | Sinkronisasi child collection |
| `GET/POST` | `/admin/programs/{program}/batches` | Daftar atau membuat Batch |
| `PUT/DELETE` | `/admin/programs/{program}/batches/{batch}` | Update atau hapus Batch draft |
| `GET/POST` | `/admin/programs/{program}/batches/{batch}/sessions` | Daftar atau membuat Session |
| `PUT/DELETE` | `/admin/programs/{program}/batches/{batch}/sessions/{session}` | Update atau hapus Session draft |

Field uang menggunakan decimal string (`"799000.00"`), bukan float. Program menggunakan `status`, `visibility`, tags, components, relations, Batch, dan Session; field level/type lama ditolak.

Permission granular: `program.view`, `program.create`, `program.update`, `program.publish`, `program.archive`, `program.clone`, `program-tag.manage`, `program-component.manage`, `program-batch.manage`, `program-session.manage`, dan `mentor-assignment.manage`.

## Acquisition dan Order

- `POST /orders` menerima snapshot item `{id, batch_id?, quantity: 1}`. `payment_reference` dibuat server.
- `POST /payments/webhook` memverifikasi SHA-512, nominal, status provider, dan retry idempotent sebelum menerbitkan access.
- `POST /access/free-enrollments` hanya untuk Program published dengan harga nol.
- `POST /access/redeem-voucher` dan `/access/redeem-enrollment-code` memerlukan `code` dan `idempotency_key`.
- `POST /admin/program-accesses/grant` serta endpoint lifecycle access memerlukan permission dan audit reason.

Semua acquisition menggunakan grant service yang sama. `ProgramAccess.grant_key` adalah final idempotency guard. Order paid tanpa ProgramAccess bukan entitlement.

## Personal Workspace

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/workspace` | Projection access instance milik user; filter, sort, dan pagination |
| `GET` | `/workspace/accesses/{access}` | Detail enrollment dan komponen yang boleh digunakan |
| `POST` | `/workspace/accesses/{access}/archive` | Sembunyikan kartu tanpa mengubah entitlement |
| `POST` | `/workspace/accesses/{access}/restore` | Pulihkan kartu |
| `GET` | `/workspace/accesses/{access}/curriculum` | Materi terbit bila component `material` aktif |
| `GET` | `/exams/packages?program_access_id={access}` | Paket assessment untuk enrollment tersebut |
| `POST` | `/exams/start` | Mulai/resume ujian dengan `package_id` dan `program_access_id` |

Status access: `WAITING`, `ACTIVE`, `COMPLETED`, `EXPIRED`, `SUSPENDED`, dan `REVOKED`. Hanya access efektif pada user yang sama, periode valid, parent collection valid, dan component tersedia yang dapat membuka layanan.

## Error dan audit

Domain conflict menggunakan HTTP `409` dengan `success`, `message`, machine-readable `code`, dan `context`. Grant dan transition menulis `access_events` append-only dalam transaksi yang sama, termasuk actor snapshot, reason, before/after, dan correlation ID. Log webhook hanya menyimpan field allowlist dan tidak menyimpan signature atau secret.

## Cutover development dan verifikasi

```bash
docker compose -p ams_program_workspace -f ops/docker-compose.yml exec api php artisan migrate:fresh --seed
docker compose -p ams_program_workspace -f ops/docker-compose.yml exec api composer test
docker compose -p ams_program_workspace -f ops/docker-compose.yml run --rm --no-deps web npm run test:program-contract
docker compose -p ams_program_workspace -f ops/docker-compose.yml run --rm --no-deps web npm run build
```

Concurrency/row-lock test wajib memakai database PostgreSQL test khusus, bukan SQLite memory. `migrate:fresh --seed` bersifat destruktif dan hanya boleh diarahkan ke database development/test yang dapat dibuat ulang.
