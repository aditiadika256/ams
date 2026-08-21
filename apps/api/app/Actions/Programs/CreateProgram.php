<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\ProgramStatus;
use App\Models\Program;
use App\Models\User;
use App\Support\Components\CompletionRuleValidator;
use Illuminate\Support\Facades\DB;

class CreateProgram
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
        private readonly CompletionRuleValidator $completionRules,
    ) {}

    public function handle(array $data, User $actor): Program
    {
        $this->completionRules->validate($data['completion_rule'] ?? null);
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
