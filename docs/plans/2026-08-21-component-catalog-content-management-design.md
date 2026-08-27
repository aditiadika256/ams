# Component Catalog and Program Content Management Design

## Objective

Provide an administrator-managed Component Catalog without turning database rows into executable plugins. Administrators can create generic component definitions from safe handler templates, definitions immediately appear as unchecked choices in Program composition, and content is always authored within a specific Program. Existing native capabilities remain backed by their established domain tables.

## Confirmed product decisions

- There is no approval workflow for a new component definition.
- A newly created, non-archived definition appears in the Program component picker but is never selected automatically.
- Definition fields are complete but optional where safe; identity and handler fields remain required.
- Role membership and permission assignment are dynamic through Roles & Permissions.
- Rerunning seeders must not reset permission assignments on existing non-superadmin roles.
- Deleting a definition means soft delete by default. Hard delete is superadmin-only and is rejected after any usage, content, media, or audit history exists.
- Component content is managed from `Programs -> Kelola Isi`, never from a global content menu.
- Private uploads use a configurable Laravel disk: local private storage in development and S3-compatible storage in production (MinIO, S3, R2, or Wasabi).

## Domain architecture

The implementation has three layers:

1. `component_definitions` is the global catalog. A definition owns a stable code, display metadata, a handler template, an optional registered native handler key, an optional configuration schema, ordering, user stamps, system/custom provenance, and soft-delete state.
2. `program_components` is the installation of a definition on one Program. It owns the Program-specific label, enabled state, ordering, and configuration. It becomes soft-deletable so removing a component from composition cannot cascade-delete authored content or history.
3. Content belongs to a ProgramComponent. Generic templates use `program_component_contents`. Native handlers keep using their domain tables: Material uses modules and lessons, Meeting uses batches and sessions, Assessment uses CBT packages, and Certificate uses completion/certificate records.

Supported generic handler templates are `INFORMATION`, `EXTERNAL_LINK`, `FILE_DOWNLOAD`, `EMBEDDED_PAGE`, `VIDEO`, `FORM`, and `IFRAME`. `NATIVE` is not arbitrary code execution: its handler key must exist in the application registry. System definitions retain readiness control; generic templates are considered implemented by the shared renderer.

## Schema

New focused migrations will extend definitions and program installations instead of rewriting already merged migrations.

`component_definitions` gains:

- `handler_template` string, indexed.
- nullable `handler_key` string.
- nullable `icon` string.
- `is_system` boolean.
- `created_by`, `updated_by`, and `deleted_at`.

`program_components` gains `deleted_at`. Sync restores selected rows and soft-deletes omitted rows.

`program_component_contents` contains ProgramComponent ownership, title, slug, summary, body, external URL, JSON payload, optional MediaAsset, publication status/time, order, user stamps, and soft delete. It has unique `(program_component_id, slug)` and indexes matching list/publication queries.

`media_assets` stores only metadata: Program, uploader, disk, private object key, original name, MIME, extension, byte size, SHA-256 checksum, timestamps, and soft delete. Binary data never enters JSON or database blobs.

`program_component_submissions` stores a FORM response scoped to ProgramAccess and user. A unique `(program_component_content_id, program_access_id)` enforces one authoritative submission per enrollment.

Material lessons gain `content_kind`, `external_url`, and optional `media_asset_id`, preserving the legacy `content_type` column for compatibility.

## Handler validation and security

Draft content may omit handler-specific fields. Publishing invokes server-side conditional validation:

- INFORMATION and EMBEDDED_PAGE require non-empty body.
- EXTERNAL_LINK requires HTTPS.
- FILE_DOWNLOAD requires a non-deleted media asset from the same Program.
- VIDEO requires either a same-Program media asset or an HTTPS URL.
- FORM requires at least one valid, uniquely named field from an allowlisted field-type schema.
- IFRAME requires HTTPS and a host from `COMPONENT_IFRAME_ALLOWED_HOSTS`; the workspace renderer uses a fixed restrictive sandbox.
- NATIVE rejects generic content creation.

