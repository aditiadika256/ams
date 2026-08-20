<?php

use App\Enums\AccessStatus;
use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\User;
use App\Policies\ProgramAccessPolicy;
use App\Support\Access\ComponentAccessGate;
use Database\Seeders\ComponentDefinitionSeeder;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolesSeeder::class);
    $this->seed(ComponentDefinitionSeeder::class);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

it('allows only the owner or a permitted administrator to view an access', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $admin = User::factory()->create();
    $admin->givePermissionTo(Permission::findOrCreate('program-access.view', 'web'));
    $access = ProgramAccess::factory()->for($owner)->create();
    $policy = app(ProgramAccessPolicy::class);

    expect($policy->view($owner, $access))->toBeTrue()
        ->and($policy->view($other, $access))->toBeFalse()
        ->and($policy->view($admin, $access))->toBeTrue();
});

it('maps sensitive lifecycle abilities to granular permissions', function () {
    $admin = User::factory()->create();
    $access = ProgramAccess::factory()->create();
    $policy = app(ProgramAccessPolicy::class);

    foreach ([
        'program-access.suspend' => 'suspend',
        'program-access.revoke' => 'revoke',
        'program-access.extend' => 'extend',
    ] as $permission => $ability) {
        expect($policy->{$ability}($admin, $access))->toBeFalse();
        $admin->givePermissionTo(Permission::findOrCreate($permission, 'web'));
        expect($policy->{$ability}($admin, $access))->toBeTrue();
    }
});

it('requires ownership active period enabled component and valid parent access', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $program = Program::factory()->create();
    $material = ComponentDefinition::query()->where('code', 'material')->firstOrFail();
    ProgramComponent::query()->create([
        'program_id' => $program->id,
        'component_definition_id' => $material->id,
        'is_enabled' => true,
    ]);
    $parent = ProgramAccess::factory()->active()->for($owner)->create();
    $access = ProgramAccess::factory()->active()->for($owner)->for($program)->create([
        'parent_program_access_id' => $parent->id,
        'ends_at' => now()->addDay(),
    ]);
    $gate = app(ComponentAccessGate::class);

    expect($gate->allows($owner, $access, 'material'))->toBeTrue()
        ->and($gate->allows($other, $access, 'material'))->toBeFalse();

    $access->update(['ends_at' => now()->subMinute()]);
    expect($gate->allows($owner, $access->fresh(), 'material'))->toBeFalse();

    $access->update(['ends_at' => now()->addDay(), 'status' => AccessStatus::Suspended]);
    expect($gate->allows($owner, $access->fresh(), 'material'))->toBeFalse();

    $access->update(['status' => AccessStatus::Active]);
    $parent->update(['status' => AccessStatus::Revoked, 'revoked_at' => now()]);
    expect($gate->allows($owner, $access->fresh(), 'material'))->toBeFalse();

    $parent->update(['status' => AccessStatus::Active, 'revoked_at' => null]);
    ProgramComponent::query()->where('program_id', $program->id)->update(['is_enabled' => false]);
    expect($gate->allows($owner, $access->fresh(), 'material'))->toBeFalse();
});
