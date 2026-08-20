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
