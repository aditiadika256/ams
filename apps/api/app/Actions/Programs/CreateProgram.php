<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\ProgramStatus;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateProgram
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(array $data, User $actor): Program
    {
        $program = DB::transaction(function () use ($data, $actor): Program {
            $program = Program::query()->create([
                ...$data,
                'status' => ProgramStatus::Draft,
            ]);

            $this->audit->handle($program, 'program.created', $actor, after: $program->getAttributes());

            return $program;
        });

        $this->rotateCache->handle();

        return $program;
    }
}
