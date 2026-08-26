# Program Workspace Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengganti master Program lama berbasis level/type dengan domain Program modular, entitlement `ProgramAccess`, dan Personal Workspace end-to-end sesuai PRD big-bang.

**Architecture:** Laravel tetap menjadi API `/api/v1` dengan controller tipis, Form Request, Policy, JSON Resource, Eloquent relation/scope, serta Action/Service transactional untuk lifecycle dan grant. Next.js App Router memakai kontrak TypeScript baru, Zustand/API client yang sudah ada, Shadcn, Tailwind v4, Framer Motion, dan Lucide. `ProgramAccess` adalah satu-satunya sumber entitlement dan Workspace adalah projection, bukan tabel.

**Tech Stack:** PHP 8.3, Laravel 11, Eloquent, PostgreSQL 15, Sanctum, Spatie Permission, Pest 3/PHPUnit 11; Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/Radix, Zustand, Zod, Framer Motion, Lucide.

---

## Task 0: Stabilkan test harness worktree

**Files:**
- Modify: `apps/api/composer.json`
- Modify: `apps/api/composer.lock`
- Modify: `apps/api/phpunit.xml`
- Create: `apps/api/tests/Pest.php`
- Create: `apps/api/storage/framework/views/.gitignore`
- Create: `apps/api/storage/framework/cache/.gitignore`
- Create: `apps/api/storage/framework/sessions/.gitignore`

1. Jalankan suite dengan environment testing eksplisit dan catat kegagalan bootstrap.
2. Tambahkan Pest 3 yang kompatibel dengan Laravel 11/PHPUnit 11; pin Termwind/Symfony Console ke versi yang kompatibel.
3. Tambahkan bootstrap `tests/Pest.php` dan direktori runtime yang dibutuhkan.
4. Jalankan `composer test`; expected: baseline hijau atau hanya kegagalan legacy Program yang akan diganti pada Task 3.
5. Commit: `test: establish program refactor harness`.

## Task 1: Bangun schema domain final secara big-bang

**Files:**
- Create: `apps/api/tests/Feature/ProgramDomainSchemaTest.php`
- Modify: `apps/api/database/migrations/2025_10_29_000001_create_programs_table.php`
- Modify: `apps/api/database/migrations/2025_10_29_000002_create_orders_table.php`
- Modify: `apps/api/database/migrations/2025_10_29_000003_create_order_items_table.php`
- Modify: `apps/api/database/migrations/2025_12_20_155834_add_user_stamps_to_tables.php`
- Delete: `apps/api/database/migrations/2026_07_31_000001_create_program_levels_table.php`
- Delete: `apps/api/database/migrations/2026_07_31_000002_create_program_types_table.php`
- Delete: `apps/api/database/migrations/2026_07_31_000003_add_program_lookup_ids_to_programs_table.php`
- Delete: `apps/api/database/migrations/2026_07_31_000004_seed_and_backfill_program_lookups.php`
- Delete: `apps/api/database/migrations/2026_07_31_000006_provision_program_master_release_data.php`
- Create: `apps/api/database/migrations/2026_08_20_000001_create_program_classification_tables.php`
- Create: `apps/api/database/migrations/2026_08_20_000002_create_program_delivery_tables.php`
- Create: `apps/api/database/migrations/2026_08_20_000003_create_program_access_tables.php`
- Create: `apps/api/database/migrations/2026_08_20_000004_create_access_code_tables.php`

1. Tulis failing schema test untuk semua tabel, FK, unique, index, decimal, dan ketiadaan tabel level/type.
2. Ganti `programs` dengan metadata, lifecycle, visibility, price decimal, completion rule, dan archive timestamps.
3. Tambahkan tag, component registry/pivot, collection relation, Batch, Session, mentor assignment, ProgramAccess, access event, voucher/enrollment code, dan redemption.
4. Perkuat snapshot OrderItem (nama/slug/batch/harga) serta unique payment reference.
5. Jalankan schema test pada SQLite dan `migrate:fresh --seed` pada PostgreSQL development compose.
6. Commit: `feat: replace program schema with modular domain`.

## Task 2: Bentuk Eloquent model, enum, factory, dan seed registry

