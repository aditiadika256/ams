<?php

use App\Models\ComponentDefinition;
use App\Models\Program;
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

    $this->authenticateWith = function (array $permissions): User {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
        }

        Sanctum::actingAs($user);

        return $user;
    };
});

it('manages tags while keeping used codes immutable and archive non destructive', function () {
    ($this->authenticateWith)(['program-tag.manage']);

    $tagId = $this->postJson('/api/v1/admin/tags', [
        'code' => 'matematika',
        'name' => 'Matematika',
        'sort_order' => 10,
    ])->assertCreated()
        ->assertJsonPath('data.code', 'matematika')
        ->json('data.id');

    $program = Program::factory()->create();
    $program->tags()->attach($tagId);

    $this->putJson("/api/v1/admin/tags/{$tagId}", [
        'code' => 'kode-baru',
        'name' => 'Matematika Dasar',
    ])->assertUnprocessable()->assertJsonValidationErrors('code');

    $this->deleteJson("/api/v1/admin/tags/{$tagId}")->assertNoContent();

    $this->assertDatabaseHas('tags', [
        'id' => $tagId,
        'code' => 'matematika',
        'is_active' => false,
    ]);
    $this->assertDatabaseHas('program_tag', ['program_id' => $program->id, 'tag_id' => $tagId]);
});

it('exposes the application component registry as read only administration data', function () {
    ($this->authenticateWith)(['program-component.manage']);

    $this->getJson('/api/v1/admin/component-definitions')
        ->assertOk()
        ->assertJsonCount(14, 'data')
        ->assertJsonPath('data.0.code', 'material');

    $this->postJson('/api/v1/admin/component-definitions', [
        'code' => 'unknown_feature',
    ])->assertMethodNotAllowed();
});

it('synchronizes valid enabled components with ordered validated configuration', function () {
    $program = Program::factory()->create();
    $meeting = ComponentDefinition::query()->where('code', 'meeting')->firstOrFail();
    $attendance = ComponentDefinition::query()->where('code', 'attendance')->firstOrFail();
    ($this->authenticateWith)(['program-component.manage']);

    $this->putJson("/api/v1/admin/programs/{$program->id}/components", [
        'components' => [
            [
                'component_definition_id' => $meeting->id,
                'is_enabled' => true,
                'label' => 'Kelas Live',
                'sort_order' => 1,
                'configuration' => ['recording_enabled' => true],
            ],
            [
                'component_definition_id' => $attendance->id,
                'is_enabled' => true,
                'sort_order' => 2,
                'configuration' => [],
            ],
        ],
        'reason' => 'Mengaktifkan kelas dan presensi.',
    ])->assertOk()
        ->assertJsonPath('data.0.code', 'meeting')
        ->assertJsonPath('data.1.code', 'attendance');

    $this->assertDatabaseHas('program_components', [
        'program_id' => $program->id,
        'component_definition_id' => $attendance->id,
        'is_enabled' => true,
    ]);
});

it('rejects invalid component dependencies and oversized configuration', function () {
    $program = Program::factory()->create();
    $qrAttendance = ComponentDefinition::query()->where('code', 'qr_attendance')->firstOrFail();
    $material = ComponentDefinition::query()->where('code', 'material')->firstOrFail();
    ($this->authenticateWith)(['program-component.manage']);

    $this->putJson("/api/v1/admin/programs/{$program->id}/components", [
        'components' => [[
            'component_definition_id' => $qrAttendance->id,
            'is_enabled' => true,
            'sort_order' => 1,
        ]],
        'reason' => 'Konfigurasi QR saja.',
    ])->assertUnprocessable()
        ->assertJsonPath('code', 'COMPONENT_DEPENDENCY_INVALID');

    $this->putJson("/api/v1/admin/programs/{$program->id}/components", [
        'components' => [[
            'component_definition_id' => $material->id,
            'is_enabled' => true,
            'configuration' => ['payload' => str_repeat('x', 17000)],
        ]],
        'reason' => 'Menguji batas konfigurasi.',
    ])->assertUnprocessable()
        ->assertJsonPath('code', 'COMPONENT_CONFIG_TOO_LARGE');
});

it('requires a completion rule before enabling certificates', function () {
    $program = Program::factory()->create(['completion_rule' => null]);
    $certificate = ComponentDefinition::query()->where('code', 'certificate')->firstOrFail();
    ($this->authenticateWith)(['program-component.manage']);

    $this->putJson("/api/v1/admin/programs/{$program->id}/components", [
        'components' => [[
            'component_definition_id' => $certificate->id,
            'is_enabled' => true,
        ]],
        'reason' => 'Mengaktifkan sertifikat.',
    ])->assertUnprocessable()
        ->assertJsonPath('code', 'COMPONENT_DEPENDENCY_INVALID');
});

it('synchronizes ordered collection children and rejects duplicates self reference and cycles', function () {
    $parent = Program::factory()->create();
    $childA = Program::factory()->create();
    $childB = Program::factory()->create();
    ($this->authenticateWith)(['program-component.manage']);

    $this->putJson("/api/v1/admin/programs/{$parent->id}/relations", [
        'children' => [
            ['program_id' => $childA->id, 'sort_order' => 1, 'is_required' => true],
            ['program_id' => $childB->id, 'sort_order' => 2, 'is_required' => false],
        ],
        'reason' => 'Menyusun paket belajar.',
    ])->assertOk()
        ->assertJsonPath('data.0.id', $childA->id)
        ->assertJsonPath('data.1.id', $childB->id);

    $this->putJson("/api/v1/admin/programs/{$parent->id}/relations", [
        'children' => [
            ['program_id' => $childA->id, 'sort_order' => 1],
            ['program_id' => $childA->id, 'sort_order' => 2],
        ],
        'reason' => 'Duplikat child.',
    ])->assertUnprocessable()->assertJsonValidationErrors('children.1.program_id');

    $this->putJson("/api/v1/admin/programs/{$parent->id}/relations", [
        'children' => [['program_id' => $parent->id, 'sort_order' => 1]],
        'reason' => 'Self reference.',
    ])->assertUnprocessable()->assertJsonPath('code', 'PROGRAM_RELATION_INVALID');

    $this->putJson("/api/v1/admin/programs/{$childA->id}/relations", [
        'children' => [['program_id' => $parent->id, 'sort_order' => 1]],
        'reason' => 'Mencoba membuat cycle.',
    ])->assertUnprocessable()->assertJsonPath('code', 'PROGRAM_RELATION_CYCLE');
});

it('audits composition changes and rotates the catalog generation', function () {
    $program = Program::factory()->create();
    $material = ComponentDefinition::query()->where('code', 'material')->firstOrFail();
    Cache::forever('programs:cache_version', 'before-composition');
    ($this->authenticateWith)(['program-component.manage']);

    $this->putJson("/api/v1/admin/programs/{$program->id}/components", [
        'components' => [[
            'component_definition_id' => $material->id,
            'is_enabled' => true,
        ]],
        'reason' => 'Menambah materi utama.',
    ])->assertOk();

    $this->assertDatabaseHas('audit_logs', [
        'entity_id' => $program->id,
        'action' => 'program.components_synced',
        'reason' => 'Menambah materi utama.',
    ]);
    expect(Cache::get('programs:cache_version'))->not->toBe('before-composition');
});

