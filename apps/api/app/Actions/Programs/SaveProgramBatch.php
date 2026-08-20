<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\BatchStatus;
use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class SaveProgramBatch
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(
        Program $program,
        array $data,
        User $actor,
        ?ProgramBatch $batch = null,
    ): ProgramBatch {
        return DB::transaction(function () use ($program, $data, $actor, $batch): ProgramBatch {
            $program = Program::query()->lockForUpdate()->findOrFail($program->id);
            $batch = $batch === null
                ? new ProgramBatch(['program_id' => $program->id, 'status' => BatchStatus::Draft])
                : ProgramBatch::query()->lockForUpdate()->findOrFail($batch->id);
            $before = $batch->exists ? $batch->getAttributes() : [];
            $reason = $data['reason'] ?? null;

            $batch->fill(Arr::except($data, ['reason']));
            $batch->save();

            $this->audit->handle(
                $batch,
                $before === [] ? 'batch.created' : 'batch.updated',
                $actor,
                $reason,
                $before,
                $batch->getAttributes(),
            );

            return $batch;
        });
    }
}