**Files:**
- Create: `apps/api/tests/Feature/ProgramDomainModelTest.php`
- Create: `apps/api/app/Enums/{ProgramStatus,ProgramVisibility,BatchStatus,BatchMode,SessionStatus,SessionMode,AccessStatus,AccessSource,CodeType}.php`
- Modify: `apps/api/app/Models/Program.php`
- Create: `apps/api/app/Models/{Tag,ComponentDefinition,ProgramComponent,ProgramRelation,ProgramBatch,ProgramSession,SessionMentorAssignment,ProgramAccess,AccessEvent,AccessCode,AccessCodeRedemption}.php`
- Modify: `apps/api/app/Models/{User,Order,OrderItem,Mentor}.php`
- Create: `apps/api/database/factories/{ProgramFactory,TagFactory,ProgramBatchFactory,ProgramSessionFactory,ProgramAccessFactory,AccessCodeFactory}.php`
- Modify: `apps/api/database/seeders/{DatabaseSeeder,RolesSeeder,MenuSeeder,ProgramSeeder}.php`
- Create: `apps/api/database/seeders/{ComponentDefinitionSeeder,ProgramWorkspaceSeeder}.php`
- Delete: `apps/api/database/seeders/ProgramMasterSeeder.php`

1. Tulis failing tests untuk cast, default, scopes, relation, dan seed idempotency.
2. Implementasikan enum-backed casts, explicit fillable, typed relations, lifecycle scopes, dan `preventLazyLoading` non-production.
3. Seed 14 component registry, permission granular, menu baru, serta contoh Program/Batch/Access tanpa level/type.
4. Jalankan test model/seeder dan `migrate:fresh --seed` PostgreSQL.
5. Commit: `feat: model modular programs and access`.

## Task 3: Ganti kontrak katalog dan administrasi Program

**Files:**
- Create: `apps/api/tests/Feature/ProgramCatalogTest.php`
- Create: `apps/api/tests/Feature/AdminProgramManagementTest.php`
- Modify: `apps/api/app/Domain/Sales/ProgramController.php`
- Create: `apps/api/app/Domain/Admin/ProgramController.php`
- Modify: `apps/api/app/Http/Requests/Sales/ProgramIndexRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/{ProgramIndexRequest,ProgramStoreRequest,ProgramUpdateRequest,ProgramTransitionRequest}.php`
- Modify: `apps/api/app/Http/Resources/ProgramResource.php`
- Create: `apps/api/app/Http/Resources/AdminProgramResource.php`
- Create: `apps/api/app/Policies/ProgramPolicy.php`
- Create: `apps/api/app/Actions/Programs/{PublishProgram,ArchiveProgram,CloneProgram}.php`
- Modify: `apps/api/routes/api.php`
- Delete: legacy level/type controllers, requests, resources, models, and tests.

1. Tulis failing tests katalog safe projection, filter tag/component/harga, pagination, lifecycle, policy, clone, dan restricted delete.
2. Implementasikan public catalog hanya `PUBLISHED` + visibility yang valid dan admin API terpisah.
3. Implementasikan lifecycle actions dengan transition guard, cache versioning, dan audit perubahan kritis.
4. Hapus seluruh route dan class level/type.
5. Jalankan test katalog/admin dan scan referensi legacy backend.
6. Commit: `feat: replace program catalog and admin contract`.

## Task 4: Implementasikan Tag, Component, dan Collection

**Files:**
- Create: `apps/api/tests/Feature/ProgramCompositionTest.php`
- Create: `apps/api/app/Domain/Admin/{TagController,ProgramComponentController,ProgramRelationController}.php`
- Create: `apps/api/app/Http/Requests/Admin/{TagStoreRequest,TagUpdateRequest,ProgramComponentsUpdateRequest,ProgramRelationsUpdateRequest}.php`
- Create: `apps/api/app/Http/Resources/{TagResource,ComponentDefinitionResource,ProgramComponentResource}.php`
- Create: `apps/api/app/Actions/Programs/{SyncProgramComponents,SyncProgramRelations}.php`
- Create: `apps/api/app/Support/Components/ComponentConfigValidator.php`
- Modify: `apps/api/routes/api.php`

1. Tulis failing tests code tag immutable, dependency component, batas config JSON, duplicate child, self-reference, dan cycle graph.
2. Implementasikan master tag, read-only component registry, sync component tervalidasi, dan sync relation transactional.
3. Catat before/after dan correlation ID ke audit domain.
4. Jalankan test composition.
5. Commit: `feat: add program tags components and collections`.

## Task 5: Implementasikan Batch, Session, dan mentor assignment

**Files:**
- Create: `apps/api/tests/Feature/ProgramDeliveryTest.php`
- Create: `apps/api/app/Domain/Admin/{ProgramBatchController,ProgramSessionController,SessionMentorAssignmentController}.php`
- Create: `apps/api/app/Http/Requests/Admin/{ProgramBatchStoreRequest,ProgramBatchUpdateRequest,ProgramSessionStoreRequest,ProgramSessionUpdateRequest,MentorAssignmentRequest}.php`
- Create: `apps/api/app/Http/Resources/{ProgramBatchResource,ProgramSessionResource,SessionMentorAssignmentResource}.php`
- Create: `apps/api/app/Actions/Programs/{TransitionBatch,TransitionSession,AssignSessionMentor}.php`
- Modify: `apps/api/routes/api.php`

