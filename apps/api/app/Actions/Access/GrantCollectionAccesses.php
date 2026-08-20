<?php

namespace App\Actions\Access;

use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Models\ProgramAccess;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GrantCollectionAccesses
{
    public function __construct(private readonly GrantProgramAccess $grant) {}

    public function handle(ProgramAccess $parentAccess, ?User $actor, string $reason): Collection
    {
        return DB::transaction(function () use ($parentAccess, $actor, $reason): Collection {
            $parentAccess = ProgramAccess::query()
                ->with('program.outgoingRelations')
                ->lockForUpdate()
                ->findOrFail($parentAccess->id);
            $correlationId = (string) Str::uuid();
            $children = new Collection;

            foreach ($parentAccess->program->outgoingRelations->sortBy('sort_order') as $relation) {
                $children->push($this->grant->handle(new AccessGrantData(
                    userId: $parentAccess->user_id,
                    programId: $relation->child_program_id,
                    source: AccessSource::Collection,
                    sourceId: (string) $parentAccess->id,
                    grantKey: "collection:{$parentAccess->id}:program:{$relation->child_program_id}",
                    parentAccessId: $parentAccess->id,
                    startsAt: $parentAccess->starts_at,
                    endsAt: $parentAccess->ends_at,
                    metadata: ['is_required' => $relation->is_required],
                    allowDuplicate: true,
                    correlationId: $correlationId,
                ), $actor, $reason));
            }

            return $children;
        });
    }
}
