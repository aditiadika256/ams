<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateProgram
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(Program $program, array $data, User $actor): Program
    {
        $updated = DB::transaction(function () use ($program, $data, $actor): Program {
            $locked = Program::query()->lockForUpdate()->findOrFail($program->id);
            $before = $locked->getAttributes();
            $locked->update($data);

            $this->audit->handle(
                $locked,
                'program.updated',
                $actor,
                before: $before,
                after: $locked->fresh()->getAttributes(),
            );

            return $locked->refresh();
        });

        $this->rotateCache->handle();

        return $updated;
    }
}
