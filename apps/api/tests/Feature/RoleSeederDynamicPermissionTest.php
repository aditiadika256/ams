<?php

use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('adds component permissions without resetting assignments managed through the role API', function (): void {
    $this->seed(RolesSeeder::class);

    $role = Role::findByName('admin_operasional', 'web');
    $custom = Permission::findOrCreate('custom.runtime.permission', 'web');
    $role->givePermissionTo($custom);
    $role->revokePermissionTo('view_dashboard_global');

    $this->seed(RolesSeeder::class);

    $role->refresh();

    expect($role->hasPermissionTo($custom))->toBeTrue()
        ->and($role->hasPermissionTo('view_dashboard_global'))->toBeFalse();

    foreach ([
        'component-definition.view',
        'component-definition.create',
        'component-definition.update',
        'component-definition.delete',
        'component-definition.restore',
        'component-definition.force-delete',
        'program-content.view',
        'program-content.manage',
        'program-content.publish',
        'media-asset.upload',
        'media-asset.delete',
    ] as $permission) {
        expect(Permission::query()->where('name', $permission)->where('guard_name', 'web')->exists())->toBeTrue()
            ->and(Permission::query()->where('name', $permission)->where('guard_name', 'sanctum')->exists())->toBeTrue();
    }

    expect(Role::findByName('superadmin', 'web')->hasPermissionTo('component-definition.force-delete'))->toBeTrue();
});
