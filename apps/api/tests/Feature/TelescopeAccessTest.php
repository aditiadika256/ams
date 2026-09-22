<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('protects telescope dashboard in non-local environments', function () {
    // Simulate staging or production
    app()->detectEnvironment(fn () => 'production');

    // Guest request should not be allowed
    $response = $this->get('/telescope');
    expect(in_array($response->status(), [302, 403]))->toBeTrue();

    // Regular member without superadmin role should be denied (403 or redirect)
    $member = User::factory()->create(['email' => 'member@example.com']);
    $this->actingAs($member);
    $responseMember = $this->get('/telescope');
    expect(in_array($responseMember->status(), [302, 403]))->toBeTrue();

    // Superadmin user should have access granted
    $superadminRole = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
    $admin = User::factory()->create(['email' => 'superadmin@arkanin.com']);
    $admin->assignRole($superadminRole);

    $this->actingAs($admin);
    $responseAdmin = $this->get('/telescope');
    $responseAdmin->assertSuccessful();
});
