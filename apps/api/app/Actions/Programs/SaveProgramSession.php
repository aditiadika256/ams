<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\AccessStatus;
use App\Enums\SessionStatus;
use App\Events\ProgramSessionRescheduled;
use App\Exceptions\MentorAssignmentException;
use App\Models\Mentor;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaveProgramSession
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(
        ProgramBatch $batch,
        array $data,
        User $actor,
        ?ProgramSession $session = null,
    ): ProgramSession {
        return DB::transaction(function () use ($batch, $data, $actor, $session): ProgramSession {
            $batch = ProgramBatch::query()->lockForUpdate()->findOrFail($batch->id);
            $session = $session === null
                ? new ProgramSession(['program_batch_id' => $batch->id, 'status' => SessionStatus::Draft])
                : ProgramSession::query()->lockForUpdate()->findOrFail($session->id);
            $before = $session->exists ? $session->getAttributes() : [];
            $wasActive = $session->exists && in_array($session->status, [
                SessionStatus::Scheduled,
                SessionStatus::Ongoing,
            ], true);
            $reason = $data['reason'] ?? null;

            $session->fill(Arr::except($data, ['reason']));
            $rescheduled = $wasActive && ($session->isDirty('starts_at') || $session->isDirty('ends_at'));

            if ($rescheduled) {
                $mentorIds = SessionMentorAssignment::query()
                    ->where('program_session_id', $session->id)
                    ->where('status', 'ACTIVE')
                    ->orderBy('mentor_id')
                    ->lockForUpdate()
                    ->pluck('mentor_id');

                if ($mentorIds->isNotEmpty()) {
                    Mentor::query()
                        ->whereKey($mentorIds)
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->get(['id']);

                    $conflictingMentorId = SessionMentorAssignment::query()
                        ->whereIn('mentor_id', $mentorIds)
                        ->where('status', 'ACTIVE')
                        ->where('program_session_id', '!=', $session->id)
                        ->whereHas('session', fn ($query) => $query
                            ->whereIn('status', [SessionStatus::Scheduled->value, SessionStatus::Ongoing->value])
                            ->where('starts_at', '<', $session->ends_at)
                            ->where('ends_at', '>', $session->starts_at))
                        ->value('mentor_id');

                    if ($conflictingMentorId !== null) {
                        throw new MentorAssignmentException(
                            'MENTOR_SCHEDULE_CONFLICT',
                            'Perubahan jadwal beririsan dengan assignment aktif mentor.',
                            ['mentor_id' => $conflictingMentorId, 'program_session_id' => $session->id],
                        );
                    }
                }
            }

            $session->save();

            $action = $before === []
                ? 'session.created'
                : ($rescheduled ? 'session.rescheduled' : 'session.updated');
            $correlationId = (string) Str::uuid();
            $this->audit->handle(
                $session,
                $action,
                $actor,
                $reason,
                $before,
                $session->getAttributes(),
                correlationId: $correlationId,
            );

            if ($rescheduled) {
                ProgramSessionRescheduled::dispatch(
                    $session->id,
                    $correlationId,
                    $this->snapshotRecipients($session),
                    [
                        'title' => $session->title,
                        'previous_starts_at' => $before['starts_at'],
                        'previous_ends_at' => $before['ends_at'],
                        'starts_at' => $session->starts_at->toIso8601String(),
                        'ends_at' => $session->ends_at->toIso8601String(),
                        'timezone' => $session->timezone,
                        'mode' => $session->mode->value,
                        'meeting_url' => $session->meeting_url,
                        'reason' => $reason,
                    ],
                    now()->toIso8601String(),
                );
            }

            return $session;
        });
    }

    private function snapshotRecipients(ProgramSession $session): array
    {
        $recipients = [];

        ProgramAccess::query()
            ->where('program_batch_id', $session->program_batch_id)
            ->whereIn('status', [AccessStatus::Waiting->value, AccessStatus::Active->value])
            ->get(['id', 'user_id'])
            ->each(function (ProgramAccess $access) use (&$recipients): void {
                $recipients[$access->user_id] = [
                    'user_id' => $access->user_id,
                    'program_access_id' => $access->id,
                ];
            });

        SessionMentorAssignment::query()
            ->where('program_session_id', $session->id)
            ->where('status', 'ACTIVE')
            ->with('mentor:id,user_id')
            ->get(['id', 'mentor_id'])
            ->each(function (SessionMentorAssignment $assignment) use (&$recipients): void {
                $userId = $assignment->mentor->user_id;
                $recipients[$userId] = [
                    ...($recipients[$userId] ?? ['user_id' => $userId]),
                    'mentor_id' => $assignment->mentor_id,
                ];
            });

        return array_values($recipients);
    }
}
