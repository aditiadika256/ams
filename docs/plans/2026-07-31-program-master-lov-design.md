# Program Master LoV Design

## Goal

Replace hard-coded Program level and type values with database-backed lookup values, expose two CRUD master screens under a new **Master** admin menu, and preserve the existing Program API during a safe staged migration.

## Decisions

- Use separate `program_levels` and `program_types` tables. A generic LoV table would weaken foreign-key integrity because a program type ID could be submitted as a level ID.
- Use numeric foreign keys from `programs` for efficient joins and validation.
- Keep the legacy `programs.level` and `programs.type` columns during this release. They remain synchronized with the selected lookup records so existing API consumers continue to work.
- Interpret `row_status` as `1 = active`, `0 = inactive`, and `-1 = logically deleted`.
- Treat `code` as an immutable natural key. Administrators may edit the display name, ordering, and status.
- Do not add UUIDs because these records are not exposed through a public UUID contract.

## Database and deployment

Each lookup table contains an identity primary key, unique code, name, sort order, signed row status, timestamps, and nullable creator/editor foreign keys. Composite indexes cover the active ordered option query. `programs` receives nullable, indexed foreign IDs with restricted physical deletion.

Deployment is staged:

1. Create both lookup tables.
2. Add nullable foreign IDs to `programs`.
3. Run a dedicated data migration that inserts the canonical five levels and three types and backfills existing programs by legacy code.
4. Switch application reads and writes to the relationships while preserving legacy code fields.
5. Enforce non-null foreign IDs only in a later release after production verification.

The data migration makes the release self-contained without running `db:seed`. `ProgramMasterSeeder` remains available for bootstrap/tests and uses `firstOrCreate` so reruns do not overwrite administrator changes or reactivate deleted records.

## API and caching

Protected CRUD resources:

- `/api/v1/admin/master/program-levels`
- `/api/v1/admin/master/program-types`

One lightweight options endpoint returns both active collections:

- `GET /api/v1/program-lookups`

The options response selects only `id`, `code`, and `name`, orders by `sort_order,id`, and uses the project's versioned cache-key pattern because the configured database cache does not support cache tags. Any lookup mutation rotates the cache generation.

Program mutations accept `program_level_id` and `program_type_id`, validate that both records are active, and synchronize the legacy code columns. Program responses remain backward-compatible by returning `level` and `type`, then add the foreign IDs and nested lookup objects. Program index/detail queries eager-load both lookup records with limited columns.

Master mutations require `manage_program_masters`; Program mutations require `manage_programs`. Public Program reads and the lookup options endpoint remain readable without authentication.

## Admin UI

The sidebar hierarchy is:

```text
Master
├── Master Jenjang / Level
└── Master Tipe Program
```

Both screens use a shared lookup-master view with server-side pagination, search, row-status filtering, list/grid toggle, and a modal create/edit form. Delete calls the API but only changes `row_status` to `-1`.

The Program form loads one cached options payload, handles loading/error/empty states, submits IDs instead of hard-coded codes, and retains the current inactive option while editing historical data. Program cards and admin tables display the lookup label with a legacy-code fallback.

## Error handling and verification

- Unknown, inactive, or deleted lookup IDs produce validation errors.
- Physical deletion is never used for master records.
- Seeder reruns preserve custom rows and administrator edits.
- Menu seeding uses `updateOrCreate` and never deletes unrelated menus.
- Feature tests cover permissions, pagination, CRUD, logical deletion, active-only options, seed idempotency, backfill, Program validation, response compatibility, and cache invalidation.
- Frontend verification uses TypeScript/Next build because this package currently has no frontend test runner.