Uploads validate both MIME and extension, use generated object keys, enforce configurable size limits, and never trust the original filename as a path. Download/stream endpoints authorize the current ProgramAccess and verify that the asset is referenced by published, enabled content or published Material in the same Program. Responses never expose disk paths.

Content bodies are rendered as text or controlled blocks rather than unsanitized HTML. Unknown payload keys, excessive JSON depth/size, foreign Program relationships, deleted definitions, and disabled components fail closed with machine-readable domain codes.

## API and authorization

Admin routes remain under `/api/v1/admin` and use Form Requests, policies, thin controllers, and transactional Actions.

- Component definitions: list/create/show/update/delete/restore/force-delete.
- Program content: nested list/create/show/update/delete/restore routes with scoped bindings.
- Media assets: nested Program upload plus authorized delete/download.
- Curriculum: existing module/lesson endpoints are hardened with Form Requests and support media/link/body content.

Workspace routes expose published generic content, authorized media streaming, and FORM submission for the authenticated owner. `ComponentAccessGate` remains the entitlement boundary and is applied using the actual definition code.

Permissions are granular: definition view/create/update/delete/restore/force-delete, Program component manage, Program content view/manage/publish, media upload/delete, and form submit. Seeder creates permission records; only superadmin is continuously granted the full catalog. Existing role assignments remain unchanged on rerun and can be managed through RoleController.

## Menu and frontend flow

Seeded Education navigation becomes:

```text
Education
|- Programs
|- Tags
|- Component Catalog
`- Mentors
```

The broken global Curriculum Builder seed is removed. `Component Catalog` maps to `admin://view/components`; `Kelola Isi` opens an internal `program-content` tab with Program context. Menu rows gain an optional required permission, and the frontend hides unauthorized items while API authorization remains authoritative. Seeder rotates the versioned menu cache.

The Component Catalog provides search, archived filtering, usage count, create/edit dialogs, soft delete, restore, and guarded hard delete. Program Content shows installed components and routes native handlers to their established editors. Generic handlers share a content list/editor with progressive disclosure. Material supports modules, lessons, text, private files, private video, external links, embed text, draft/publish, and preview.

Workspace renders only published content. It provides explicit actions for links/downloads, safe iframe/video handling, form submission feedback, and meaningful empty/loading/error states. UI follows `docs/web/UI-style.md`: Shadcn primitives, Lucide icons, Zinc/Slate surfaces, one primary color, no gradients, 44px touch targets, restrained motion, dark mode, and responsive layouts.

## Audit, caching, and failure behavior

Definition, composition, content, media metadata, and publication changes write domain audit records in the same transaction with before/after state, actor, reason where destructive or publishing, and correlation ID. Object deletion happens only after database authorization and reference checks; failed storage cleanup is reported without corrupting database references.

Catalog and menu cache generations rotate after committed mutations. Public/workspace queries select required columns and eager-load definitions/content/media to prevent N+1 queries. Soft-deleted definitions remain resolvable for historical records but are excluded from new composition and new public content.

## Verification strategy

Backend feature tests cover permissions, immutable code, handler registry safety, immediate unchecked availability, soft-delete/restore/force-delete rules, dynamic role preservation, menu idempotency, content publication validation, nested ownership, private upload security, authorized downloads, form submissions, material editing, audit records, and query behavior. Storage uses `Storage::fake()` in ordinary tests; S3 compatibility is configuration-contract tested.

Frontend contract tests prohibit the removed global curriculum seed/view navigation, require Component Catalog and Program content routes, verify every generic handler has a renderer/editor path, and reject unrecognized generic anchor fallbacks. Production build and TypeScript compilation are mandatory. PostgreSQL migration/schema verification complements SQLite feature tests for constraints and indexes.

