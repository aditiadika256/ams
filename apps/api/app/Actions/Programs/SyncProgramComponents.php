<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramComponent;
use App\Models\User;
use App\Support\Components\ComponentConfigValidator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncProgramComponents
{
    public function __construct(
        private readonly ComponentConfigValidator $validator,
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(Program $program, array $components, User $actor, string $reason): Collection
    {
        $saved = DB::transaction(function () use ($program, $components, $actor, $reason): Collection {
            $program = Program::query()->lockForUpdate()->findOrFail($program->id);
            $definitionIds = collect($components)->pluck('component_definition_id')->all();
            $definitions = ComponentDefinition::query()
                ->available()
                ->whereIn('id', $definitionIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $this->validator->validate($program, $definitions, $components);

            $before = $this->snapshot($program);
            $program->components()->whereNotIn('component_definition_id', $definitionIds)->delete();

            foreach ($components as $index => $component) {
                ProgramComponent::query()->updateOrCreate(
                    [
                        'program_id' => $program->id,
                        'component_definition_id' => $component['component_definition_id'],
                    ],
                    [
                        'is_enabled' => $component['is_enabled'] ?? true,
                        'label' => $component['label'] ?? null,
                        'sort_order' => $component['sort_order'] ?? $index,
                        'configuration' => $component['configuration'] ?? [],
                    ],
                );
            }

            $after = $this->snapshot($program);
            $this->audit->handle(
                $program,
                'program.components_synced',
                $actor,
                $reason,
                $before,
                $after,
                correlationId: (string) Str::uuid(),
            );

            return $program->components()
                ->with('definition:id,code,name')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        });

        $this->rotateCache->handle();

        return $saved;
    }

    private function snapshot(Program $program): array
    {
        return $program->components()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['component_definition_id', 'is_enabled', 'label', 'sort_order', 'configuration'])
            ->map(fn (ProgramComponent $component): array => $component->only([
                'component_definition_id', 'is_enabled', 'label', 'sort_order', 'configuration',
            ]))
            ->all();
    }
}
