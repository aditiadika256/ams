<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ArchiveTag
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(Tag $tag, User $actor): void
    {
        DB::transaction(function () use ($tag, $actor): void {
            $tag = Tag::query()->lockForUpdate()->findOrFail($tag->id);
            $before = $tag->getAttributes();

            $tag->update(['is_active' => false, 'archived_at' => now()]);

            $this->audit->handle(
                $tag,
                'tag.archived',
                $actor,
                before: $before,
                after: $tag->getAttributes(),
            );
        });

        $this->rotateCache->handle();
    }
}
