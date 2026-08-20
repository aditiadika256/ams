<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\SessionStatus;
use App\Exceptions\InvalidDeliveryTransitionException;
use App\Models\ProgramSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransitionSession
{
    private const TRANSITIONS = [
        'DRAFT' => ['SCHEDULED'],
        'SCHEDULED' => ['ONGOING', 'CANCELLED'],
        'ONGOING' => ['COMPLETED'],
        'COMPLETED' => [],
        'CANCELLED' => [],
    ];

    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(ProgramSession $session, SessionStatus $target, User $actor, string $reason): ProgramSession
    {
        return DB::transaction(function () use ($session, $target, $actor, $reason): ProgramSession {
            $session = ProgramSession::query()->lockForUpdate()->findOrFail($session->id);
            $from = $session->status;

            if (! in_array($target->value, self::TRANSITIONS[$from->value], true)) {
                throw new InvalidDeliveryTransitionException('session', $from->value, $target->value);
            }

            $before = $session->getAttributes();
            $session->update(['status' => $target]);
            $this->audit->handle(
                $session,
                'session.status_changed',
                $actor,
                $reason,
                $before,
                $session->getAttributes(),
            );

            return $session;
        });
    }
}
