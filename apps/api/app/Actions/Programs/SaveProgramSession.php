<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\SessionStatus;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

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
            $session->save();

            $action = $before === []
                ? 'session.created'
                : ($rescheduled ? 'session.rescheduled' : 'session.updated');
            $this->audit->handle(
                $session,
                $action,
                $actor,
                $reason,
                $before,
                $session->getAttributes(),
            );

            return $session;
        });
    }
}
