<?php

use App\Models\ComponentDefinition;
use App\Models\Mentor;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use App\Models\SessionMentorReservation;
use App\Models\User;
use Database\Seeders\ComponentDefinitionSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(ComponentDefinitionSeeder::class);
});

it('reserves a student selected mentor slot idempotently and enforces capacity', function () {
    $program = Program::factory()->create();
    $meeting = ComponentDefinition::query()->where('code', 'meeting')->firstOrFail();
    $program->components()->create([
        'component_definition_id' => $meeting->id,
        'is_enabled' => true,
    ]);
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'mentor_assignment_mode' => 'STUDENT',
    ]);
    $mentorUser = User::factory()->create();
    $mentorUser->givePermissionTo(Permission::findOrCreate('view_dashboard_learning', 'web'));
    $mentor = Mentor::query()->create([
        'user_id' => $mentorUser->id,
        'specialization' => 'Matematika',
        'is_active' => true,
    ]);
    $admin = User::factory()->create();
    $admin->givePermissionTo(Permission::findOrCreate('mentor-assignment.manage', 'web'));
    Sanctum::actingAs($admin);

    $assignmentId = $this->postJson("/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions/{$session->id}/mentor-assignments", [
        'mentor_id' => $mentor->id,
        'role' => 'lead',
        'capacity' => 1,
        'reason' => 'Membuka satu slot mentor.',
    ])->assertCreated()->json('data.id');

    $firstUser = User::factory()->create();
    $firstAccess = ProgramAccess::factory()->active()->for($firstUser)->for($program)->create([
        'program_batch_id' => $batch->id,
    ]);
    Sanctum::actingAs($firstUser);
    $url = "/api/v1/workspace/accesses/{$firstAccess->id}/sessions/{$session->id}/mentor-reservations";

    $firstReservationId = $this->postJson($url, [
        'mentor_assignment_id' => $assignmentId,
        'idempotency_key' => 'student-mentor-choice',
    ])->assertCreated()
        ->assertJsonPath('data.mentor.name', $mentorUser->name)
        ->json('data.id');

    $this->postJson($url, [
        'mentor_assignment_id' => $assignmentId,
        'idempotency_key' => 'student-mentor-choice',
    ])->assertOk()->assertJsonPath('data.id', $firstReservationId);

    expect(SessionMentorReservation::query()->count())->toBe(1)
        ->and(SessionMentorAssignment::query()->findOrFail($assignmentId)->reserved_count)->toBe(1);

    $secondUser = User::factory()->create();
    $secondAccess = ProgramAccess::factory()->active()->for($secondUser)->for($program)->create([
        'program_batch_id' => $batch->id,
    ]);
    Sanctum::actingAs($secondUser);

    $this->postJson("/api/v1/workspace/accesses/{$secondAccess->id}/sessions/{$session->id}/mentor-reservations", [
        'mentor_assignment_id' => $assignmentId,
        'idempotency_key' => 'second-student-choice',
    ])->assertConflict()->assertJsonPath('code', 'MENTOR_SLOT_FULL');
});

it('limits mentor participants to the active assignment scope', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'mentor_assignment_mode' => 'STUDENT',
    ]);
    $mentorUser = User::factory()->create();
    $mentorUser->givePermissionTo(Permission::findOrCreate('view_dashboard_learning', 'web'));
    $mentor = Mentor::query()->create([
        'user_id' => $mentorUser->id,
        'specialization' => 'Bahasa',
        'is_active' => true,
    ]);
    $assignment = SessionMentorAssignment::query()->create([
        'program_session_id' => $session->id,
        'mentor_id' => $mentor->id,
        'role' => 'lead',
        'status' => 'ACTIVE',
        'capacity' => 2,
        'reserved_count' => 1,
        'assigned_at' => now(),
    ]);
    $selectedUser = User::factory()->create();
    $selected = ProgramAccess::factory()->active()->for($selectedUser)->for($program)->create([
        'program_batch_id' => $batch->id,
    ]);
    $unselected = ProgramAccess::factory()->active()->for($program)->create([
        'program_batch_id' => $batch->id,
    ]);
    SessionMentorReservation::query()->create([
        'session_mentor_assignment_id' => $assignment->id,
        'program_session_id' => $session->id,
        'program_access_id' => $selected->id,
        'status' => 'ACTIVE',
        'idempotency_key' => 'participant-scope',
        'reserved_at' => now(),
    ]);
    Sanctum::actingAs($mentorUser);

    $this->getJson("/api/v1/mentor/sessions/{$session->id}/participants")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.program_access_id', $selected->id)
        ->assertJsonMissing(['program_access_id' => $unselected->id]);

    $mentorUser->revokePermissionTo(Permission::findByName('view_dashboard_learning', 'web'));
    $this->getJson("/api/v1/mentor/sessions/{$session->id}/participants")->assertForbidden();

    Sanctum::actingAs(User::factory()->create());
    $this->getJson("/api/v1/mentor/sessions/{$session->id}/participants")->assertNotFound();
});

