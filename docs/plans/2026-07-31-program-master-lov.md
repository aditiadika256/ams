# Program Master LoV Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add database-backed Program level/type lookup masters, safe migrations/seeding, optimized APIs, menu integration, and dynamic Program form options.

**Architecture:** Two lookup tables own level/type records and are referenced by nullable Program foreign IDs during a backward-compatible transition. Admin CRUD is permission-protected, while a single cached read endpoint supplies both option lists. Reusable frontend components render both master screens and a dedicated store caches lookup options.

**Tech Stack:** Laravel 11, Eloquent, Spatie Permission, PHPUnit, PostgreSQL/SQLite test database, Next.js 16, React 19, Zustand, Tailwind CSS 4.

---

### Task 1: Database schema, data migration, and idempotent seeders

**Files:**
- Create: `apps/api/database/migrations/2026_07_31_000001_create_program_levels_table.php`
- Create: `apps/api/database/migrations/2026_07_31_000002_create_program_types_table.php`
- Create: `apps/api/database/migrations/2026_07_31_000003_add_program_lookup_ids_to_programs_table.php`
- Create: `apps/api/database/migrations/2026_07_31_000004_seed_and_backfill_program_lookups.php`
- Create: `apps/api/database/seeders/ProgramMasterSeeder.php`
- Create: `apps/api/tests/Feature/ProgramMasterSeederTest.php`
- Modify: `apps/api/database/seeders/DatabaseSeeder.php`
- Modify: `apps/api/database/seeders/ProgramSeeder.php`

**Steps:**
1. Write a failing PHPUnit feature test proving canonical counts, codes, ordering, rerun idempotency, and Program backfill.
2. Run `php artisan test --compact tests/Feature/ProgramMasterSeederTest.php` and confirm failure because the seeder/tables do not exist.
3. Add signed `row_status`, audit foreign keys, unique codes, `(row_status, sort_order, id)` indexes, and restricted Program foreign keys.
4. Add a DML-only migration that inserts the canonical values and backfills IDs by existing codes.
5. Implement `ProgramMasterSeeder` with `firstOrCreate`; call it before an idempotent `ProgramSeeder`.
6. Re-run the focused test and migration rollback test.

### Task 2: Models, validation, resources, and optimized lookup API

**Files:**
- Create: `apps/api/app/Models/ProgramLevel.php`
- Create: `apps/api/app/Models/ProgramType.php`
- Create: `apps/api/app/Http/Resources/ProgramLevelResource.php`
- Create: `apps/api/app/Http/Resources/ProgramTypeResource.php`
- Create: `apps/api/app/Domain/Sales/ProgramLookupController.php`
- Create: `apps/api/tests/Feature/ProgramLookupTest.php`
- Modify: `apps/api/app/Models/Program.php`
- Modify: `apps/api/app/Domain/Sales/ProgramController.php`
- Modify: `apps/api/app/Http/Requests/Sales/ProgramStoreRequest.php`
- Modify: `apps/api/app/Http/Requests/Sales/ProgramUpdateRequest.php`
- Modify: `apps/api/app/Http/Requests/Sales/ProgramIndexRequest.php`
- Modify: `apps/api/app/Http/Resources/ProgramResource.php`
- Modify: `apps/api/routes/api.php`

**Steps:**
1. Write failing tests for active-only combined options, relationship payloads, active-ID validation, and backward-compatible `level`/`type` fields.
2. Run the focused test and confirm expected route/model failures.
3. Add typed relationships/scopes and `Rule::exists(...)->where(row_status, 1)` validation.
4. Eager-load lookup relationships with limited columns and synchronize legacy codes on Program mutations.
5. Cache the combined lookup payload with a versioned key.
6. Run both lookup and existing Program freshness tests.

### Task 3: Permission-protected master CRUD and logical deletion

