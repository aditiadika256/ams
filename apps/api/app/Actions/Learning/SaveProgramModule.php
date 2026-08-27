<?php

namespace App\Actions\Learning;

use App\Actions\Audit\RecordDomainAudit;
use App\Exceptions\ProgramCompositionException;
use App\Models\Program;
use App\Models\ProgramModule;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class SaveProgramModule
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(
        Program $program,
        array $data,
        User $actor,
        ?ProgramModule $module = null,
    ): ProgramModule {
        return DB::transaction(function () use ($program, $data, $actor, $module): ProgramModule {
            $program = Program::query()->lockForUpdate()->findOrFail($program->id);
            $this->assertMaterialEnabled($program);
            $model = $module === null
                ? new ProgramModule(['program_id' => $program->id])
                : ProgramModule::query()->lockForUpdate()->findOrFail($module->id);

            if ($model->exists && $model->program_id !== $program->id) {
                abort(404);
            }

            $before = $model->exists ? $model->getAttributes() : [];
            $model->fill(Arr::except($data, ['reason']))->save();
            $this->audit->handle(
                $model,
                $before === [] ? 'program_module.created' : 'program_module.updated',
                $actor,
                $data['reason'],
                $before,
                $model->getAttributes(),
            );

            return $model->load('lessons.mediaAsset');
        });
    }

    private function assertMaterialEnabled(Program $program): void
    {
        if (! $program->components()
            ->where('is_enabled', true)
            ->whereHas('definition', fn ($definition) => $definition
                ->whereNull('deleted_at')
                ->where('code', 'material')
                ->where('is_available', true))
            ->exists()) {
            throw new ProgramCompositionException(
                'MATERIAL_COMPONENT_UNAVAILABLE',
                'Aktifkan component Material pada Program sebelum mengelola kurikulum.',
            );
        }
    }
}
