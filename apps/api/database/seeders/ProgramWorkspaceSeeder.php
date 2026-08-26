<?php

namespace Database\Seeders;

use App\Actions\Access\GrantProgramAccess;
use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProgramWorkspaceSeeder extends Seeder
{
    public function run(GrantProgramAccess $grant): void
    {
        $user = User::query()->where('email', 'test@example.com')->first();
        $program = Program::query()->where('slug', 'bimbel-tka-premium')->first();

        if ($user === null || $program === null) {
            return;
        }

        $batch = $program->batches()->where('code', 'TKA-2026-01')->first();

        $grant->handle(new AccessGrantData(
            userId: $user->id,
            programId: $program->id,
            source: AccessSource::AdminGrant,
            grantKey: 'seed:workspace:test:bimbel-tka-premium:tka-2026-01',
            batchId: $batch?->id,
            sourceId: 'development-seed',
            startsAt: now()->subDay(),
            endsAt: $batch?->ends_at,
            metadata: ['seeded' => true],
        ), null, 'Membuat enrollment demo untuk Workspace development');
    }
}
