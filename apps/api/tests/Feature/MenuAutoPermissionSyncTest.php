<?php

use App\Models\Menu;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('automatically creates permissions and assigns them to superadmin and direktur when a menu is created', function (): void {
    $this->seed(RolesSeeder::class);

    $superadminRole = Role::findByName('superadmin', 'web');
    $direkturRole = Role::findByName('direktur', 'web');

    expect(Permission::where('name', 'custom-audit.view')->exists())->toBeFalse();

    // Create a new menu requiring a brand new permission
    $menu = Menu::create([
        'name' => 'Custom Audit',
        'url' => 'admin://view/custom-audit',
        'layout' => 'admin',
        'section' => 'sidebar',
        'required_permission' => 'custom-audit.view',
    ]);

    expect(Permission::where('name', 'custom-audit.view')->where('guard_name', 'web')->exists())->toBeTrue()
        ->and(Permission::where('name', 'custom-audit.view')->where('guard_name', 'sanctum')->exists())->toBeTrue()
        ->and($superadminRole->fresh()->hasPermissionTo('custom-audit.view'))->toBeTrue()
        ->and($direkturRole->fresh()->hasPermissionTo('custom-audit.view'))->toBeTrue();
});

it('handles multiple pipe-separated permissions and grants all of them to superadmin and direktur', function (): void {
    $this->seed(RolesSeeder::class);

    $superadminRole = Role::findByName('superadmin', 'web');

    $menu = Menu::create([
        'name' => 'Special Workspace',
        'url' => 'admin://view/special-workspace',
        'layout' => 'admin',
        'section' => 'sidebar',
        'required_permission' => 'feature-alpha.view|feature-beta.manage',
    ]);

    expect(Permission::where('name', 'feature-alpha.view')->where('guard_name', 'web')->exists())->toBeTrue()
        ->and(Permission::where('name', 'feature-beta.manage')->where('guard_name', 'web')->exists())->toBeTrue()
        ->and($superadminRole->fresh()->hasPermissionTo('feature-alpha.view'))->toBeTrue()
        ->and($superadminRole->fresh()->hasPermissionTo('feature-beta.manage'))->toBeTrue();
});

it('allows superadmin to create menu with new permission via API endpoint without validation failure', function (): void {
    $this->seed(RolesSeeder::class);

    $superadmin = User::firstOrCreate(
        ['email' => 'superadmin@arkanin.com'],
        ['name' => 'Super Admin', 'password' => bcrypt('password')]
    );
    $superadmin->assignRole('superadmin');
    Sanctum::actingAs($superadmin);

    $response = $this->postJson('/api/v1/admin/menus', [
        'name' => 'Brand New Feature',
        'url' => 'admin://view/brand-new-feature',
        'layout' => 'admin',
        'section' => 'sidebar',
        'required_permission' => 'brand-new-feature.view',
    ]);

    $response->assertStatus(201);

    expect(Permission::where('name', 'brand-new-feature.view')->where('guard_name', 'web')->exists())->toBeTrue()
        ->and(Role::findByName('superadmin', 'web')->hasPermissionTo('brand-new-feature.view'))->toBeTrue();
});
