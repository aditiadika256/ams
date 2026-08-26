<?php

use App\Enums\BatchStatus;
use App\Enums\SessionStatus;
use App\Models\Mentor;
use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use App\Models\SessionMentorReservation;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $this->authenticateWith = function (array $permissions): User {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
        }

        Sanctum::actingAs($user);

        return $user;
    };

    $this->validBatch = fn (): array => [
        'name' => 'Batch Agustus',
        'code' => 'AUG-26',
        'registration_starts_at' => '2026-08-21T00:00:00+08:00',
        'registration_ends_at' => '2026-08-30T00:00:00+08:00',
        'starts_at' => '2026-09-01T08:00:00+08:00',
        'ends_at' => '2026-10-01T08:00:00+08:00',
        'capacity' => 30,
        'mode' => 'ONLINE',
        'timezone' => 'Asia/Makassar',
        'price_override' => '250000.00',
    ];

    $this->validSession = fn (): array => [
        'title' => 'Pertemuan Pertama',
        'starts_at' => '2026-09-02T08:00:00+08:00',
        'ends_at' => '2026-09-02T10:00:00+08:00',
        'timezone' => 'Asia/Makassar',
        'mode' => 'ONLINE',
        'meeting_url' => 'https://meet.example.test/session-one',
        'capacity' => 20,
    ];
});

it('manages batches through scoped program routes and validates delivery fields', function () {
    $program = Program::factory()->create();
    $otherProgram = Program::factory()->create();
    ($this->authenticateWith)(['program-batch.manage']);

    $batchId = $this->postJson("/api/v1/admin/programs/{$program->id}/batches", ($this->validBatch)())
        ->assertCreated()
        ->assertJsonPath('data.code', 'AUG-26')
        ->assertJsonPath('data.status', 'DRAFT')
        ->json('data.id');

    $this->getJson("/api/v1/admin/programs/{$otherProgram->id}/batches/{$batchId}")
        ->assertNotFound();

    $this->postJson("/api/v1/admin/programs/{$program->id}/batches", [
        ...($this->validBatch)(),
        'code' => 'INVALID',
        'starts_at' => '2026-10-01T08:00:00+08:00',
        'ends_at' => '2026-09-01T08:00:00+08:00',
        'capacity' => 0,
        'mode' => 'REMOTE',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['ends_at', 'capacity', 'mode']);
});

it('enforces the batch lifecycle with machine readable conflicts', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create(['status' => BatchStatus::Draft]);
    ($this->authenticateWith)(['program-batch.manage']);

    $this->postJson("/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/transition", [
        'status' => 'COMPLETED',
        'reason' => 'Melompati lifecycle.',
    ])->assertConflict()->assertJsonPath('code', 'INVALID_BATCH_TRANSITION');

    $this->postJson("/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/transition", [
        'status' => 'OPEN',
        'reason' => 'Membuka pendaftaran.',
    ])->assertOk()->assertJsonPath('data.status', 'OPEN');
});

it('manages sessions only inside their scoped batch and validates mode and period', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $otherBatch = ProgramBatch::factory()->for($program)->create();
    ($this->authenticateWith)(['program-session.manage']);

    $sessionId = $this->postJson(
        "/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions",
        ($this->validSession)(),
    )->assertCreated()->assertJsonPath('data.status', 'DRAFT')->json('data.id');

    $this->getJson(
        "/api/v1/admin/programs/{$program->id}/batches/{$otherBatch->id}/sessions/{$sessionId}",
    )->assertNotFound();

    $this->postJson("/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions", [
        ...($this->validSession)(),
        'title' => 'Invalid Session',
        'starts_at' => '2026-09-02T11:00:00+08:00',
        'ends_at' => '2026-09-02T10:00:00+08:00',
        'mode' => 'OFFLINE',
        'location' => null,
    ])->assertUnprocessable()->assertJsonValidationErrors(['ends_at', 'location']);
});

