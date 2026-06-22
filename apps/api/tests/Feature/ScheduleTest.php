<?php

use App\Models\User;
use App\Models\Branch;
use App\Models\Mentor;
use App\Models\MentorSchedule;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesSeeder::class);
    
    // Create branch
    $this->branch = Branch::firstOrCreate(['code' => 'PUSAT'], ['name' => 'Kantor Pusat', 'is_active' => true]);
});

it('allows a student to fetch their own schedules via guest_email', function () {
    // Create student user
    $student = User::factory()->create([
        'email' => 'student@arkanin.com',
        'branch_id' => $this->branch->id,
    ]);
    $student->assignRole('student');
    $student->assignRole(\Spatie\Permission\Models\Role::findByName('student', 'sanctum'));

    // Create mentor user
    $mentorUser = User::factory()->create([
        'email' => 'mentor@arkanin.com',
        'branch_id' => $this->branch->id,
    ]);
    $mentorUser->assignRole('mentor_harian');

    $mentor = Mentor::create([
        'user_id' => $mentorUser->id,
        'specialization' => 'Mathematics',
        'is_active' => true,
    ]);

    // Create schedules
    $scheduleForStudent = MentorSchedule::create([
        'mentor_id' => $mentor->id,
        'title' => 'Math Mentoring Session 1',
        'subject' => 'Math',
        'guest_email' => 'student@arkanin.com',
        'start_time' => '2026-06-23 10:00:00',
        'end_time' => '2026-06-23 11:30:00',
        'status' => 'scheduled',
    ]);

    $scheduleForOther = MentorSchedule::create([
        'mentor_id' => $mentor->id,
        'title' => 'Math Mentoring Session 2',
        'subject' => 'Math',
        'guest_email' => 'other@arkanin.com',
        'start_time' => '2026-06-23 13:00:00',
        'end_time' => '2026-06-23 14:30:00',
        'status' => 'scheduled',
    ]);

    Sanctum::actingAs($student);

    $response = $this->getJson('/api/v1/learning/schedules');

    $response->assertSuccessful();
    $response->assertJsonCount(1);
    $response->assertJsonFragment([
        'title' => 'Math Mentoring Session 1',
        'guest_email' => 'student@arkanin.com',
    ]);
    $response->assertJsonMissing([
        'title' => 'Math Mentoring Session 2',
    ]);
});
