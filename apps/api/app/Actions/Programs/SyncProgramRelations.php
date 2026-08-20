<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Exceptions\ProgramCompositionException;
use App\Models\Program;
use App\Models\ProgramRelation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncProgramRelations
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(Program $program, array $children, User $actor, string $reason): Collection
    {
        $saved = DB::transaction(function () use ($program, $children, $actor, $reason): Collection {
            $program = Program::query()->lockForUpdate()->findOrFail($program->id);
            $childIds = collect($children)->pluck('program_id')->sort()->values()->all();

            Program::query()->whereIn('id', $childIds)->orderBy('id')->lockForUpdate()->get(['id']);

            foreach ($childIds as $childId) {
                if ($childId === $program->id) {
                    throw new ProgramCompositionException(
                        'PROGRAM_RELATION_INVALID',
                        'Program tidak dapat menjadi child dari dirinya sendiri.',
                    );
                }

                if ($this->canReach($childId, $program->id)) {
                    throw new ProgramCompositionException(
                        'PROGRAM_RELATION_CYCLE',
                        'Relasi Program akan membentuk siklus.',
                        ['parent_program_id' => $program->id, 'child_program_id' => $childId],
                    );
                }
            }

            $before = $this->snapshot($program);
            $program->outgoingRelations()->delete();

            foreach ($children as $index => $child) {
                ProgramRelation::query()->create([
                    'parent_program_id' => $program->id,
                    'child_program_id' => $child['program_id'],
                    'sort_order' => $child['sort_order'] ?? $index,
                    'is_required' => $child['is_required'] ?? true,
                ]);
            }

            $after = $this->snapshot($program);
            $this->audit->handle(
                $program,
                'program.relations_synced',
                $actor,
                $reason,
                $before,
                $after,
                correlationId: (string) Str::uuid(),
            );

            return $program->children()
                ->select(['programs.id', 'programs.name', 'programs.slug'])
                ->orderByPivot('sort_order')
                ->get();
        });

        $this->rotateCache->handle();

        return $saved;
    }

    private function canReach(int $startId, int $targetId): bool
    {
        $frontier = [$startId];
        $visited = [];

        while ($frontier !== []) {
            if (in_array($targetId, $frontier, true)) {
                return true;
            }

            $frontier = array_values(array_diff(array_unique($frontier), $visited));
            if ($frontier === []) {
                return false;
            }

            $visited = [...$visited, ...$frontier];
            $frontier = ProgramRelation::query()
                ->whereIn('parent_program_id', $frontier)
                ->pluck('child_program_id')
                ->map(fn ($id): int => (int) $id)
                ->all();
        }

        return false;
    }

    private function snapshot(Program $program): array
    {
        return $program->outgoingRelations()
            ->orderBy('sort_order')
            ->get(['child_program_id', 'sort_order', 'is_required'])
            ->map(fn (ProgramRelation $relation): array => $relation->only([
                'child_program_id', 'sort_order', 'is_required',
            ]))
            ->all();
    }
}
