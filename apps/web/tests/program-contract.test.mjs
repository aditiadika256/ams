import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const files = [
  'src/types/sales.ts',
  'src/store/useSalesStore.ts',
  'src/lib/api.ts',
  'src/components/admin/layout/AdminLayout.tsx',
  'src/components/admin/views/Programs/form.tsx',
  'src/components/admin/views/Programs/view.tsx',
];

test('frontend uses only the modular Program contract', async () => {
  const sources = await Promise.all(files.map((file) => readFile(file, 'utf8')));
  const contract = sources.join('\n');

  assert.doesNotMatch(
    contract,
    /program[_-]?(?:level|type)|ProgramLookup|programLookups|\/admin\/master\/program-/i,
  );
  assert.match(contract, /\/admin\/programs/);
  assert.match(contract, /\/admin\/tags/);
  assert.match(contract, /component-definitions/);
  assert.match(contract, /'tags': TagsView/);
});

test('admin and workspace never advertise unavailable component actions', async () => {
  const [adminStep, workspaceDetail] = await Promise.all([
    readFile('src/components/admin/views/Programs/ProgramComponentsStep.tsx', 'utf8'),
    readFile('src/app/workspace/accesses/[accessId]/page.tsx', 'utf8'),
  ]);

  assert.match(adminStep, /definition\.is_available/);
  assert.match(adminStep, /Belum tersedia/);
  assert.match(workspaceDetail, /componentRoutes/);
  assert.doesNotMatch(workspaceDetail, /`#\$\{component\.code\}`/);
});

test('student experience is driven by ProgramAccess workspace contracts', async () => {
  const [api, store, workspace, dashboard, exams] = await Promise.all([
    readFile('src/lib/api.ts', 'utf8'),
    readFile('src/store/useWorkspaceStore.ts', 'utf8'),
    readFile('src/app/workspace/page.tsx', 'utf8'),
    readFile('src/app/dashboard/page.tsx', 'utf8'),
    readFile('src/app/exams/page.tsx', 'utf8'),
  ]);

  assert.match(api, /\/workspace\/accesses\/\$\{accessId\}\/archive/);
  assert.match(api, /\/workspace\/accesses\/\$\{accessId\}\/restore/);
  assert.match(api, /\/access\/redeem-\$\{type\}/);
  assert.match(api, /program_access_id: programAccessId/);
  assert.match(store, /WorkspaceAccess/);
  assert.match(workspace, /access\.id/);
  assert.match(workspace, /access\.batch/);
  assert.match(workspace, /access\.next_session/);
  assert.doesNotMatch(dashboard, /orders|OrderItem/i);
  assert.match(dashboard, /router\.replace\('\/workspace'\)/);
  assert.match(exams, /program_access_id/);
});

test('workspace exposes authoritative progress activities and certificates', async () => {
  const [api, types, detail] = await Promise.all([
    readFile('src/lib/api.ts', 'utf8'),
    readFile('src/types/workspace.ts', 'utf8'),
    readFile('src/app/workspace/accesses/[accessId]/page.tsx', 'utf8'),
  ]);

  assert.match(api, /lessons\/\$\{lessonId\}\/complete/);
  assert.match(types, /breakdown/);
  assert.match(types, /certificate_number/);
  assert.match(detail, /componentRoutes/);
  assert.match(detail, /certificate:/);
  assert.match(detail, /Sertifikat kelulusan/);
});

test('delivery UI exposes mentor selection and acknowledged reschedule updates', async () => {
  const [api, types, detail, delivery] = await Promise.all([
    readFile('src/lib/api.ts', 'utf8'),
    readFile('src/types/workspace.ts', 'utf8'),
    readFile('src/app/workspace/accesses/[accessId]/page.tsx', 'utf8'),
    readFile('src/components/admin/views/Programs/ProgramDeliveryDialog.tsx', 'utf8'),
  ]);

  assert.match(api, /mentor-reservations/);
  assert.match(api, /session-updates\/\$\{updateId\}\/acknowledge/);
  assert.match(types, /mentor_assignment_mode/);
  assert.match(types, /SESSION_RESCHEDULED/);
  assert.match(detail, /aria-live="polite"/);
  assert.match(detail, /Pilih mentor sesi/);
  assert.match(delivery, /mentor_assignment_mode: mentorMode/);
  assert.match(api, /mentor-assignments/);
  assert.match(delivery, /ProgramMentorAssignments/);
});

test('component catalog is wired to guarded CRUD navigation', async () => {
  const [types, api, store, layout, sidebar, view, menuSeeder] = await Promise.all([
    readFile('src/types/sales.ts', 'utf8'),
    readFile('src/lib/api.ts', 'utf8'),
    readFile('src/store/useAdminStore.ts', 'utf8'),
    readFile('src/components/admin/layout/AdminLayout.tsx', 'utf8'),
    readFile('src/components/admin/layout/AdminSidebar.tsx', 'utf8'),
    readFile('src/components/admin/views/Components/view.tsx', 'utf8'),
    readFile('../api/database/seeders/MenuSeeder.php', 'utf8'),
  ]);

  assert.match(types, /ComponentHandlerTemplate/);
  assert.match(api, /component-definitions\/\$\{id\}\/restore/);
  assert.match(api, /component-definitions\/\$\{id\}\/force/);
  assert.match(store, /'components'/);
  assert.match(layout, /'components': ComponentsView/);
  assert.match(layout, /component-definition\.view/);
  assert.match(sidebar, /Blocks/);
  assert.match(view, /include_archived/);
  assert.match(view, /handler_template/);
  assert.match(menuSeeder, /admin:\/\/view\/components/);
  assert.doesNotMatch(menuSeeder, /admin:\/\/view\/curriculum-builder/);
});
