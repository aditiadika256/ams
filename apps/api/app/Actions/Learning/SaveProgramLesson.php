<?php

namespace App\Actions\Learning;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\ComponentHandlerTemplate;
use App\Exceptions\ProgramCompositionException;
use App\Models\ProgramLesson;
use App\Models\ProgramModule;
use App\Models\User;
use App\Support\Components\MaterialContentValidator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class SaveProgramLesson
{
    public function __construct(
        private readonly MaterialContentValidator $validator,
        private readonly RecordDomainAudit $audit,
    ) {}

    public function handle(
        ProgramModule $module,
        array $data,
        User $actor,
        ?ProgramLesson $lesson = null,
    ): ProgramLesson {
        return DB::transaction(function () use ($module, $data, $actor, $lesson): ProgramLesson {
            $module = ProgramModule::query()->with('program')->lockForUpdate()->findOrFail($module->id);
            if (! $module->program->components()
                ->where('is_enabled', true)
                ->whereHas('definition', fn ($definition) => $definition
                    ->whereNull('deleted_at')
                    ->where('code', 'material')
                    ->where('is_available', true))
                ->exists()) {
                throw new ProgramCompositionException(
                    'MATERIAL_COMPONENT_UNAVAILABLE',
                    'Aktifkan component Material pada Program sebelum mengelola lesson.',
                );
            }
            $model = $lesson === null
                ? new ProgramLesson(['module_id' => $module->id])
                : ProgramLesson::query()->lockForUpdate()->findOrFail($lesson->id);

            if ($model->exists && $model->module_id !== $module->id) {
                abort(404);
            }

            $before = $model->exists ? $model->getAttributes() : [];
            $attributes = Arr::except($data, ['reason']);
            $candidate = [
                ...$model->only([
                    'title', 'slug', 'content_kind', 'content_body', 'external_url',
                    'media_asset_id', 'duration_minutes', 'order', 'is_published', 'is_preview',
                ]),
                ...$attributes,
            ];
            $candidate['content_kind'] ??= ComponentHandlerTemplate::Information->value;
            $candidate['is_published'] ??= false;
            $this->validator->validate($module->program, $candidate);

            $kind = ComponentHandlerTemplate::from($candidate['content_kind']);
            $attributes = $this->normalizeForKind($attributes, $kind);
            $attributes['content_type'] = $this->legacyContentType($kind);
            $model->fill($attributes)->save();

            $this->audit->handle(
                $model,
                $before === [] ? 'program_lesson.created' : 'program_lesson.updated',
                $actor,
                $data['reason'],
                $before,
                $model->getAttributes(),
            );

            return $model->load('mediaAsset');
        });
    }

    private function normalizeForKind(array $attributes, ComponentHandlerTemplate $kind): array
    {
        if (in_array($kind, [ComponentHandlerTemplate::Information, ComponentHandlerTemplate::EmbeddedPage], true)) {
            $attributes['external_url'] = null;
            $attributes['media_asset_id'] = null;
        } elseif ($kind === ComponentHandlerTemplate::ExternalLink) {
            $attributes['content_body'] = null;
            $attributes['media_asset_id'] = null;
        } elseif ($kind === ComponentHandlerTemplate::FileDownload) {
            $attributes['content_body'] = null;
            $attributes['external_url'] = null;
        } elseif ($kind === ComponentHandlerTemplate::Video) {
            $attributes['content_body'] = null;
        }

        $attributes['content_kind'] = $kind->value;
        $attributes['content_url'] = null;

        return $attributes;
    }

    private function legacyContentType(ComponentHandlerTemplate $kind): string
    {
        return $kind === ComponentHandlerTemplate::Video ? 'video' : 'text';
    }
}
