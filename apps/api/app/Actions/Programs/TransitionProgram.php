<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\ProgramStatus;
use App\Exceptions\InvalidProgramTransitionException;
use App\Exceptions\ProgramCompositionException;
use App\Models\Program;
use App\Models\User;
use App\Support\Components\CompletionRuleValidator;
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
        private readonly CompletionRuleValidator $completionRules,
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

            if ($target === ProgramStatus::Published) {
                $this->guardPublicationCompletion($locked);
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

    private function guardPublicationCompletion(Program $program): void
    {
        $rule = $program->completion_rule;
        $this->completionRules->validate($rule);

        if ($rule === null) {
            return;
        }

        $requiredCodes = collect($rule['all'])->pluck('component')->unique();
        $components = $program->components()
            ->where('is_enabled', true)
            ->whereHas('definition', fn ($query) => $query->where('is_available', true))
            ->with('definition:id,code')
            ->get();
        $enabledCodes = $components->pluck('definition.code');
        $missingCodes = $requiredCodes->diff($enabledCodes)->values();

        if ($missingCodes->isNotEmpty()) {
            throw new ProgramCompositionException(
                'COMPLETION_COMPONENT_UNAVAILABLE',
                'Komponen completion rule harus aktif dan tersedia sebelum Program diterbitkan.',
                ['components' => $missingCodes->all()],
            );
        }

        if ($requiredCodes->contains('assessment')) {
            $assessment = $components->first(fn ($component) => $component->definition->code === 'assessment');

            if (empty($assessment?->configuration['exam_package_ids'])) {
                throw new ProgramCompositionException(
                    'ASSESSMENT_PACKAGE_REQUIRED',
                    'Assessment completion memerlukan minimal satu exam package.',
                );
            }
        }
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