1. Tulis failing tests nested binding, periode/capacity/mode, transition invalid, reschedule audit, mentor aktif, conflict jadwal, dan active assignment unique.
2. Implementasikan CRUD/lifecycle menggunakan transaction dan row locks pada resource kapasitas.
3. Jalankan test delivery.
4. Commit: `feat: add batches sessions and mentor assignments`.

## Task 6: Jadikan Access Grant Service sumber entitlement tunggal

**Files:**
- Create: `apps/api/tests/Feature/ProgramAccessGrantTest.php`
- Create: `apps/api/tests/Feature/ProgramAccessPolicyTest.php`
- Create: `apps/api/app/Actions/Access/{GrantProgramAccess,TransitionProgramAccess,GrantCollectionAccesses}.php`
- Create: `apps/api/app/Data/AccessGrantData.php`
- Create: `apps/api/app/Exceptions/{DomainConflictException,InvalidStateTransitionException}.php`
- Create: `apps/api/app/Policies/ProgramAccessPolicy.php`
- Create: `apps/api/app/Support/Access/ComponentAccessGate.php`
- Modify: `apps/api/bootstrap/app.php`

1. Tulis failing tests grant-key idempotency/conflict, collection child dedupe, repeat Batch, ownership, period/status, direct component authorization, serta append-only events.
2. Implementasikan grant transactional dengan unique constraint sebagai final guard dan derived key deterministik.
3. Implementasikan activate/extend/suspend/restore/revoke beserta reason dan before/after audit.
4. Tambahkan machine-readable domain error API.
5. Jalankan test grant/policy.
6. Commit: `feat: centralize program entitlement grants`.

## Task 7: Hubungkan payment, free enrollment, code, dan admin grant

**Files:**
- Create: `apps/api/tests/Feature/ProgramAcquisitionTest.php`
- Modify: `apps/api/app/Domain/Sales/{OrderController,PaymentWebhookController}.php`
- Create: `apps/api/app/Domain/Access/{FreeEnrollmentController,CodeRedemptionController}.php`
- Create: `apps/api/app/Domain/Admin/ProgramAccessController.php`
- Create: `apps/api/app/Http/Requests/Access/{PaymentWebhookRequest,CodeRedemptionRequest,FreeEnrollmentRequest}.php`
- Create: `apps/api/app/Http/Requests/Admin/{ProgramAccessGrantRequest,ProgramAccessTransitionRequest}.php`
- Create: `apps/api/app/Actions/Access/{ConfirmPaidOrder,RedeemAccessCode}.php`
- Modify: `apps/api/config/services.php`
- Modify: `apps/api/routes/api.php`

1. Tulis failing tests signature invalid, duplicate callback, paid snapshot, failed payment tanpa grant, last quota race semantics, free enrollment, dan admin reason/permission.
2. Implementasikan signature allowlist logging, Order row lock, snapshot immutable, dan semua acquisition melalui grant action.
3. Implementasikan voucher/enrollment code atomic redemption dan admin lifecycle.
4. Jalankan feature test SQLite serta PostgreSQL integration test untuk lock/unique.
5. Commit: `feat: route acquisitions through access grants`.

## Task 8: Implementasikan Workspace projection dan API

**Files:**
- Create: `apps/api/tests/Feature/WorkspaceTest.php`
- Create: `apps/api/tests/Feature/WorkspaceQueryCountTest.php`
- Create: `apps/api/app/Domain/Workspace/WorkspaceController.php`
- Create: `apps/api/app/Http/Requests/WorkspaceIndexRequest.php`
- Create: `apps/api/app/Http/Resources/{WorkspaceAccessResource,WorkspaceAccessDetailResource}.php`
- Create: `apps/api/app/Queries/WorkspaceQuery.php`
- Modify: `apps/api/routes/api.php`

1. Tulis failing tests own-access only, access instance grouping, filter/search/sort/pagination, next Session, archive/restore tanpa status change, active component projection, dan query-count ceiling.
2. Implementasikan constrained eager loading, subquery next Session, counts/progress aggregate, safe detail, dan policy archive/restore.
3. Jalankan Workspace feature/policy/query test.
4. Commit: `feat: expose personal program workspace`.

## Task 9: Cutover backend dan bersihkan legacy

**Files:**
- Modify: dependent curriculum/CBT/analytics/schedule models and controllers only where ProgramAccess is required.
- Delete: remaining `ProgramLevel`/`ProgramType` active code and tests.
- Create: `apps/api/tests/Feature/ProgramWorkspaceSmokeTest.php`
- Create: `apps/api/tests/Postgres/ProgramAccessConcurrencyTest.php`
- Modify: `apps/api/README.md`

