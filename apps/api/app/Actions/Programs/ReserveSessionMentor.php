<?php

namespace App\Actions\Programs;

use App\Enums\AccessStatus;
use App\Enums\MentorAssignmentMode;
use App\Enums\SessionStatus;
use App\Exceptions\DomainConflictException;
use App\Models\ProgramAccess;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use App\Models\SessionMentorReservation;
use Illuminate\Support\Facades\DB;

class ReserveSessionMentor
{
    public function handle(
        ProgramAccess $access,
        ProgramSession $session,
        int $assignmentId,
        string $idempotencyKey,
    ): SessionMentorReservation {
        return DB::transaction(function () use ($access, $session, $assignmentId, $idempotencyKey): SessionMentorReservation {
            $access = ProgramAccess::query()->lockForUpdate()->findOrFail($access->id);
            $session = ProgramSession::query()->lockForUpdate()->findOrFail($session->id);

            if ($session->mentor_assignment_mode === MentorAssignmentMode::Admin) {
                throw new DomainConflictException(
                    'MENTOR_SELECTION_NOT_ALLOWED',
                    'Session menggunakan penugasan mentor oleh admin.',
                );
            }

            $replay = SessionMentorReservation::query()
                ->where('program_access_id', $access->id)
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($replay !== null) {
                if ($replay->program_access_id !== $access->id
                    || $replay->program_session_id !== $session->id
                    || $replay->session_mentor_assignment_id !== $assignmentId) {
                    throw new DomainConflictException('IDEMPOTENCY_KEY_CONFLICT', 'Idempotency key digunakan untuk pilihan mentor berbeda.');
                }

                return $replay->load('assignment.mentor.user:id,name');
            }

            if ($access->status !== AccessStatus::Active
                || $access->program_batch_id !== $session->program_batch_id
                || ($access->starts_at !== null && $access->starts_at->isFuture())
                || ($access->ends_at !== null && ! $access->ends_at->isFuture())
                || ! in_array($session->status, [SessionStatus::Scheduled, SessionStatus::Ongoing], true)
                || ! $session->ends_at->isFuture()) {
                throw new DomainConflictException('MENTOR_SELECTION_NOT_ALLOWED', 'Enrollment atau Session tidak menerima pemilihan mentor.');
            }

            $assignment = SessionMentorAssignment::query()->lockForUpdate()->findOrFail($assignmentId);

            if ($assignment->program_session_id !== $session->id || $assignment->status !== 'ACTIVE') {
                throw new DomainConflictException('MENTOR_ASSIGNMENT_UNAVAILABLE', 'Assignment mentor tidak tersedia untuk Session ini.');
            }

            $existing = SessionMentorReservation::query()
                ->where('program_session_id', $session->id)
                ->where('program_access_id', $access->id)
                ->where('status', 'ACTIVE')
                ->first();

            if ($existing !== null) {
                return $existing->load('assignment.mentor.user:id,name');
            }

            if ($assignment->capacity !== null && $assignment->reserved_count >= $assignment->capacity) {
                throw new DomainConflictException('MENTOR_SLOT_FULL', 'Kapasitas mentor untuk Session ini sudah penuh.');
            }

            $reservation = SessionMentorReservation::query()->create([
                'session_mentor_assignment_id' => $assignment->id,
                'program_session_id' => $session->id,
                'program_access_id' => $access->id,
                'status' => 'ACTIVE',
                'idempotency_key' => $idempotencyKey,
                'reserved_at' => now(),
            ]);
            $assignment->increment('reserved_count');

            return $reservation->load('assignment.mentor.user:id,name');
        });
    }
}
