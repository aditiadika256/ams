<?php

use App\Enums\ComponentHandlerTemplate;
use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramComponent;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $this->authenticateForComponents = function (array $permissions = [], bool $superadmin = false): User {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
        }

        if ($superadmin) {
            $role = Role::findOrCreate('superadmin', 'web');
            $user->assignRole($role);
        }

        Sanctum::actingAs($user);

        return $user;
    };
});

it('lists active definitions with usage counts and requires view permission', function (): void {
    $program = Program::factory()->create();
    $definition = ComponentDefinition::query()->create([
        'code' => 'reference_library',
        'name' => 'Reference Library',
        'handler_template' => ComponentHandlerTemplate::FileDownload,
    ]);
    ProgramComponent::query()->create([
        'program_id' => $program->id,
        'component_definition_id' => $definition->id,
    ]);
    $archived = ComponentDefinition::query()->create([
        'code' => 'archived_information',
        'name' => 'Archived Information',
        'handler_template' => ComponentHandlerTemplate::Information,
    ]);
    $archived->delete();

    ($this->authenticateForComponents)([]);
    $this->getJson('/api/v1/admin/component-definitions')->assertForbidden();

    ($this->authenticateForComponents)(['component-definition.view']);
    $this->getJson('/api/v1/admin/component-definitions')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.code', 'reference_library')
        ->assertJsonPath('data.0.usage_count', 1)
        ->assertJsonPath('data.0.handler_template', 'FILE_DOWNLOAD');

    $this->getJson('/api/v1/admin/component-definitions?include_archived=1')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.1.deleted_at', fn ($value): bool => is_string($value));
});

it('creates an implemented generic definition that immediately appears unchecked for programs', function (): void {
    ($this->authenticateForComponents)([
        'component-definition.view',
        'component-definition.create',
    ]);

    $id = $this->postJson('/api/v1/admin/component-definitions', [
        'code' => 'learning_resources',
        'name' => 'Learning Resources',
        'description' => 'Additional private files.',
        'handler_template' => 'FILE_DOWNLOAD',
        'icon' => 'FolderDown',
        'sort_order' => 30,
        'config_schema' => ['properties' => []],
    ])->assertCreated()
        ->assertJsonPath('data.code', 'learning_resources')
        ->assertJsonPath('data.handler_template', 'FILE_DOWNLOAD')
        ->assertJsonPath('data.is_available', true)
        ->json('data.id');

    $this->getJson('/api/v1/admin/component-definitions')
        ->assertOk()
        ->assertJsonFragment(['id' => $id, 'code' => 'learning_resources']);

    $this->assertDatabaseMissing('program_components', [
        'component_definition_id' => $id,
    ]);
    $this->assertDatabaseHas('audit_logs', [
        'entity_id' => $id,
        'action' => 'component_definition.created',
    ]);
});

it('normalizes codes and rejects unsafe native or irrelevant handler keys', function (): void {
    ($this->authenticateForComponents)(['component-definition.create']);

    $this->postJson('/api/v1/admin/component-definitions', [
        'code' => ' Course INFO ',
        'name' => 'Course Info',
        'handler_template' => 'INFORMATION',
        'handler_key' => 'material',
    ])->assertUnprocessable()->assertJsonValidationErrors('handler_key');

    $this->postJson('/api/v1/admin/component-definitions', [
        'code' => 'native_custom',
        'name' => 'Unsafe Native',
        'handler_template' => 'NATIVE',
        'handler_key' => 'App\\Http\\Controllers\\InjectedController',
    ])->assertUnprocessable()->assertJsonValidationErrors('handler_key');

    $this->postJson('/api/v1/admin/component-definitions', [
        'code' => ' Course INFO ',
        'name' => 'Course Info',
        'handler_template' => 'INFORMATION',
    ])->assertCreated()->assertJsonPath('data.code', 'course_info');
});

