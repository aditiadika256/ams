<?php

namespace Database\Seeders;

use App\Enums\AccessSource;
use App\Enums\AccessStatus;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProgramWorkspaceSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->first();
        $program = Program::query()->where('slug', 'bimbel-tka-premium')->first();

        if ($user === null || $program === null) {
            return;
        }

        $batch = $program->batches()->where('code', 'TKA-2026-01')->first();

        ProgramAccess::query()->updateOrCreate(
            ['grant_key' => 'seed:workspace:test:bimbel-tka-premium:tka-2026-01'],
            [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'program_batch_id' => $batch?->id,
                'source_type' => AccessSource::AdminGrant,
                'source_id' => 'development-seed',
                'status' => AccessStatus::Active,
                'starts_at' => now()->subDay(),
                'activated_at' => now()->subDay(),
                'metadata' => ['seeded' => true],
            ]
        );
    }
}
