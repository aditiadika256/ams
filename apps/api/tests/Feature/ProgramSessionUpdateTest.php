<?php

use App\Enums\AccessStatus;
use App\Enums\SessionStatus;
use App\Events\ProgramSessionRescheduled;
use App\Listeners\ProjectProgramSessionReschedule;
use App\Models\Mentor;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\ProgramSessionUpdate;
use App\Models\SessionMentorAssignment;
use App\Models\User;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(LazilyRefreshDatabase::class);

it('projects a reschedule after commit to exact participant and mentor inboxes without duplicates', function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $admin = User::factory()->create();
    $admin->givePermissionTo(Permission::findOrCreate('program-session.manage', 'web'));
    $participant = User::factory()->create();
    $mentorUser = User::factory()->create();
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'status' => SessionStatus::Scheduled,
        'starts_at' => '2026-09-03T08:00:00+08:00',
        'ends_at' => '2026-09-03T10:00:00+08:00',
    ]);
    $access = ProgramAccess::factory()->for($participant)->for($program)->for($batch, 'batch')->create([
        'status' => AccessStatus::Active,
    ]);
    $mentor = Mentor::query()->create([
        'user_id' => $mentorUser->id,
        'specialization' => 'Matematika',
        'is_active' => true,
    ]);
    SessionMentorAssignment::query()->create([
        'program_session_id' => $session->id,
        'mentor_id' => $mentor->id,
        'status' => 'ACTIVE',
        'assigned_at' => now(),
    ]);

    $event = new ProgramSessionRescheduled(
        $session->id,
        (string) Illuminate\Support\Str::uuid(),
        [
            ['user_id' => $participant->id, 'program_access_id' => $access->id],
            ['user_id' => $mentorUser->id, 'mentor_id' => $mentor->id],
        ],
        [
            'title' => $session->title,
            'previous_starts_at' => $session->starts_at->toIso8601String(),
            'previous_ends_at' => $session->ends_at->toIso8601String(),
            'starts_at' => '2026-09-04T08:00:00+08:00',
            'ends_at' => '2026-09-04T10:00:00+08:00',
            'timezone' => 'Asia/Makassar',
            'mode' => 'ONLINE',
            'meeting_url' => 'https://meet.example.test/rescheduled',
            'reason' => 'Menyesuaikan jadwal pengajar.',
        ],
        now()->toIso8601String(),
    );
    app(ProjectProgramSessionReschedule::class)->handle($event);
    app(ProjectProgramSessionReschedule::class)->handle($event);

    expect(is_subclass_of(ProgramSessionRescheduled::class, ShouldDispatchAfterCommit::class))->toBeTrue();
    $this->assertDatabaseCount('program_session_updates', 2);
    $participantUpdate = ProgramSessionUpdate::query()->where('recipient_user_id', $participant->id)->firstOrFail();
    $this->assertDatabaseHas('program_session_updates', [
        'recipient_user_id' => $mentorUser->id,
        'mentor_id' => $mentor->id,
        'program_session_id' => $session->id,
    ]);

    Sanctum::actingAs(User::factory()->create());
    $this->postJson("/api/v1/workspace/session-updates/{$participantUpdate->id}/acknowledge")
        ->assertNotFound();

    Sanctum::actingAs($participant);
    $this->getJson('/api/v1/workspace/session-updates')
        ->assertOk()
        ->assertJsonPath('data.0.type', 'SESSION_RESCHEDULED');
    $this->postJson("/api/v1/workspace/session-updates/{$participantUpdate->id}/acknowledge")
        ->assertOk();
    $firstAcknowledgedAt = $participantUpdate->refresh()->acknowledged_at;
    $this->postJson("/api/v1/workspace/session-updates/{$participantUpdate->id}/acknowledge")
        ->assertOk();

    expect($participantUpdate->refresh()->acknowledged_at->equalTo($firstAcknowledgedAt))->toBeTrue();
});
