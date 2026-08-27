# Component Catalog and Program Content Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build permission-driven Component Catalog CRUD, safe generic handler content, private media, contextual Material/content editing, workspace delivery, and aligned menu/role seeders.

**Architecture:** Component definitions are global safe-template metadata, ProgramComponent is the installation boundary, and content is scoped to a Program installation. Generic handlers share content/media tables and renderers; native capabilities continue using established domain tables. Every mutation is authorized, validated, audited, and non-destructive by default.

**Tech Stack:** Laravel 11, Eloquent, Sanctum, Spatie Permission, PostgreSQL/SQLite tests, private Laravel Storage/S3-compatible disks, Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn primitives, Lucide, and Node contract tests.

---

### Task 1: Schema, enums, and Eloquent contracts

**Files:**
- Create: `apps/api/app/Enums/ComponentHandlerTemplate.php`
- Create: `apps/api/app/Enums/ComponentContentStatus.php`
- Create: `apps/api/database/migrations/2026_08_21_000001_extend_component_catalog_tables.php`
- Create: `apps/api/database/migrations/2026_08_21_000002_create_program_component_content_tables.php`
- Create: `apps/api/database/migrations/2026_08_21_000003_extend_program_lessons_for_media.php`
- Create: `apps/api/app/Models/ProgramComponentContent.php`
- Create: `apps/api/app/Models/MediaAsset.php`
- Create: `apps/api/app/Models/ProgramComponentSubmission.php`
- Modify: `apps/api/app/Models/ComponentDefinition.php`
- Modify: `apps/api/app/Models/ProgramComponent.php`
- Modify: `apps/api/app/Models/ProgramLesson.php`
- Modify: `apps/api/app/Models/Program.php`
- Test: `apps/api/tests/Feature/ComponentContentSchemaTest.php`

**Steps:**
1. Write schema/model tests for columns, indexes, casts, relationships, soft deletes, and enum defaults.
2. Run `php vendor/bin/pest tests/Feature/ComponentContentSchemaTest.php` and confirm failure because schema/models are missing.
3. Add reversible focused migrations, enums, models, fillable attributes, casts, typed relationships, and scopes.
4. Rerun the focused test and related Program domain tests until green.
5. Commit `feat(api): add component content domain schema`.

### Task 2: Safe handler registry and Component Definition management

**Files:**
- Create: `apps/api/app/Support/Components/ComponentHandlerRegistry.php`
- Create: `apps/api/app/Policies/ComponentDefinitionPolicy.php`
- Create: `apps/api/app/Http/Requests/Admin/ComponentDefinitionIndexRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/ComponentDefinitionStoreRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/ComponentDefinitionUpdateRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/ComponentDefinitionDeleteRequest.php`
- Create: `apps/api/app/Actions/Components/SaveComponentDefinition.php`
- Create: `apps/api/app/Actions/Components/ArchiveComponentDefinition.php`
- Create: `apps/api/app/Actions/Components/RestoreComponentDefinition.php`
- Create: `apps/api/app/Actions/Components/ForceDeleteComponentDefinition.php`
- Modify: `apps/api/app/Domain/Admin/ComponentDefinitionController.php`
- Modify: `apps/api/app/Http/Resources/ComponentDefinitionResource.php`
- Modify: `apps/api/routes/api.php`
- Test: `apps/api/tests/Feature/ComponentDefinitionManagementTest.php`

**Steps:**
1. Write failing feature tests for list/create/update, immutable code, registered NATIVE handler keys, immediate catalog visibility, authorization, usage counts, archive/restore, and guarded force delete.
2. Run the focused tests and verify the expected route/method failures.
3. Implement policy, Form Requests, registry, transactional audited Actions, Resource fields, and REST routes.
4. Run focused and Program composition tests; resolve only behavior required by the tests.
5. Commit `feat(api): manage component definitions safely`.

### Task 3: Dynamic permissions, canonical component projection, and menu seeding

**Files:**
- Modify: `apps/api/database/seeders/RolesSeeder.php`
- Modify: `apps/api/database/seeders/ComponentDefinitionSeeder.php`
- Modify: `apps/api/database/seeders/MenuSeeder.php`
- Create: `apps/api/database/migrations/2026_08_21_000004_add_permission_to_menus.php`
- Modify: `apps/api/app/Models/Menu.php`
- Modify: `apps/api/app/Http/Resources/MenuResource.php`
- Modify: `apps/api/app/Domain/System/MenuController.php`
- Test: `apps/api/tests/Feature/RoleSeederDynamicPermissionTest.php`
- Test: `apps/api/tests/Feature/MenuSeederTest.php`
- Modify: `apps/api/tests/Feature/ProgramWorkspaceSeederTest.php`

