<?php

use App\Models\AccessEvent;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\User;
use Database\Seeders\ComponentDefinitionSeeder;
use Database\Seeders\ProgramSeeder;
use Database\Seeders\ProgramWorkspaceSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

it('seeds demo workspace access through the grant flow with an immutable event', function () {
    $this->seed(ComponentDefinitionSeeder::class);
    $this->seed(ProgramSeeder::class);
    $user = User::factory()->create(['email' => 'test@example.com']);

    $this->seed(ProgramWorkspaceSeeder::class);
    $this->seed(ProgramWorkspaceSeeder::class);

    $program = Program::query()->where('slug', 'bimbel-tka-premium')->firstOrFail();
    $access = ProgramAccess::query()->where('grant_key', 'seed:workspace:test:bimbel-tka-premium:tka-2026-01')->firstOrFail();

    expect($access->user_id)->toBe($user->id)
        ->and($access->program_id)->toBe($program->id)
        ->and(ProgramAccess::query()->where('grant_key', $access->grant_key)->count())->toBe(1)
        ->and(AccessEvent::query()->where('program_access_id', $access->id)->where('action', 'access.granted')->count())->toBe(1)
        ->and($access->batch?->enrolled_count)->toBe(1);
});