**Files:**
- Create: `apps/api/app/Domain/Admin/ProgramLevelController.php`
- Create: `apps/api/app/Domain/Admin/ProgramTypeController.php`
- Create: `apps/api/app/Http/Requests/Admin/ProgramLevelStoreRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/ProgramLevelUpdateRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/ProgramTypeStoreRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/ProgramTypeUpdateRequest.php`
- Create: `apps/api/tests/Feature/ProgramMasterManagementTest.php`
- Modify: `apps/api/database/seeders/RolesSeeder.php`
- Modify: `apps/api/routes/api.php`

**Steps:**
1. Write failing tests for authentication, `manage_program_masters`, pagination/search/status, create/update, immutable codes, and delete-to-`-1`.
2. Confirm the focused test fails before routes/controllers exist.
3. Implement thin resource controllers with validated input, limited selects, deterministic ordering, and cache-version rotation.
4. Add `manage_program_masters` and `manage_programs` for both guards; attach mutation middleware.
5. Re-run focused RBAC/master tests.

### Task 4: Safe menu seeding and admin view registration

**Files:**
- Modify: `apps/api/database/seeders/MenuSeeder.php`
- Modify: `apps/api/tests/Feature/ProgramMasterSeederTest.php`
- Modify: `apps/web/src/store/useAdminStore.ts`
- Modify: `apps/web/src/components/admin/layout/AdminLayout.tsx`
- Modify: `apps/web/src/components/admin/layout/AdminSidebar.tsx`

**Steps:**
1. Extend the failing seeder test to prove two runs preserve a custom menu and create one Master parent plus two children.
2. Replace destructive menu deletion with natural-key `updateOrCreate`.
3. Seed stable `admin://view/program-levels` and `admin://view/program-types` URLs.
4. Register both view keys and `manage_program_masters` permissions in the admin frontend.
5. Re-run the seeder test and frontend type check.

### Task 5: Reusable master CRUD UI and cached lookup store

**Files:**
- Create: `apps/web/src/types/program-master.ts`
- Create: `apps/web/src/store/useProgramLookupStore.ts`
- Create: `apps/web/src/components/admin/views/ProgramMaster/form.tsx`
- Create: `apps/web/src/components/admin/views/ProgramMaster/LookupMasterView.tsx`
- Create: `apps/web/src/components/admin/views/ProgramLevels/view.tsx`
- Create: `apps/web/src/components/admin/views/ProgramTypes/view.tsx`
- Modify: `apps/web/src/lib/api.ts`

**Steps:**
1. Define typed paginated CRUD and combined option contracts.
2. Add a five-minute lookup cache with in-flight deduplication, stale-response guard, and forced invalidation.
3. Build the shared server-paginated list/grid screen and responsive modal form.
4. Add thin wrappers for the two resources.
5. Run `npx tsc --noEmit` and fix type errors.

### Task 6: Convert Program UI and public cards to dynamic LoV

**Files:**
- Modify: `apps/web/src/types/sales.ts`
- Modify: `apps/web/src/components/admin/views/Programs/form.tsx`
- Modify: `apps/web/src/components/admin/views/Programs/view.tsx`
- Modify: `apps/web/src/components/programs/ProgramCard.tsx`
- Modify: `apps/web/src/app/programs/page.tsx`
- Modify: `apps/web/src/app/programs/[id]/page.tsx`
- Modify: `apps/web/src/app/checkout/page.tsx`

**Steps:**
1. Replace hard-coded unions/options with typed lookup relations and IDs.
2. Add loading, retry, empty, inactive-current-value, and responsive form behavior.
3. Submit foreign IDs and render lookup names with legacy fallbacks.
4. Remove the invalid frontend-only `course` filter.
5. Run TypeScript, ESLint, and the production Next build.

### Task 7: Final verification and review

**Steps:**
1. Run focused backend tests, then `php artisan test --compact`.
2. Run migration fresh/seed and rollback/migrate cycles against SQLite test configuration.
3. Run `npx tsc --noEmit`, ESLint, and `npm run build`.
4. Run `git diff --check` and inspect all changed files.
5. Request an independent code review, fix all Critical/Important findings, and re-run affected verification.

