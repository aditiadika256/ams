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
