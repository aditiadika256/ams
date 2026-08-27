<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\ComponentContentStatus;
use App\Exceptions\DomainConflictException;
use App\Models\Program;
use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use App\Models\User;
use App\Support\Components\ComponentContentValidator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaveProgramComponentContent
{
    public function __construct(
        private readonly ComponentContentValidator $validator,
        private readonly RecordDomainAudit $audit,
    ) {}

    public function handle(
        Program $program,
        ProgramComponent $programComponent,
        array $data,
        User $actor,
        ?ProgramComponentContent $content = null,
    ): ProgramComponentContent {
        return DB::transaction(function () use ($program, $programComponent, $data, $actor, $content): ProgramComponentContent {
            $component = ProgramComponent::query()
                ->with('definition')
                ->lockForUpdate()
                ->findOrFail($programComponent->id);
            $this->assertComponentProgram($component, $program);

            $model = $content === null
                ? new ProgramComponentContent(['program_component_id' => $component->id])
                : ProgramComponentContent::query()->lockForUpdate()->findOrFail($content->id);

            if ($model->exists && $model->program_component_id !== $component->id) {
                abort(404);
            }

            $before = $model->exists ? $model->getAttributes() : [];
            $attributes = Arr::except($data, ['reason']);
            $candidate = [
                ...$model->only([
                    'title', 'slug', 'summary', 'body', 'external_url', 'media_asset_id',
                    'payload', 'status', 'sort_order',
                ]),
                ...$attributes,
            ];
            $status = $candidate['status'] instanceof ComponentContentStatus
                ? $candidate['status']
                : ComponentContentStatus::from($candidate['status'] ?? ComponentContentStatus::Draft->value);
            $candidate['status'] = $status->value;

            $this->validator->validate($component, $candidate);

            $model->fill([
                ...$attributes,
                'status' => $status,
                'published_at' => $status === ComponentContentStatus::Published
                    ? ($model->published_at ?? now())
                    : null,
                'updated_by' => $actor->id,
            ]);
            if (! $model->exists) {
                $model->created_by = $actor->id;
            }
            $model->save();

            $wasPublished = ($before['status'] ?? null) === ComponentContentStatus::Published->value;
            $action = $status === ComponentContentStatus::Published && ! $wasPublished
                ? 'program_component_content.published'
                : ($before === [] ? 'program_component_content.created' : 'program_component_content.updated');
            $this->audit->handle(
                $model,
                $action,
                $actor,
                $data['reason'],
                $before,
                $model->getAttributes(),
                correlationId: (string) Str::uuid(),
            );

            return $model->load('mediaAsset');
        });
    }

    private function assertComponentProgram(ProgramComponent $component, Program $program): void
    {
        if ($component->program_id !== $program->id) {
            throw new DomainConflictException(
                'PROGRAM_COMPONENT_MISMATCH',
                'Component tidak terpasang pada Program ini.',
            );
        }
    }
}
