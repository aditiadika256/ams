<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleGuardConsistencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('superadmin');
        Sanctum::actingAs($admin);
    }

    public function test_roles_can_be_filtered_to_the_users_default_guard_without_duplicate_names(): void
    {
        $response = $this->getJson('/api/v1/admin/roles?guard_name=web')
            ->assertOk();

        $roles = collect($response->json('data'));

        $this->assertNotEmpty($roles);
        $this->assertSame(['web'], $roles->pluck('guard_name')->unique()->values()->all());
        $this->assertSame(
            $roles->pluck('name')->count(),
            $roles->pluck('name')->unique()->count()
        );
    }

    public function test_role_list_rejects_an_unknown_guard(): void
    {
        $this->getJson('/api/v1/admin/roles?guard_name=unknown')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('guard_name');
    }

    public function test_user_creation_rejects_a_role_that_only_exists_for_sanctum(): void
    {
        Role::create([
            'name' => 'sanctum_only',
            'guard_name' => 'sanctum',
        ]);

        $this->postJson('/api/v1/admin/users', [
            'name' => 'Guard Test',
            'email' => 'guard-test@example.com',
            'password' => 'password123',
            'role' => 'sanctum_only',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('role');
    }

    public function test_user_creation_assigns_the_canonical_web_role(): void
    {
        $response = $this->postJson('/api/v1/admin/users', [
            'name' => 'Web Role User',
            'email' => 'web-role@example.com',
            'password' => 'password123',
            'role' => 'student',
        ])->assertCreated();

        $user = User::findOrFail($response->json('data.id'));

        $this->assertTrue($user->hasRole('student', 'web'));
    }

    public function test_user_update_rejects_a_role_that_only_exists_for_sanctum(): void
    {
        Role::create([
            'name' => 'sanctum_update_only',
            'guard_name' => 'sanctum',
        ]);
        $user = User::factory()->create();
        $user->assignRole('student');

        $this->putJson("/api/v1/admin/users/{$user->id}", [
            'role' => 'sanctum_update_only',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('role');

        $this->assertTrue($user->refresh()->hasRole('student', 'web'));
    }
}