**Steps:**
1. Write failing tests proving new permissions exist, superadmin receives them, existing role assignments survive reruns, seeded definitions gain handler metadata without overwriting custom definitions, and the menu tree contains Components but not global Curriculum Builder.
2. Write failing tests for required-permission serialization/filtering and menu cache generation rotation.
3. Implement idempotent non-destructive role setup, canonical definition projection, menu permission metadata, new Component Catalog seed, ordering, pruning, and cache invalidation.
4. Run the focused seed/menu/permission tests and all composition tests.
5. Commit `feat(api): align component permissions and menus`.

### Task 4: Preserve installations and manage generic Program content

**Files:**
- Modify: `apps/api/app/Actions/Programs/SyncProgramComponents.php`
- Modify: `apps/api/app/Http/Requests/Admin/ProgramComponentsUpdateRequest.php`
- Create: `apps/api/app/Policies/ProgramComponentContentPolicy.php`
- Create: `apps/api/app/Support/Components/ComponentContentValidator.php`
- Create: `apps/api/app/Http/Requests/Admin/ProgramComponentContentIndexRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/ProgramComponentContentStoreRequest.php`
- Create: `apps/api/app/Http/Requests/Admin/ProgramComponentContentUpdateRequest.php`
- Create: `apps/api/app/Actions/Components/SaveProgramComponentContent.php`
- Create: `apps/api/app/Actions/Components/ArchiveProgramComponentContent.php`
- Create: `apps/api/app/Actions/Components/RestoreProgramComponentContent.php`
- Create: `apps/api/app/Domain/Admin/ProgramComponentContentController.php`
- Create: `apps/api/app/Http/Resources/ProgramComponentContentResource.php`
- Modify: `apps/api/routes/api.php`
- Test: `apps/api/tests/Feature/ProgramComponentContentTest.php`

**Steps:**
1. Write failing tests for soft-delete/restore of ProgramComponent installations and content CRUD with scoped Program binding.
2. Add one failing publication-validation case for every generic handler and NATIVE rejection.
3. Implement the validator, policy, requests, audited actions, resources, nested routes, and soft-delete-safe synchronization.
4. Run focused tests and existing Program composition/catalog/workspace tests.
5. Commit `feat(api): add generic program component content`.

### Task 5: Private media upload and authorized streaming

**Files:**
- Modify: `apps/api/composer.json`
- Modify: `apps/api/composer.lock`
- Create: `apps/api/config/components.php`
- Modify: `apps/api/config/filesystems.php`
- Modify: `apps/api/.env.example`
- Create: `apps/api/app/Http/Requests/Admin/MediaAssetStoreRequest.php`
- Create: `apps/api/app/Actions/Components/StoreMediaAsset.php`
- Create: `apps/api/app/Actions/Components/DeleteMediaAsset.php`
- Create: `apps/api/app/Domain/Admin/MediaAssetController.php`
- Create: `apps/api/app/Domain/Workspace/WorkspaceMediaController.php`
- Create: `apps/api/app/Http/Resources/MediaAssetResource.php`
- Modify: `apps/api/routes/api.php`
- Test: `apps/api/tests/Feature/ComponentMediaAssetTest.php`

**Steps:**
1. Write failing tests with `Storage::fake()` for MIME/extension/size limits, generated private paths, checksums, Program scoping, referenced-delete rejection, and unauthorized download denial.
2. Declare the S3 Flysystem adapter directly and configure a dedicated component media disk contract.
3. Implement upload/delete actions and admin/workspace controllers without exposing object keys.
4. Run focused tests, configuration tests, and security-related workspace tests.
5. Commit `feat(api): secure private component media`.

### Task 6: Material authoring backend

**Files:**
- Create: `apps/api/app/Http/Requests/Learning/ProgramModuleStoreRequest.php`
- Create: `apps/api/app/Http/Requests/Learning/ProgramModuleUpdateRequest.php`
- Create: `apps/api/app/Http/Requests/Learning/ProgramLessonStoreRequest.php`
- Create: `apps/api/app/Http/Requests/Learning/ProgramLessonUpdateRequest.php`
- Create: `apps/api/app/Actions/Learning/SaveProgramModule.php`
- Create: `apps/api/app/Actions/Learning/SaveProgramLesson.php`
- Modify: `apps/api/app/Domain/Learning/CurriculumController.php`
- Modify: `apps/api/app/Domain/Workspace/WorkspaceCurriculumController.php`
- Test: `apps/api/tests/Feature/MaterialContentManagementTest.php`

**Steps:**
1. Write failing tests for Form Request authorization, validated-only payloads, nested ownership, text/file/video/link/embed lesson drafts, publication requirements, and published workspace resources.
2. Implement thin curriculum controller methods and transactional audited save actions.
3. Ensure media belongs to the Program and private paths are never serialized.
4. Run focused tests plus progress and workspace curriculum tests.
5. Commit `refactor(api): support secure material authoring`.

