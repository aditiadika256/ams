<?php

use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\ComponentDefinitionSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(ComponentDefinitionSeeder::class);
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $this->authenticateWith = function (array $permissions = []): User {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
        }

        Sanctum::actingAs($user);

        return $user;
    };
});

it('protects admin program routes with granular permissions', function () {
    $this->getJson('/api/v1/admin/programs')->assertUnauthorized();

    ($this->authenticateWith)([]);
    $this->getJson('/api/v1/admin/programs')->assertForbidden();

    ($this->authenticateWith)(['program.view']);
    $this->getJson('/api/v1/admin/programs')->assertOk();
});

it('creates and updates a draft without legacy level or type fields', function () {
    ($this->authenticateWith)(['program.create', 'program.update', 'program.view']);

    $programId = $this->postJson('/api/v1/admin/programs', [
        'name' => 'Kelas Intensif TKA',
        'slug' => 'kelas-intensif-tka',
        'short_description' => 'Belajar terarah untuk menghadapi TKA.',
        'description' => 'Program belajar lengkap.',
        'base_price' => '350000.00',
        'visibility' => 'PUBLIC',
    ])->assertCreated()
        ->assertJsonPath('data.status', 'DRAFT')
        ->assertJsonMissingPath('data.level')
        ->assertJsonMissingPath('data.type')
        ->json('data.id');

    $this->putJson("/api/v1/admin/programs/{$programId}", [
        'name' => 'Kelas Intensif TKA Plus',
        'base_price' => '375000.50',
    ])->assertOk()
        ->assertJsonPath('data.name', 'Kelas Intensif TKA Plus')
        ->assertJsonPath('data.base_price', '375000.50');

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'program.created',
        'entity' => Program::class,
        'entity_id' => $programId,
    ]);
    $this->assertDatabaseHas('audit_logs', [
        'action' => 'program.updated',
        'entity' => Program::class,
        'entity_id' => $programId,
    ]);
});

it('validates program money slug visibility and rejects legacy fields', function () {
    ($this->authenticateWith)(['program.create']);

    $this->postJson('/api/v1/admin/programs', [
        'name' => '',
        'slug' => 'Invalid Slug',
        'base_price' => '-1.00',
        'visibility' => 'SECRET',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'slug', 'base_price', 'visibility']);
});

it('enforces lifecycle transitions permissions and audit reasons', function () {
    $program = Program::factory()->create();
    ($this->authenticateWith)(['program.publish']);

    $this->postJson("/api/v1/admin/programs/{$program->id}/publish", [
        'reason' => 'Siap dijual.',
    ])->assertOk()
        ->assertJsonPath('data.status', 'PUBLISHED');

    $this->postJson("/api/v1/admin/programs/{$program->id}/publish", [
        'reason' => 'Duplikat.',
    ])->assertStatus(409)
        ->assertJsonPath('code', 'INVALID_PROGRAM_TRANSITION');

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'program.published',
        'entity_id' => $program->id,
        'reason' => 'Siap dijual.',
    ]);
});

it('unpublishes archives and restores through valid audited transitions', function () {
    $program = Program::factory()->published()->create();
    ($this->authenticateWith)(['program.publish', 'program.archive']);

    $this->postJson("/api/v1/admin/programs/{$program->id}/unpublish", [
        'reason' => 'Pendaftaran ditutup sementara.',
    ])->assertOk()->assertJsonPath('data.status', 'UNPUBLISHED');

    $this->postJson("/api/v1/admin/programs/{$program->id}/archive", [
        'reason' => 'Program sudah tidak ditawarkan.',
    ])->assertOk()->assertJsonPath('data.status', 'ARCHIVED');

    $this->postJson("/api/v1/admin/programs/{$program->id}/restore", [
        'reason' => 'Program akan disiapkan ulang.',
    ])->assertOk()->assertJsonPath('data.status', 'DRAFT');

    foreach (['program.unpublished', 'program.archived', 'program.restored'] as $action) {
        $this->assertDatabaseHas('audit_logs', [
            'entity_id' => $program->id,
            'action' => $action,
        ]);
    }
});

it('rotates the catalog generation after an admin mutation', function () {
    Cache::forever('programs:cache_version', 'before-mutation');
    ($this->authenticateWith)(['program.create']);

    $this->postJson('/api/v1/admin/programs', [
        'name' => 'Program Cache',
        'slug' => 'program-cache',
        'base_price' => '0.00',
        'visibility' => 'PUBLIC',
    ])->assertCreated();

    expect(Cache::get('programs:cache_version'))->not->toBe('before-mutation');
});

it('clones metadata tags and components without operational history', function () {
    $tag = Tag::factory()->create();
    $component = ComponentDefinition::query()->where('code', 'material')->firstOrFail();
    $program = Program::factory()->published()->create(['slug' => 'program-asli']);
    $program->tags()->attach($tag);
    $program->components()->create([
        'component_definition_id' => $component->id,
        'configuration' => ['download_limit' => 2],
    ]);
    ProgramBatch::factory()->for($program)->create();
    ProgramAccess::factory()->for($program)->create();

    ($this->authenticateWith)(['program.clone']);

    $cloneId = $this->postJson("/api/v1/admin/programs/{$program->id}/clone", [
        'name' => 'Program Salinan',
        'slug' => 'program-salinan',
        'reason' => 'Template angkatan baru.',
    ])->assertCreated()
        ->assertJsonPath('data.status', 'DRAFT')
        ->json('data.id');

    $clone = Program::query()->with(['tags', 'components'])->findOrFail($cloneId);

    expect($clone->tags->modelKeys())->toBe([$tag->id])
        ->and($clone->components)->toHaveCount(1)
        ->and($clone->batches()->count())->toBe(0)
        ->and($clone->accesses()->count())->toBe(0);
});

it('prevents hard deletion when a program has historical access', function () {
    $program = Program::factory()->create();
    ProgramAccess::factory()->for($program)->create();
    ($this->authenticateWith)(['program.archive']);

    $this->deleteJson("/api/v1/admin/programs/{$program->id}")
        ->assertUnprocessable()
        ->assertJsonPath('code', 'PROGRAM_REFERENCED');

    $this->assertModelExists($program);
});

it('removes the legacy lookup endpoints from the active contract', function () {
    ($this->authenticateWith)(['program.view']);

    $this->getJson('/api/v1/program-lookups')->assertNotFound();
    $this->getJson('/api/v1/admin/master/program-levels')->assertNotFound();
    $this->getJson('/api/v1/admin/master/program-types')->assertNotFound();
});
