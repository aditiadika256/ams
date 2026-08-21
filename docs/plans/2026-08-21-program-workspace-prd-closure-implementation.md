# Program Workspace PRD Closure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menutup requirement PRD Program/Workspace yang belum terpenuhi setelah core cutover.

**Architecture:** Laravel mempertahankan controller tipis dan Action transactional berbasis Eloquent/row lock. Progress dan notification memakai ledger idempotent, sedangkan Next.js hanya menampilkan capability yang dikirim API dan tetap mengikuti `docs/web/UI-style.md`.

**Tech Stack:** PHP 8.3, Laravel 11, PostgreSQL 15, PHPUnit/Pest runner yang ada, Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/Radix, Zustand, Lucide.

---

## Task 13: Tegakkan truthful component availability

**Files:**
- Modify: `apps/api/database/seeders/ComponentDefinitionSeeder.php`
- Modify: `apps/api/app/Actions/Programs/SyncProgramComponents.php`
- Modify: `apps/api/tests/Feature/ProgramCompositionTest.php`
- Modify: `apps/web/src/components/admin/views/Programs/ProgramComponentsStep.tsx`
- Modify: `apps/web/src/app/workspace/accesses/[accessId]/page.tsx`
- Modify: `apps/web/tests/program-contract.test.mjs`

1. Tulis test yang membuktikan component tanpa handler berstatus unavailable dan tidak dapat diaktifkan lewat API.
2. Jalankan test dan pastikan gagal karena registry saat ini menandai semua code available.
3. Seed availability allowlist dan tambahkan guard Action dengan domain error machine-readable.
4. Nonaktifkan pilihan unavailable di Admin dan jangan membuat CTA palsu di Workspace.
5. Jalankan test composition dan frontend contract sampai hijau.

## Task 14: Implementasikan progress, completion, dan certificate

**Files:**
- Modify: `apps/api/database/migrations/2026_08_20_000003_create_program_access_tables.php`
- Create: `apps/api/app/Models/ProgramAccessActivity.php`
- Create: `apps/api/app/Models/ProgramCertificate.php`
- Create: `apps/api/app/Actions/Access/RecordProgramActivity.php`
- Create: `apps/api/app/Actions/Access/CalculateProgramProgress.php`
- Create: `apps/api/app/Actions/Access/EvaluateProgramCompletion.php`
- Create: `apps/api/app/Support/Components/CompletionRuleValidator.php`
- Create: `apps/api/app/Domain/Workspace/WorkspaceActivityController.php`
- Modify: Program requests/resources, CBT submit, Workspace query/resources/routes
- Create: `apps/api/tests/Feature/ProgramProgressTest.php`

1. Tulis test untuk activity idempotent, material/assessment projection, invalid completion rule, automatic completion, dan certificate dedupe.
2. Jalankan test untuk melihat kegagalan schema/service yang diharapkan.
3. Tambahkan ledger/certificate schema, model relation, validator, calculator, evaluator, serta endpoint lesson completion.
4. Hubungkan assessment submit ke activity recorder dalam transaction yang sama.
5. Eager-load projection ke Workspace tanpa N+1 dan jalankan test progress/query-count.

## Task 15: Implementasikan mentor mode, reservation, dan participant scope

**Files:**
- Modify: `apps/api/database/migrations/2026_08_20_000002_create_program_delivery_tables.php`
- Create: `apps/api/app/Enums/MentorAssignmentMode.php`
- Create: `apps/api/app/Models/SessionMentorReservation.php`
- Create: `apps/api/app/Actions/Programs/ReserveSessionMentor.php`
- Create: Workspace mentor controller/request/resource dan mentor participant controller
- Modify: Session/assignment requests, resources, models, routes, and policies
- Modify: `apps/api/tests/Feature/ProgramDeliveryTest.php`
- Create: `apps/api/tests/Feature/MentorWorkspaceTest.php`

1. Tulis test mode validation, active assignment, slot capacity, idempotent selection, cross-user denial, dan mentor participant scope.
2. Jalankan test dan pastikan gagal sebelum schema/route tersedia.
3. Implementasikan schema serta Action row-locked dengan unique constraint sebagai guard race.
4. Implementasikan endpoint Workspace selection dan mentor participant projection dengan selected columns.
5. Jalankan test delivery/policy dan tambahkan probe PostgreSQL untuk final slot race.

## Task 16: Propagasikan Session reschedule after commit

**Files:**
- Modify: delivery migration untuk inbox update
- Create: `apps/api/app/Events/ProgramSessionRescheduled.php`
- Create: `apps/api/app/Listeners/ProjectProgramSessionReschedule.php`
- Create: model/resource/controller inbox update
- Modify: `apps/api/app/Actions/Programs/SaveProgramSession.php`
- Modify: routes and Workspace/Mentor projections
- Modify: `apps/api/tests/Feature/ProgramDeliveryTest.php`

1. Tulis test rollback tidak mengirim event, event hanya after commit, recipient peserta/mentor tepat, dan listener retry tidak menduplikasi inbox.
2. Implementasikan event after-commit dan queued listener idempotent.
3. Expose update terbaru pada Workspace/mentor dan acknowledgment endpoint.
4. Jalankan event/notification tests.

## Task 17: Selesaikan UI dan quality gates

**Files:**
- Refactor: Workspace/Admin Program delivery components menjadi komponen terfokus
- Modify: API client, Workspace types/store, frontend contract tests
- Modify: PostgreSQL concurrency probe/suite
- Create: browser responsive/accessibility smoke bila runner tersedia
- Modify: `docs/program-workspace-api.md` dan PRD implementation status

1. Tulis failing contract tests untuk component route, progress breakdown, certificate, mentor selection, dan reschedule inbox.
2. Implementasikan UI Shadcn/Tailwind mobile-first dengan label, focus, aria-live, reduced-motion, dan deep link nyata.
3. Tambahkan PostgreSQL race tests untuk payment, Batch seat, dan mentor slot.
4. Jalankan Pint, seluruh backend suite, PostgreSQL suite, frontend contract/build, responsive 375/768/1024/1440, accessibility, dan benchmark Workspace.
5. Jalankan `migrate:fresh --seed`, smoke HTTP, scan legacy, update dokumentasi, lalu commit per workstream.
