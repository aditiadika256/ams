<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesSeeder::class);
    }

    public function test_registered_user_is_assigned_the_member_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Member Baru',
            'email' => 'member.baru@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.roles.0', 'member');

        $user = User::where('email', 'member.baru@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole('member'));
        $this->assertFalse($user->hasRole('student'));
    }
}