it('scopes reservation idempotency per access and rejects draft sessions', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'mentor_assignment_mode' => 'STUDENT',
        'status' => 'SCHEDULED',
    ]);
    $mentor = Mentor::query()->create([
        'user_id' => User::factory()->create()->id,
        'specialization' => 'Kimia',
        'is_active' => true,
    ]);
    $assignment = SessionMentorAssignment::query()->create([
        'program_session_id' => $session->id,
        'mentor_id' => $mentor->id,
        'status' => 'ACTIVE',
        'assigned_at' => now(),
    ]);

    foreach ([User::factory()->create(), User::factory()->create()] as $user) {
        $access = ProgramAccess::factory()->active()->for($user)->for($program)->create(['program_batch_id' => $batch->id]);
        Sanctum::actingAs($user);
        $this->postJson("/api/v1/workspace/accesses/{$access->id}/sessions/{$session->id}/mentor-reservations", [
            'mentor_assignment_id' => $assignment->id,
            'idempotency_key' => 'same-client-key',
        ])->assertCreated();
    }

    expect(SessionMentorReservation::query()->where('idempotency_key', 'same-client-key')->count())->toBe(2);

    $draft = ProgramSession::factory()->for($batch, 'batch')->create([
        'mentor_assignment_mode' => 'STUDENT',
        'status' => 'DRAFT',
    ]);
    $draftAssignment = SessionMentorAssignment::query()->create([
        'program_session_id' => $draft->id,
        'mentor_id' => $mentor->id,
        'status' => 'ACTIVE',
        'assigned_at' => now(),
    ]);
    $user = User::factory()->create();
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create(['program_batch_id' => $batch->id]);
    Sanctum::actingAs($user);
    $this->postJson("/api/v1/workspace/accesses/{$access->id}/sessions/{$draft->id}/mentor-reservations", [
        'mentor_assignment_id' => $draftAssignment->id,
        'idempotency_key' => 'draft-session',
    ])->assertConflict()->assertJsonPath('code', 'MENTOR_SELECTION_NOT_ALLOWED');
});

it('rejects student selection when a session uses admin assignment mode', function () {
    $user = User::factory()->create();
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'mentor_assignment_mode' => 'ADMIN',
    ]);
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create([
        'program_batch_id' => $batch->id,
    ]);
    $mentor = Mentor::query()->create([
        'user_id' => User::factory()->create()->id,
        'specialization' => 'Fisika',
        'is_active' => true,
    ]);
    $assignment = SessionMentorAssignment::query()->create([
        'program_session_id' => $session->id,
        'mentor_id' => $mentor->id,
        'role' => 'lead',
        'status' => 'ACTIVE',
        'capacity' => 1,
        'assigned_at' => now(),
    ]);
    Sanctum::actingAs($user);

    $this->postJson("/api/v1/workspace/accesses/{$access->id}/sessions/{$session->id}/mentor-reservations", [
        'mentor_assignment_id' => $assignment->id,
        'idempotency_key' => 'admin-mode-selection',
    ])->assertConflict()->assertJsonPath('code', 'MENTOR_SELECTION_NOT_ALLOWED');
});

it('allows a student to select a replacement after the previous assignment ends', function () {
    $user = User::factory()->create();
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'mentor_assignment_mode' => 'STUDENT',
        'status' => 'SCHEDULED',
    ]);
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create([
        'program_batch_id' => $batch->id,
    ]);
    $assignments = collect([1, 2])->map(function (int $index) use ($session): SessionMentorAssignment {
        $mentor = Mentor::query()->create([
            'user_id' => User::factory()->create()->id,
            'specialization' => "Mentor {$index}",
            'is_active' => true,
        ]);

        return SessionMentorAssignment::query()->create([
            'program_session_id' => $session->id,
            'mentor_id' => $mentor->id,
            'status' => 'ACTIVE',
            'assigned_at' => now(),
        ]);
    });
    Sanctum::actingAs($user);
    $url = "/api/v1/workspace/accesses/{$access->id}/sessions/{$session->id}/mentor-reservations";

    $this->postJson($url, [
        'mentor_assignment_id' => $assignments[0]->id,
        'idempotency_key' => "mentor:{$access->id}:{$session->id}:{$assignments[0]->id}",
    ])->assertCreated();

    SessionMentorReservation::query()->where('program_access_id', $access->id)->update([
        'status' => 'RELEASED',
        'released_at' => now(),
    ]);
    $assignments[0]->update(['status' => 'ENDED', 'ended_at' => now()]);

    $this->postJson($url, [
        'mentor_assignment_id' => $assignments[1]->id,
        'idempotency_key' => "mentor:{$access->id}:{$session->id}:{$assignments[1]->id}",
    ])->assertCreated()->assertJsonPath('data.mentor.name', $assignments[1]->mentor->user->name);

    expect(SessionMentorReservation::query()->where('program_access_id', $access->id)->count())->toBe(2);
});