it('audits rescheduling and prevents capacity below existing reservations', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'status' => SessionStatus::Scheduled,
        'reserved_count' => 8,
        'capacity' => 10,
    ]);
    ($this->authenticateWith)(['program-session.manage']);

    $this->putJson("/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions/{$session->id}", [
        'starts_at' => '2026-09-03T08:00:00+08:00',
        'ends_at' => '2026-09-03T10:00:00+08:00',
        'capacity' => 7,
        'reason' => 'Menyesuaikan agenda mentor.',
    ])->assertUnprocessable()->assertJsonValidationErrors('capacity');

    $this->putJson("/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions/{$session->id}", [
        'starts_at' => '2026-09-03T08:00:00+08:00',
        'ends_at' => '2026-09-03T10:00:00+08:00',
        'capacity' => 10,
        'reason' => 'Menyesuaikan agenda mentor.',
    ])->assertOk();

    $this->assertDatabaseHas('audit_logs', [
        'entity_id' => $session->id,
        'action' => 'session.rescheduled',
        'reason' => 'Menyesuaikan agenda mentor.',
    ]);
});

it('rejects rescheduling that would overlap an assigned mentor schedule', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'status' => SessionStatus::Scheduled,
        'starts_at' => '2026-09-03T08:00:00+08:00',
        'ends_at' => '2026-09-03T10:00:00+08:00',
    ]);
    $otherSession = ProgramSession::factory()->for($batch, 'batch')->create([
        'status' => SessionStatus::Scheduled,
        'starts_at' => '2026-09-03T11:00:00+08:00',
        'ends_at' => '2026-09-03T13:00:00+08:00',
    ]);
    $mentor = Mentor::query()->create([
        'user_id' => User::factory()->create()->id,
        'specialization' => 'Matematika',
        'is_active' => true,
    ]);

    foreach ([$session, $otherSession] as $assignedSession) {
        SessionMentorAssignment::query()->create([
            'program_session_id' => $assignedSession->id,
            'mentor_id' => $mentor->id,
            'status' => 'ACTIVE',
            'assigned_at' => now(),
        ]);
    }

    ($this->authenticateWith)(['program-session.manage']);
    $originalStartsAt = $session->starts_at->toIso8601String();

    $this->putJson("/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions/{$session->id}", [
        'starts_at' => '2026-09-03T12:00:00+08:00',
        'ends_at' => '2026-09-03T14:00:00+08:00',
        'reason' => 'Memindahkan jadwal kelas.',
    ])->assertUnprocessable()->assertJsonPath('code', 'MENTOR_SCHEDULE_CONFLICT');

    $session->refresh();
    expect($session->starts_at->toIso8601String())->toBe($originalStartsAt);

    $otherSession->update(['status' => SessionStatus::Completed]);
    $this->putJson("/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions/{$session->id}", [
        'starts_at' => '2026-09-03T12:00:00+08:00',
        'ends_at' => '2026-09-03T14:00:00+08:00',
        'reason' => 'Memindahkan setelah sesi lain selesai.',
    ])->assertOk();
});

it('enforces the session lifecycle', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create(['status' => SessionStatus::Draft]);
    ($this->authenticateWith)(['program-session.manage']);

    $url = "/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions/{$session->id}/transition";

    $this->postJson($url, [
        'status' => 'COMPLETED',
        'reason' => 'Melompati lifecycle.',
    ])->assertConflict()->assertJsonPath('code', 'INVALID_SESSION_TRANSITION');

    $this->postJson($url, [
        'status' => 'SCHEDULED',
        'reason' => 'Jadwal sudah final.',
    ])->assertOk()->assertJsonPath('data.status', 'SCHEDULED');
});

