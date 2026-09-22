<?php

use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesSeeder::class);
});

it('executes full student enrollment flow from registration to workspace access', function () {
    // 1. Student Registers an Account
    $registerResponse = $this->postJson('/api/v1/auth/register', [
        'name' => 'Siswa Baru Bimbel',
        'email' => 'siswa.baru@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertCreated();

    $student = User::where('email', 'siswa.baru@example.com')->firstOrFail();
    expect($student->name)->toBe('Siswa Baru Bimbel');

    // 2. Published Program & Batch available for enrollment
    $program = Program::factory()->published()->create([
        'name' => 'Bootcamp Persiapan CPNS & Kedinasan',
        'slug' => 'bootcamp-cpns-kedinasan',
        'base_price' => '0.00', // Free orientation program
    ]);

    $batch = ProgramBatch::factory()->for($program)->create([
        'name' => 'Batch Gelombang 1',
        'code' => 'CPNS-G1',
    ]);

    // 3. Student authenticates & enrolls into the program
    Sanctum::actingAs($student);

    $enrollResponse = $this->postJson('/api/v1/access/free-enrollments', [
        'program_id' => $program->id,
        'program_batch_id' => $batch->id,
    ])->assertCreated();

    $accessId = $enrollResponse->json('data.id');

    // Verify access record created in database
    $this->assertDatabaseHas('program_accesses', [
        'id' => $accessId,
        'user_id' => $student->id,
        'program_id' => $program->id,
        'status' => 'ACTIVE',
    ]);

    // 4. Student queries their Workspace list
    $workspaceResponse = $this->getJson('/api/v1/workspace')
        ->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.program.id', $program->id)
        ->assertJsonPath('data.data.0.program.name', 'Bootcamp Persiapan CPNS & Kedinasan')
        ->assertJsonPath('data.summary.ACTIVE', 1);

    // 5. Student accesses personal workspace detail for learning
    $this->getJson("/api/v1/workspace/{$accessId}")
        ->assertOk()
        ->assertJsonPath('data.id', $accessId)
        ->assertJsonPath('data.program.name', 'Bootcamp Persiapan CPNS & Kedinasan');
});
