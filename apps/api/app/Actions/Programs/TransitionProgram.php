<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\ProgramStatus;
use App\Exceptions\InvalidProgramTransitionException;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransitionProgram
{
    private const ALLOWED = [
        'DRAFT' => ['PUBLISHED', 'ARCHIVED'],
        'PUBLISHED' => ['UNPUBLISHED', 'ARCHIVED'],
        'UNPUBLISHED' => ['PUBLISHED', 'ARCHIVED'],
        'ARCHIVED' => ['DRAFT'],
    ];

    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(
        Program $program,
        ProgramStatus $target,
        User $actor,
        string $reason,
    ): Program {
        $updated = DB::transaction(function () use ($program, $target, $actor, $reason): Program {
            $locked = Program::query()->lockForUpdate()->findOrFail($program->id);
            $from = $locked->status;

            if (! in_array($target->value, self::ALLOWED[$from->value] ?? [], true)) {
                throw new InvalidProgramTransitionException($from, $target);
            }

            $before = $locked->getAttributes();
            $locked->fill($this->attributesFor($target));
            $locked->save();

            $this->audit->handle(
                $locked,
                $this->auditAction($target),
                $actor,
                $reason,
                $before,
                $locked->fresh()->getAttributes(),
            );

            return $locked->refresh();
        });

        $this->rotateCache->handle();

        return $updated;
    }

    private function attributesFor(ProgramStatus $target): array
    {
        return match ($target) {
            ProgramStatus::Published => [
                'status' => $target,
                'published_at' => now(),
                'archived_at' => null,
            ],
            ProgramStatus::Archived => [
                'status' => $target,
                'archived_at' => now(),
            ],
            ProgramStatus::Draft => [
                'status' => $target,
                'published_at' => null,
                'archived_at' => null,
            ],
            ProgramStatus::Unpublished => ['status' => $target],
        };
    }

    private function auditAction(ProgramStatus $target): string
    {
        return $target === ProgramStatus::Draft
            ? 'program.restored'
            : 'program.'.strtolower($target->value);
    }
}
