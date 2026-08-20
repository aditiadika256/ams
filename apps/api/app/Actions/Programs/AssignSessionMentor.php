<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Exceptions\MentorAssignmentException;
use App\Models\Mentor;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AssignSessionMentor
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function assign(
        ProgramSession $session,
        int $mentorId,
        string $role,
        array $metadata,
        User $actor,
        string $reason,
    ): SessionMentorAssignment {
        return DB::transaction(function () use (
            $session,
            $mentorId,
            $role,
            $metadata,
            $actor,
            $reason,
        ): SessionMentorAssignment {
            $mentor = Mentor::query()->with('user')->lockForUpdate()->findOrFail($mentorId);
            $session = ProgramSession::query()->lockForUpdate()->findOrFail($session->id);

            if (! $mentor->is_active || ! $mentor->user->hasPermissionTo('view_dashboard_learning', 'web')) {
                throw new MentorAssignmentException(
                    'MENTOR_NOT_ELIGIBLE',
                    'Mentor tidak aktif atau tidak memiliki permission pembelajaran.',
                    ['mentor_id' => $mentor->id],
                );
            }

            if (SessionMentorAssignment::query()
                ->where('program_session_id', $session->id)
                ->where('mentor_id', $mentor->id)
                ->where('status', 'ACTIVE')
                ->exists()) {
                throw new MentorAssignmentException(
                    'MENTOR_ASSIGNMENT_EXISTS',
                    'Mentor sudah aktif pada Session ini.',
                    ['mentor_id' => $mentor->id, 'program_session_id' => $session->id],
                );
            }

            $conflict = SessionMentorAssignment::query()
                ->where('mentor_id', $mentor->id)
                ->where('status', 'ACTIVE')
                ->whereHas('session', fn ($query) => $query
                    ->where('id', '!=', $session->id)
                    ->where('starts_at', '<', $session->ends_at)
                    ->where('ends_at', '>', $session->starts_at))
                ->exists();

            if ($conflict) {
                throw new MentorAssignmentException(
                    'MENTOR_SCHEDULE_CONFLICT',
                    'Mentor memiliki assignment aktif pada jadwal yang beririsan.',
                    ['mentor_id' => $mentor->id],
                );
            }

            $assignment = SessionMentorAssignment::query()->create([
                'program_session_id' => $session->id,
                'mentor_id' => $mentor->id,
                'role' => $role,
                'status' => 'ACTIVE',
                'assigned_at' => now(),
                'metadata' => $metadata,
            ]);

            $this->audit->handle(
                $assignment,
                'session.mentor_assigned',
                $actor,
                $reason,
                after: $assignment->getAttributes(),
            );

            return $assignment->load('mentor.user:id,name');
        });
    }

    public function end(SessionMentorAssignment $assignment, User $actor, string $reason): void
    {
        DB::transaction(function () use ($assignment, $actor, $reason): void {
            $assignment = SessionMentorAssignment::query()->lockForUpdate()->findOrFail($assignment->id);
            $before = $assignment->getAttributes();

            if ($assignment->status !== 'ACTIVE') {
                throw new MentorAssignmentException(
                    'MENTOR_ASSIGNMENT_NOT_ACTIVE',
                    'Assignment mentor sudah tidak aktif.',
                    ['assignment_id' => $assignment->id],
                );
            }

            $assignment->update(['status' => 'ENDED', 'ended_at' => now()]);
            $this->audit->handle(
                $assignment,
                'session.mentor_assignment_ended',
                $actor,
                $reason,
                $before,
                $assignment->getAttributes(),
            );
        });
    }
}
