<?php

namespace Tests\Feature;

use App\Models\Mentor;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MentorManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesSeeder::class);
    }

    public function test_learning_manager_can_list_mentor_candidates_without_user_management_permission(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('mentor_utama');

        $candidate = User::factory()->create([
            'name' => 'Aditia Dika',
            'email' => 'aditia@example.com',
        ]);
        $candidate->assignRole('student');

        Sanctum::actingAs($manager);

        $this->getJson('/api/v1/learning/mentor-candidates')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $candidate->id,
                'name' => 'Aditia Dika',
                'email' => 'aditia@example.com',
            ]);
    }

    public function test_creating_mentor_profile_replaces_student_role_with_canonical_mentor_role(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('mentor_utama');

        $candidate = User::factory()->create();
        $candidate->assignRole('student');

        Sanctum::actingAs($manager);

        $this->postJson('/api/v1/learning/mentors', [
            'user_id' => $candidate->id,
            'specialization' => 'Frontend Development',
            'bio' => 'Mentor frontend.',
            'experience_years' => 5,
            'is_active' => true,
        ])->assertCreated()
            ->assertJsonPath('user.roles.0.name', 'mentor_harian')
            ->assertJsonPath('user.roles.0.guard_name', 'web');

        $this->assertDatabaseHas('mentors', [
            'user_id' => $candidate->id,
            'specialization' => 'Frontend Development',
        ]);

        $candidate->refresh()->unsetRelation('roles');

        $this->assertFalse($candidate->hasRole('student'));
        $this->assertTrue($candidate->hasRole('mentor_harian'));
        $this->assertFalse($candidate->hasRole('mentor_utama'));
        $this->assertSame(['mentor_harian'], $candidate->getRoleNames()->values()->all());
        $this->assertSame('web', $candidate->roles()->sole()->guard_name);
    }

    public function test_student_cannot_create_a_mentor_profile(): void
    {
        $student = User::factory()->create();
        $student->assignRole('student');
        $candidate = User::factory()->create();
        $mentor = Mentor::create([
            'user_id' => User::factory()->create()->id,
            'specialization' => 'Backend Development',
        ]);

        Sanctum::actingAs($student);

        $this->getJson('/api/v1/learning/mentor-candidates')
            ->assertForbidden();

        $this->postJson('/api/v1/learning/mentors', [
            'user_id' => $candidate->id,
            'specialization' => 'Frontend Development',
            'experience_years' => 1,
        ])->assertForbidden();

        $this->putJson("/api/v1/learning/mentors/{$mentor->id}", [
            'specialization' => 'Changed specialization',
        ])->assertForbidden();

        $this->deleteJson("/api/v1/learning/mentors/{$mentor->id}")
            ->assertForbidden();

        $this->assertDatabaseMissing('mentors', [
            'user_id' => $candidate->id,
        ]);
        $this->assertDatabaseHas('mentors', [
            'id' => $mentor->id,
            'specialization' => 'Backend Development',
        ]);
    }

    public function test_existing_mentor_is_not_returned_as_a_candidate(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('mentor_utama');

        $availableUser = User::factory()->create();
        $existingMentorUser = User::factory()->create();
        Mentor::create([
            'user_id' => $existingMentorUser->id,
            'specialization' => 'Backend Development',
        ]);

        Sanctum::actingAs($manager);

        $response = $this->getJson('/api/v1/learning/mentor-candidates')
            ->assertOk();

        $candidateIds = collect($response->json('data'))->pluck('id');

        $this->assertTrue($candidateIds->contains($availableUser->id));
        $this->assertFalse($candidateIds->contains($existingMentorUser->id));
    }

    public function test_user_cannot_have_more_than_one_mentor_profile(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('mentor_utama');
        $candidate = User::factory()->create();
        $candidate->assignRole('student');

        Mentor::create([
            'user_id' => $candidate->id,
            'specialization' => 'Backend Development',
        ]);

        Sanctum::actingAs($manager);

        $this->postJson('/api/v1/learning/mentors', [
            'user_id' => $candidate->id,
            'specialization' => 'Frontend Development',
            'experience_years' => 3,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('user_id');

        $this->assertSame(1, Mentor::query()->where('user_id', $candidate->id)->count());
        $this->assertTrue($candidate->refresh()->hasRole('student'));
    }

    public function test_creating_a_mentor_invalidates_the_cached_mentor_list(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('mentor_utama');
        $candidate = User::factory()->create();

        Sanctum::actingAs($manager);

        $this->getJson('/api/v1/learning/mentors')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $response = $this->postJson('/api/v1/learning/mentors', [
            'user_id' => $candidate->id,
            'specialization' => 'Frontend Development',
            'experience_years' => 3,
        ])->assertCreated();

        $this->getJson('/api/v1/learning/mentors')
            ->assertOk()
            ->assertJsonFragment(['id' => $response->json('id')]);
    }
}
