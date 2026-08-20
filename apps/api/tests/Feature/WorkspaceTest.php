<?php

use App\Enums\AccessStatus;
use App\Enums\SessionStatus;
use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(LazilyRefreshDatabase::class);

it('lists only personal access instances with search filters sorting pagination and summary groups', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $program = Program::factory()->published()->create(['name' => 'Bimbel UTBK Unggulan']);
    $tag = Tag::factory()->create(['code' => 'utbk']);
    $program->tags()->attach($tag);
    $batchA = ProgramBatch::factory()->for($program)->create(['code' => 'UTBK-A']);
    $batchB = ProgramBatch::factory()->for($program)->create(['code' => 'UTBK-B']);
    ProgramAccess::factory()->active()->for($user)->for($program)->create([
        'program_batch_id' => $batchA->id,
        'last_accessed_at' => now()->subHour(),
    ]);
    ProgramAccess::factory()->for($user)->for($program)->create([
        'program_batch_id' => $batchB->id,
        'status' => AccessStatus::Waiting,
    ]);
    ProgramAccess::factory()->active()->create();

    $this->getJson('/api/v1/workspace?search=UTBK&tag=utbk&per_page=1&sort_by=last_accessed_at&sort_dir=desc')
        ->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.user_id', $user->id)
        ->assertJsonPath('data.data.0.batch.code', 'UTBK-A')
        ->assertJsonPath('data.meta.total', 2)
        ->assertJsonPath('data.summary.ACTIVE', 1)
        ->assertJsonPath('data.summary.WAITING', 1)
        ->assertJsonPath('data.summary.ARCHIVED', 0);

    $this->getJson('/api/v1/workspace?status=WAITING')
        ->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.batch.code', 'UTBK-B');
});

it('projects the next session and only enabled available components in personal detail', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $program = Program::factory()->published()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create([
        'program_batch_id' => $batch->id,
    ]);
    ProgramSession::factory()->for($batch, 'batch')->create([
        'title' => 'Sesi Terdekat',
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHour(),
    ]);
    ProgramSession::factory()->for($batch, 'batch')->create([
        'title' => 'Sesi Dibatalkan',
        'starts_at' => now()->addHour(),
        'ends_at' => now()->addHours(2),
        'status' => SessionStatus::Cancelled,
    ]);
    $material = ComponentDefinition::query()->create([
        'code' => 'material', 'name' => 'Materi', 'is_available' => true,
    ]);
    $disabled = ComponentDefinition::query()->create([
        'code' => 'video', 'name' => 'Video', 'is_available' => true,
    ]);
    $unavailable = ComponentDefinition::query()->create([
        'code' => 'assessment', 'name' => 'Tryout', 'is_available' => false,
    ]);
    $program->components()->create([
        'component_definition_id' => $material->id,
        'is_enabled' => true,
        'configuration' => ['private_key' => 'must-not-leak'],
    ]);
    $program->components()->create([
        'component_definition_id' => $disabled->id,
        'is_enabled' => false,
    ]);
    $program->components()->create([
        'component_definition_id' => $unavailable->id,
        'is_enabled' => true,
    ]);

    $this->getJson("/api/v1/workspace/accesses/{$access->id}")
        ->assertOk()
        ->assertJsonPath('data.next_session.title', 'Sesi Terdekat')
        ->assertJsonPath('data.next_session.meeting_url', null)
        ->assertJsonCount(1, 'data.components')
        ->assertJsonPath('data.components.0.code', 'material')
        ->assertJsonMissing(['private_key' => 'must-not-leak']);

    $otherAccess = ProgramAccess::factory()->active()->create();
    $this->getJson("/api/v1/workspace/accesses/{$otherAccess->id}")->assertNotFound();
});

it('archives and restores a personal card without changing entitlement status', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $access = ProgramAccess::factory()->active()->for($user)->create();

    $this->postJson("/api/v1/workspace/accesses/{$access->id}/archive")
        ->assertOk()
        ->assertJsonPath('data.status', 'ACTIVE');
    expect($access->fresh()->archived_at)->not->toBeNull()
        ->and($access->fresh()->status)->toBe(AccessStatus::Active);

    $this->getJson('/api/v1/workspace')->assertJsonCount(0, 'data.data');
    $this->getJson('/api/v1/workspace?archived=1')
        ->assertOk()
        ->assertJsonPath('data.data.0.id', $access->id);

    $this->postJson("/api/v1/workspace/accesses/{$access->id}/restore")
        ->assertOk()
        ->assertJsonPath('data.archived_at', null);

    $otherAccess = ProgramAccess::factory()->active()->create();
    $this->postJson("/api/v1/workspace/accesses/{$otherAccess->id}/archive")->assertNotFound();
});

it('requires authentication for every workspace endpoint', function () {
    $access = ProgramAccess::factory()->create();

    $this->getJson('/api/v1/workspace')->assertUnauthorized();
    $this->getJson("/api/v1/workspace/accesses/{$access->id}")->assertUnauthorized();
    $this->postJson("/api/v1/workspace/accesses/{$access->id}/archive")->assertUnauthorized();
});
