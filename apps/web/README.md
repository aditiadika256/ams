# AMS Web

Next.js 16 frontend untuk katalog Program modular, administrasi Program, checkout, dan Personal Workspace.

## Kontrak utama

- `/programs` adalah katalog published; tidak ada Level/Type legacy.
- `/workspace` adalah landing student dan bersumber dari `ProgramAccess`, bukan Order.
- `/workspace/accesses/{accessId}` menampilkan komponen yang diizinkan backend untuk enrollment tersebut.
- Ujian selalu membawa `program_access_id` dari Workspace.
- Admin Program memakai wizard Basics, Tags, Components, Collection, Batches, Review dan dialog delivery untuk Session.
- UI mengikuti `docs/web/UI-style.md`: Shadcn, Lucide, static zinc/slate, satu accent, tanpa gradient/glass pada flow baru.

## Development

Dari root repository:

```bash
docker compose -p ams_program_workspace -f ops/docker-compose.yml run --rm --no-deps web npm run dev
```

Verification:

```bash
npm run test:program-contract
npm exec tsc -- --noEmit
npm run build
```

Set `NEXT_PUBLIC_API_URL` ke origin API; client otomatis memakai prefix `/api/v1`.
