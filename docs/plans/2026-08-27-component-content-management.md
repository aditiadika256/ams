# Component Content Management Implementation Plan

> **For Codex:** Execute this plan with test-first changes and verify the backend and frontend independently.

**Goal:** Let authorised administrators manage a global component catalog, attach components to Programs, and author or upload Program-scoped content securely.

**Architecture:** `component_definitions` is a soft-deletable registry. A definition selects a fixed handler template; Program instances are stored in `program_components`; generic content and media stay scoped to a Program component. Native material remains in the existing curriculum domain. The admin UI exposes the registry from the Education menu and opens Program content only from a specific Program.

**Tech Stack:** Laravel 11, Eloquent, Spatie Permission, PostgreSQL/SQLite test database, Next.js, TypeScript, Tailwind, shadcn primitives.

---

### Task 1: Protect catalog and content domain behavior

**Files:**

- API routes, policies, Form Requests, actions, resources, migrations and feature tests under `apps/api/`.

**Steps:**

1. Add failing feature tests for component CRUD, draft/publish validation, soft delete/restore, Program scoping, and private media access.
2. Run the focused PHPUnit files and confirm each behavior fails before its implementation.
3. Implement actions/controllers/requests with explicit policy checks, validated payloads, audit events, and scoped Eloquent queries.
4. Re-run focused tests, then the related feature suite.

### Task 2: Add Program-scoped authoring UI

**Files:**

- `apps/web/src/components/admin/views/Components/*`
- `apps/web/src/components/admin/views/ProgramContent/*`
- `apps/web/src/components/admin/views/Programs/view.tsx`
- `apps/web/src/lib/api.ts`, `apps/web/src/types/*`, frontend contract tests.

**Steps:**

1. Add or extend frontend contract tests for the catalog endpoint, Program-scoped content endpoints, and known renderer destinations.
2. Run the contract test and confirm missing behavior fails before its implementation.
3. Build the catalog and contextual Program content editor using existing UI primitives and the documented mobile style.
4. Ensure generic components use the selected template, while native material uses the curriculum editor and other native handlers direct users to their domain.
5. Run the contract test and production build.

### Task 3: Seed menus and dynamic permissions

**Files:**

- `apps/api/database/seeders/RolesSeeder.php`
- `apps/api/database/seeders/MenuSeeder.php`
- menu/role feature tests.

**Steps:**

1. Add failing tests proving permission-based menu visibility and idempotent menu updates.
2. Add definition/content/media permissions to the existing dynamic Roles API model and canonical menu data.
3. Re-run menu and role tests.

### Task 4: Verify and hand off

**Steps:**

1. Run focused PHPUnit tests through the project runtime.
2. Run frontend contract tests and `npm run build`.
3. Review the complete diff, verify no legacy global Curriculum menu remains, then commit only feature-owned changes.
