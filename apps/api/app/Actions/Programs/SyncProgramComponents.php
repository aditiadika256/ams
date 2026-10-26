<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Exceptions\ProgramCompositionException;
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
                ->whereIn('id', $definitionIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $unavailable = collect($components)
                ->filter(fn (array $component): bool => $component['is_enabled'] ?? true)
                ->map(fn (array $component) => $definitions->firstWhere('id', $component['component_definition_id']))
                ->first(fn (?ComponentDefinition $definition): bool => $definition === null || ! $definition->is_available);

            if ($unavailable !== null) {
                throw new ProgramCompositionException(
                    'COMPONENT_UNAVAILABLE',
                    'Komponen belum memiliki implementasi backend dan frontend yang tersedia.',
                    [
                        'component_definition_id' => $unavailable?->id,
                        'component' => $unavailable?->code,
                    ],
                );
            }

            $this->validator->validate($program, $definitions, $components);

            $before = $this->snapshot($program);
            
            $incomingIds = collect($components)->pluck('id')->filter()->all();
            if ($definitionIds === []) {
                $program->components()->delete();
            } elseif (! empty($incomingIds)) {
                $program->components()->whereNotIn('id', $incomingIds)->delete();
            }

            foreach ($components as $index => $component) {
                $installation = null;

                if (! empty($component['id'])) {
                    $installation = ProgramComponent::withTrashed()
                        ->where('program_id', $program->id)
                        ->where('id', $component['id'])
                        ->lockForUpdate()
                        ->first();
                }

                if ($installation === null) {
                    $installation = new ProgramComponent([
                        'program_id' => $program->id,
                        'component_definition_id' => $component['component_definition_id'],
                    ]);
                } elseif ($installation->trashed()) {
                    $installation->restore();
                }

                $installation->fill([
                    'component_definition_id' => $component['component_definition_id'],
                    'is_enabled' => $component['is_enabled'] ?? true,
                    'label' => $component['label'] ?? null,
                    'sort_order' => $component['sort_order'] ?? $index,
                    'configuration' => $component['configuration'] ?? [],
                ])->save();
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
