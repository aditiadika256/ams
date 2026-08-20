<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\Program;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncProgramTags
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(Program $program, array $tagIds, User $actor, string $reason): Collection
    {
        $tags = DB::transaction(function () use ($program, $tagIds, $actor, $reason): Collection {
            $program = Program::query()->lockForUpdate()->findOrFail($program->id);
            $tags = Tag::query()->active()->whereKey($tagIds)->orderBy('id')->lockForUpdate()->get();
            $before = $program->tags()->orderBy('tags.id')->pluck('tags.id')->all();

            $program->tags()->sync($tags->modelKeys());
            $after = $tags->modelKeys();
            sort($after);

            $this->audit->handle(
                $program,
                'program.tags_synced',
                $actor,
                $reason,
                ['tag_ids' => $before],
                ['tag_ids' => $after],
                correlationId: (string) Str::uuid(),
            );

            return $program->tags()->orderBy('sort_order')->orderBy('tags.id')->get();
        });

        $this->rotateCache->handle();

        return $tags;
    }
}
