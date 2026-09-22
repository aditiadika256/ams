<?php

use App\Models\User;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

it('filters protected admin menu entries using the authenticated users dynamic permissions', function (): void {
    $this->seed(MenuSeeder::class);
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->getJson('/api/v1/menus?layout=admin&section=sidebar')
        ->assertOk()
        ->assertJsonMissing(['url' => 'admin://view/components']);

    $user->givePermissionTo(Permission::findOrCreate('component-definition.view', 'web'));
    Sanctum::actingAs($user->fresh());

    $this->getJson('/api/v1/menus?layout=admin&section=sidebar')
        ->assertOk()
        ->assertJsonFragment([
            'url' => 'admin://view/components',
            'required_permission' => 'component-definition.view',
        ]);
});

it('shows all admin menus when requested by a superadmin with a bearer token', function (): void {
    $this->seed(MenuSeeder::class);
    $user = User::factory()->create();
    $role = \Spatie\Permission\Models\Role::findOrCreate('superadmin', 'web');
    $user->assignRole($role);

    $token = $user->createToken('admin-token')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/menus?layout=admin&section=sidebar');

    $response->assertOk();
    $response->assertJsonFragment(['url' => 'admin://view/components']);
    $response->assertJsonFragment(['url' => 'admin://view/users']);
    $response->assertJsonFragment(['url' => 'admin://view/roles']);
    $response->assertJsonFragment(['url' => 'admin://view/settings']);
    $response->assertJsonFragment(['url' => '/telescope']);
});

it('omits protected admin menus for unauthenticated requests', function (): void {
    $this->seed(MenuSeeder::class);

    $response = $this->getJson('/api/v1/menus?layout=admin&section=sidebar');

    $response->assertOk();
    $response->assertJsonMissing(['url' => 'admin://view/components']);
    $response->assertJsonMissing(['url' => 'admin://view/users']);
    $response->assertJsonMissing(['url' => 'admin://view/roles']);
    $response->assertJsonFragment(['url' => 'admin://view/dashboard']);
});