### Task 7: Workspace generic content and forms

**Files:**
- Create: `apps/api/app/Http/Requests/WorkspaceComponentSubmissionRequest.php`
- Create: `apps/api/app/Actions/Components/SubmitProgramComponentForm.php`
- Create: `apps/api/app/Domain/Workspace/WorkspaceComponentContentController.php`
- Modify: `apps/api/app/Queries/WorkspaceQuery.php`
- Modify: `apps/api/app/Http/Resources/WorkspaceAccessDetailResource.php`
- Modify: `apps/api/app/Support/Access/ComponentAccessGate.php`
- Modify: `apps/api/routes/api.php`
- Test: `apps/api/tests/Feature/WorkspaceComponentContentTest.php`
- Test: `apps/api/tests/Feature/WorkspaceQueryCountTest.php`

**Steps:**
1. Write failing tests for owner-only published content, disabled/deleted/foreign content denial, COMPLETED read rules, parent-chain enforcement, download authorization, and one submission per enrollment.
2. Implement content listing/submission endpoints and capability metadata without per-card gate N+1 queries.
3. Run workspace access, progress, query-count, and new content tests.
4. Commit `feat(api): deliver component content in workspace`.

### Task 8: Frontend contracts, navigation, and Component Catalog

**Files:**
- Modify: `apps/web/src/types/sales.ts`
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/store/useAdminStore.ts`
- Modify: `apps/web/src/components/admin/layout/AdminLayout.tsx`
- Modify: `apps/web/src/components/admin/layout/AdminSidebar.tsx`
- Create: `apps/web/src/components/admin/views/Components/view.tsx`
- Create: `apps/web/src/components/admin/views/Components/form.tsx`
- Modify: `apps/web/tests/program-contract.test.mjs`

**Steps:**
1. Add failing static contract assertions for `components` ViewMap/API CRUD, permission mapping, `Blocks` icon, restore/archive paths, and absence of a global Curriculum Builder seed destination.
2. Implement typed API contracts and a responsive Component Catalog with loading, empty, error, search, archived filtering, dialogs, inline validation, soft delete, restore, and guarded hard delete.
3. Run contract tests and Next TypeScript/build verification.
4. Commit `feat(web): add component catalog administration`.

### Task 9: Contextual Program content and Material editor

**Files:**
- Modify: `apps/web/src/components/admin/views/Programs/view.tsx`
- Create: `apps/web/src/components/admin/views/ProgramContent/view.tsx`
- Create: `apps/web/src/components/admin/views/ProgramContent/GenericContentEditor.tsx`
- Create: `apps/web/src/components/admin/views/ProgramContent/MaterialEditor.tsx`
- Create: `apps/web/src/components/admin/views/ProgramContent/ContentForm.tsx`
- Modify: `apps/web/src/components/admin/views/CurriculumBuilder/view.tsx`
- Modify: `apps/web/src/components/admin/views/CurriculumBuilder/form.tsx`
- Modify: `apps/web/src/store/useLearningStore.ts`
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/web/tests/program-contract.test.mjs`

**Steps:**
1. Add failing contracts for the Program `Kelola Isi` action carrying Program context and every handler template having an editor destination.
2. Implement contextual component selection, generic content editor, conditional draft/publish fields, private upload progress, and enhanced module/lesson Material editor.
3. Preserve the existing admin layout, use Shadcn/Lucide/Tailwind 4, and cover 375/768/1024/1440 layouts with accessible labels and 44px controls.
4. Run contract tests and production build.
5. Commit `feat(web): manage component content per program`.

### Task 10: Workspace renderers and final integration verification

**Files:**
- Modify: `apps/web/src/types/workspace.ts`
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/app/workspace/accesses/[accessId]/page.tsx`
- Create: `apps/web/src/components/workspace/ComponentContentRenderer.tsx`
- Create: `apps/web/src/components/workspace/WorkspaceForm.tsx`
- Modify: `apps/web/tests/program-contract.test.mjs`
- Modify: `docs/web/UI-style.md` only if an implementation note is required; do not rewrite its standards.

**Steps:**
1. Add failing contracts requiring explicit renderer mapping for every generic handler and prohibiting generic `#code` fallbacks or private object paths.
2. Implement safe information/link/file/video/form/iframe renderers, Material details, loading/empty/error states, form feedback, and authorized media links.
3. Run all frontend contract tests and `npm run build`.
4. Run the full backend suite, focused PostgreSQL schema checks where available, Pint on changed PHP files, and inspect git diff/status.
5. Request code review, fix all Critical/Important findings with regression tests, and repeat full verification.
6. Commit `feat: complete component catalog and content management`.

