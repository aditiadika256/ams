<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\BatchStatus;
use App\Exceptions\InvalidDeliveryTransitionException;
use App\Models\ProgramBatch;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransitionBatch
{
    private const TRANSITIONS = [
        'DRAFT' => ['OPEN'],
        'OPEN' => ['RUNNING', 'CANCELLED'],
        'RUNNING' => ['COMPLETED'],
        'COMPLETED' => [],
        'CANCELLED' => [],
    ];

    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(ProgramBatch $batch, BatchStatus $target, User $actor, string $reason): ProgramBatch
    {
        return DB::transaction(function () use ($batch, $target, $actor, $reason): ProgramBatch {
            $batch = ProgramBatch::query()->lockForUpdate()->findOrFail($batch->id);
            $from = $batch->status;

            if (! in_array($target->value, self::TRANSITIONS[$from->value], true)) {
                throw new InvalidDeliveryTransitionException('batch', $from->value, $target->value);
            }

            $before = $batch->getAttributes();
            $batch->update(['status' => $target]);
            $this->audit->handle(
                $batch,
                'batch.status_changed',
                $actor,
                $reason,
                $before,
                $batch->getAttributes(),
            );

            return $batch;
        });
    }
}
