<?php

namespace App\Actions\Access;

use App\Enums\AccessStatus;
use App\Models\ProgramAccess;
use App\Models\ProgramCertificate;
use App\Models\User;
use App\Support\Components\CompletionRuleValidator;
use Illuminate\Support\Str;

class EvaluateProgramCompletion
{
    public function __construct(
        private readonly CompletionRuleValidator $validator,
        private readonly RecordAccessEvent $events,
    ) {}

    public function handle(ProgramAccess $access, ?User $actor = null): ProgramAccess
    {
        $access->loadMissing('program.components.definition', 'user', 'batch');
        $rule = $access->program->completion_rule;
        $this->validator->validate($rule);

        if ($rule === null || $access->status !== AccessStatus::Active || ! $this->fulfilled($rule, $access->progress_breakdown ?? [])) {
            return $access;
        }

        $before = $access->getAttributes();
        $access->forceFill([
            'status' => AccessStatus::Completed,
            'completed_at' => now(),
        ])->save();
        $this->events->handle(
            $access,
            'access.completed',
            $actor,
            'Completion rule terpenuhi.',
            $before,
            $access->getAttributes(),
        );

        $certificateEnabled = $access->program->components->contains(
            fn ($component): bool => $component->is_enabled
                && $component->definition->code === 'certificate'
                && $component->definition->is_available,
        );

        if ($certificateEnabled) {
            ProgramCertificate::query()->firstOrCreate(
                ['program_access_id' => $access->id],
                [
                    'certificate_number' => $this->certificateNumber($access),
                    'snapshot' => [
                        'user_id' => $access->user_id,
                        'user_name' => $access->user->name,
                        'program_id' => $access->program_id,
                        'program_name' => $access->program->name,
                        'batch_id' => $access->program_batch_id,
                        'batch_name' => $access->batch?->name,
                        'completion_rule' => $rule,
                    ],
                    'issued_at' => now(),
                ],
            );
        }

        return $access->refresh();
    }

    private function fulfilled(array $rule, array $breakdown): bool
    {
        return collect($rule['all'])->every(function (array $requirement) use ($breakdown): bool {
            $actual = $breakdown[$requirement['component']][$requirement['metric']] ?? null;

            return is_numeric($actual) && (float) $actual >= (float) $requirement['value'];
        });
    }

    private function certificateNumber(ProgramAccess $access): string
    {
        $digest = Str::upper(substr(hash('sha256', "certificate:{$access->id}:{$access->grant_key}"), 0, 10));

        return sprintf('CERT-%s-%08d-%s', now()->format('Y'), $access->id, $digest);
    }
}
