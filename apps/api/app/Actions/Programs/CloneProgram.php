<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\ProgramStatus;
use App\Models\Program;
use App\Models\ProgramComponent;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CloneProgram
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(
        Program $program,
        string $name,
        string $slug,
        User $actor,
        string $reason,
    ): Program {
        $clone = DB::transaction(function () use ($program, $name, $slug, $actor, $reason): Program {
            $source = Program::query()
                ->with(['tags:id', 'components'])
                ->lockForUpdate()
                ->findOrFail($program->id);

            $clone = $source->replicate([
                'status', 'published_at', 'archived_at', 'created_by', 'updated_by',
            ]);
            $clone->fill([
                'name' => $name,
                'slug' => $slug,
                'status' => ProgramStatus::Draft,
                'published_at' => null,
                'archived_at' => null,
            ]);
            $clone->save();

            $clone->tags()->sync($source->tags->modelKeys());
            $source->components->each(function (ProgramComponent $component) use ($clone): void {
                $clone->components()->create([
                    'component_definition_id' => $component->component_definition_id,
                    'is_enabled' => $component->is_enabled,
                    'label' => $component->label,
                    'sort_order' => $component->sort_order,
                    'configuration' => $component->configuration,
                ]);
            });

            $this->audit->handle(
                $clone,
                'program.cloned',
                $actor,
                $reason,
                after: $clone->getAttributes(),
                payload: ['source_program_id' => $source->id],
            );

            return $clone;
        });

        $this->rotateCache->handle();

        return $clone;
    }
}