it('keeps code immutable and prevents handler changes after installation', function (): void {
    $program = Program::factory()->create();
    $definition = ComponentDefinition::query()->create([
        'code' => 'program_info',
        'name' => 'Program Info',
        'handler_template' => ComponentHandlerTemplate::Information,
    ]);
    ProgramComponent::query()->create([
        'program_id' => $program->id,
        'component_definition_id' => $definition->id,
    ]);
    ($this->authenticateForComponents)(['component-definition.update']);

    $this->putJson("/api/v1/admin/component-definitions/{$definition->id}", [
        'code' => 'renamed',
    ])->assertUnprocessable()->assertJsonValidationErrors('code');

    $this->putJson("/api/v1/admin/component-definitions/{$definition->id}", [
        'handler_template' => 'EXTERNAL_LINK',
    ])->assertConflict()->assertJsonPath('code', 'COMPONENT_HANDLER_IMMUTABLE');

    $this->putJson("/api/v1/admin/component-definitions/{$definition->id}", [
        'name' => 'Updated Program Info',
        'description' => null,
    ])->assertOk()->assertJsonPath('data.name', 'Updated Program Info');
});

it('archives and restores custom definitions without deleting installations', function (): void {
    $program = Program::factory()->create();
    $definition = ComponentDefinition::query()->create([
        'code' => 'downloads',
        'name' => 'Downloads',
        'handler_template' => ComponentHandlerTemplate::FileDownload,
    ]);
    $installation = ProgramComponent::query()->create([
        'program_id' => $program->id,
        'component_definition_id' => $definition->id,
    ]);
    ($this->authenticateForComponents)([
        'component-definition.view',
        'component-definition.delete',
        'component-definition.restore',
    ]);

    $this->deleteJson("/api/v1/admin/component-definitions/{$definition->id}", [
        'reason' => 'Temporarily remove this component.',
    ])->assertNoContent();

    expect($definition->refresh()->trashed())->toBeTrue();
    $this->assertDatabaseHas('program_components', ['id' => $installation->id]);
    $this->getJson('/api/v1/admin/component-definitions')->assertJsonCount(0, 'data');

    $this->postJson("/api/v1/admin/component-definitions/{$definition->id}/restore", [
        'reason' => 'Return the component to the catalog.',
    ])->assertOk()->assertJsonPath('data.deleted_at', null);

    expect($definition->refresh()->trashed())->toBeFalse();
});

it('protects system definitions and restricts force delete to unused archived custom definitions', function (): void {
    $system = ComponentDefinition::query()->create([
        'code' => 'material',
        'name' => 'Material',
        'handler_template' => ComponentHandlerTemplate::Native,
        'handler_key' => 'material',
        'is_system' => true,
    ]);
    $used = ComponentDefinition::query()->create([
        'code' => 'used_custom',
        'name' => 'Used Custom',
        'handler_template' => ComponentHandlerTemplate::Information,
    ]);
    ProgramComponent::query()->create([
        'program_id' => Program::factory()->create()->id,
        'component_definition_id' => $used->id,
    ]);
    $unused = ComponentDefinition::query()->create([
        'code' => 'unused_custom',
        'name' => 'Unused Custom',
        'handler_template' => ComponentHandlerTemplate::Information,
    ]);
    $used->delete();
    $unused->delete();

    ($this->authenticateForComponents)(['component-definition.delete']);
    $this->deleteJson("/api/v1/admin/component-definitions/{$system->id}", [
        'reason' => 'System component cannot be removed.',
    ])->assertConflict()->assertJsonPath('code', 'SYSTEM_COMPONENT_IMMUTABLE');

    ($this->authenticateForComponents)(['component-definition.force-delete']);
    $this->deleteJson("/api/v1/admin/component-definitions/{$unused->id}/force", [
        'reason' => 'Attempt force deletion without superadmin.',
    ])->assertForbidden();

    ($this->authenticateForComponents)(['component-definition.force-delete'], true);
    $this->deleteJson("/api/v1/admin/component-definitions/{$used->id}/force", [
        'reason' => 'Used definition must remain recoverable.',
    ])->assertConflict()->assertJsonPath('code', 'COMPONENT_DEFINITION_REFERENCED');

    $this->deleteJson("/api/v1/admin/component-definitions/{$unused->id}/force", [
        'reason' => 'Unused archived definition can be purged.',
    ])->assertNoContent();
    $this->assertDatabaseMissing('component_definitions', ['id' => $unused->id]);
});