it('requires an active eligible mentor and rejects overlapping active assignments', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'starts_at' => '2026-09-05T08:00:00+08:00',
        'ends_at' => '2026-09-05T10:00:00+08:00',
    ]);
    $overlap = ProgramSession::factory()->for($batch, 'batch')->create([
        'starts_at' => '2026-09-05T09:00:00+08:00',
        'ends_at' => '2026-09-05T11:00:00+08:00',
    ]);
    $mentorUser = User::factory()->create();
    $mentorUser->givePermissionTo(Permission::findOrCreate('view_dashboard_learning', 'web'));
    $mentor = Mentor::query()->create([
        'user_id' => $mentorUser->id,
        'specialization' => 'Matematika',
        'is_active' => false,
    ]);
    ($this->authenticateWith)(['mentor-assignment.manage']);

    $baseUrl = "/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions";
    $payload = ['mentor_id' => $mentor->id, 'role' => 'lead', 'reason' => 'Menetapkan mentor kelas.'];

    $this->postJson("{$baseUrl}/{$session->id}/mentor-assignments", $payload)
        ->assertUnprocessable()->assertJsonPath('code', 'MENTOR_NOT_ELIGIBLE');

    $mentor->update(['is_active' => true]);
    $this->getJson('/api/v1/admin/mentor-options')
        ->assertOk()
        ->assertJsonPath('data.0.id', $mentor->id);
    $this->postJson("{$baseUrl}/{$session->id}/mentor-assignments", $payload)->assertCreated();

    $this->postJson("{$baseUrl}/{$overlap->id}/mentor-assignments", $payload)
        ->assertUnprocessable()->assertJsonPath('code', 'MENTOR_SCHEDULE_CONFLICT');

    $session->update(['status' => SessionStatus::Completed]);
    $this->postJson("{$baseUrl}/{$overlap->id}/mentor-assignments", $payload)->assertCreated();

    $draft = ProgramSession::factory()->for($batch, 'batch')->create(['status' => SessionStatus::Draft]);
    $this->postJson("{$baseUrl}/{$draft->id}/mentor-assignments", $payload)
        ->assertUnprocessable()->assertJsonPath('code', 'MENTOR_ASSIGNMENT_NOT_ALLOWED');
});

it('keeps assignment history while allowing only one active mentor assignment per session', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create();
    $mentorUser = User::factory()->create();
    $mentorUser->givePermissionTo(Permission::findOrCreate('view_dashboard_learning', 'web'));
    $mentor = Mentor::query()->create([
        'user_id' => $mentorUser->id,
        'specialization' => 'Fisika',
        'is_active' => true,
    ]);
    ($this->authenticateWith)(['mentor-assignment.manage']);

    $url = "/api/v1/admin/programs/{$program->id}/batches/{$batch->id}/sessions/{$session->id}/mentor-assignments";
    $payload = ['mentor_id' => $mentor->id, 'role' => 'lead', 'reason' => 'Menetapkan mentor utama.'];

    $assignmentId = $this->postJson($url, $payload)->assertCreated()->json('data.id');
    $access = \App\Models\ProgramAccess::factory()->active()->for($program)->for($batch, 'batch')->create();
    SessionMentorReservation::query()->create([
        'session_mentor_assignment_id' => $assignmentId,
        'program_session_id' => $session->id,
        'program_access_id' => $access->id,
        'status' => 'ACTIVE',
        'idempotency_key' => 'assignment-release',
        'reserved_at' => now(),
    ]);
    SessionMentorAssignment::query()->whereKey($assignmentId)->update(['reserved_count' => 1]);
    $this->postJson($url, $payload)
        ->assertUnprocessable()->assertJsonPath('code', 'MENTOR_ASSIGNMENT_EXISTS');

    $this->deleteJson("{$url}/{$assignmentId}", ['reason' => 'Mengakhiri penugasan lama.'])
        ->assertNoContent();
    $this->postJson($url, $payload)->assertCreated();

    $this->assertDatabaseCount('session_mentor_assignments', 2);
    $this->assertDatabaseHas('session_mentor_assignments', [
        'id' => $assignmentId,
        'status' => 'ENDED',
        'reserved_count' => 0,
    ]);
    $this->assertDatabaseHas('session_mentor_reservations', [
        'session_mentor_assignment_id' => $assignmentId,
        'status' => 'RELEASED',
    ]);
});
