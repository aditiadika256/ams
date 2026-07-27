# Mutation Data Freshness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use systematic debugging and test-driven development while executing this plan.

**Goal:** Make every create, update, and delete immediately visible in the UI without full-page reloads or stale browser/store data.

**Architecture:** Keep Laravel application caches for database-query performance, but require mutable HTTP collections to revalidate. Track a client mutation revision so the first GET after each mutation cannot reuse an older browser or in-flight response. Update local state immediately where mutation responses are available, then reconcile with a forced fresh request guarded against races.

**Tech Stack:** Laravel, PHPUnit, Next.js, Axios, Zustand, TypeScript.

---

### Task 1: Regression coverage for mutable HTTP collections

**Files:**
- Create: `apps/api/tests/Feature/MutableCollectionFreshnessTest.php`

1. Assert admin menus use `no-store`.
2. Assert public menus and programs require revalidation.
3. Run the focused PHPUnit test and confirm it fails against the old `max-age=300` headers.

### Task 2: Correct HTTP cache policy

**Files:**
- Modify: `apps/api/app/Domain/Admin/MenuController.php`
- Modify: `apps/api/app/Domain/System/MenuController.php`
- Modify: `apps/api/app/Domain/Sales/ProgramController.php`

1. Keep Laravel `Cache::remember` and version invalidation.
2. Prevent browser reuse of mutable admin responses.
3. Require public mutable collections to revalidate instead of remaining fresh for five minutes.

### Task 3: Revision-aware API reads

**Files:**
- Modify: `apps/web/src/lib/api.ts`

1. Increment a client data revision after every successful non-GET request.
2. Include that revision in subsequent GET query parameters and deduplication keys.
3. Preserve concurrent GET deduplication within the same revision.

### Task 4: Race-safe menu and program refresh

**Files:**
- Modify: `apps/web/src/store/useMenuStore.ts`
- Modify: `apps/web/src/store/useSalesStore.ts`
- Modify: `apps/web/src/components/admin/views/MenuManagement/view.tsx`

1. Add explicit force refresh options that bypass TTL and old in-flight requests.
2. Ignore responses from superseded requests.
3. Update programs immediately from mutation responses.
4. Refresh active navigation menu caches after menu CRUD.

### Task 5: Await UI reconciliation

**Files:**
- Modify: `apps/web/src/components/admin/views/Users/view.tsx`
- Modify: `apps/web/src/components/admin/views/CurriculumBuilder/view.tsx`
- Modify: `apps/web/src/app/orders/[id]/page.tsx`

1. Patch local state immediately where safe.
2. Await list/detail reloads before finishing mutation handlers.
3. Keep success and persistent error alert behavior unchanged.

### Task 6: Verification

1. Run focused PHPUnit tests.
2. Run TypeScript compiler/build.
3. Run `git diff --check` and audit mutation/refetch call sites.
4. Perform read-only code review for stale-response races.