1. Tulis failing smoke tests bahwa paid Order saja bukan entitlement dan component direct URL memerlukan access.
2. Pindahkan guard dependent modules ke `ProgramAccess`/component policy minimum.
3. Scan PHP/route/seeder/OpenAPI untuk level/type dan hapus kontrak aktif.
4. Jalankan seluruh Pest SQLite dan suite concurrency PostgreSQL terpisah.
5. Commit: `refactor: cut over backend to program access`.

## Task 10: Ganti kontrak frontend dan Admin Program

**Files:**
- Modify: `apps/web/src/types/sales.ts`
- Delete: `apps/web/src/types/program-master.ts`
- Modify: `apps/web/src/store/useSalesStore.ts`
- Delete: `apps/web/src/store/useProgramLookupStore.ts`
- Modify: `apps/web/src/components/admin/views/Programs/{view,form}.tsx`
- Create: `apps/web/src/components/admin/views/Programs/{ProgramBasicsStep,ProgramTagsStep,ProgramComponentsStep,ProgramCollectionStep,ProgramBatchesStep,ProgramReviewStep}.tsx`
- Create: `apps/web/src/components/admin/views/Tags/view.tsx`
- Delete: ProgramLevels/ProgramTypes views.
- Modify: admin layout/menu files.

1. Tambahkan typecheck fixture/contract test yang gagal untuk kontrak baru.
2. Implementasikan store dan types tanpa field level/type.
3. Implementasikan halaman management dengan tombol tambah kanan atas dan dialog Shadcn enam langkah sesuai `UI-style.md`; static zinc/slate, satu accent, no gradient/glass.
4. Tambahkan Tag, component configuration, collection, Batch, dan Session management dengan label/focus/error accessible.
5. Jalankan `npm run build` dan responsive browser smoke 375/768/1024/1440.
6. Commit: `feat: rebuild program administration UI`.

## Task 11: Bangun Personal Workspace dan perbarui flow user

**Files:**
- Create: `apps/web/src/app/workspace/page.tsx`
- Create: `apps/web/src/app/workspace/accesses/[id]/page.tsx`
- Create: `apps/web/src/components/workspace/{WorkspaceHeader,WorkspaceFilters,WorkspaceAccessCard,WorkspaceAgenda,WorkspaceEmptyState,WorkspaceErrorState,WorkspaceDetailTabs,RedeemCodeDialog}.tsx`
- Create: `apps/web/src/store/useWorkspaceStore.ts`
- Create: `apps/web/src/types/workspace.ts`
- Modify: `apps/web/src/app/dashboard/page.tsx`
- Modify: `apps/web/src/components/dashboard/StudentDashboard.tsx`
- Modify: `apps/web/src/app/programs/{page.tsx,[id]/page.tsx}`
- Modify: `apps/web/src/app/checkout/page.tsx`
- Modify: `apps/web/src/components/programs/ProgramCard.tsx`
- Modify: `apps/web/src/components/layout/{BottomNavigation,TopBar,MainLayout}.tsx`

1. Buat failing contract/type assertions untuk Workspace response dan action archive/restore/redeem.
2. Implementasikan projection UI per access instance dengan status + teks/icon, CTA kondisional, next Session, progress, dan archive group.
3. Implementasikan detail tabs hanya dari component aktif, agenda, empty/error/stale-data retry, dan redeem code.
4. Redirect landing login user ke Workspace; katalog/detail/checkout memakai tag/component/Batch dan free acquisition backend.
5. Terapkan tap/page/list motion halus dengan `prefers-reduced-motion`, touch target minimal 44px, keyboard/focus, dark mode, serta bottom-nav inset.
6. Jalankan build dan smoke responsive/accessibility.
7. Commit: `feat: make workspace the student experience`.

## Task 12: Dokumentasi, scan, dan verifikasi akhir

**Files:**
- Modify: `docs/plans/2026-08-20-PRD-refactor-programs-workspace.md` only for implementation status if needed.
- Create: `docs/program-workspace-api.md`
- Modify: root/application onboarding documentation.

1. Jalankan scan case-insensitive seluruh source aktif untuk ProgramLevel/ProgramType dan field legacy; expected: zero, selain catatan histori PRD/migration plan.
2. Jalankan `migrate:fresh --seed` PostgreSQL, seluruh Pest SQLite, PostgreSQL concurrency suite, Pint, frontend build/typecheck, dan lint yang tersedia.
3. Smoke katalog, checkout, admin, Workspace, archive/restore, dan duplicate webhook.
4. Review code/security/UI terhadap PRD dan `UI-style.md`; perbaiki setiap temuan melalui failing regression test.
5. Dokumentasikan endpoint, permission, state transition, environment test, dan cutover development.
6. Commit: `docs: document program workspace cutover`.
