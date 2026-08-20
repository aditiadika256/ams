<?php

namespace App\Actions\Programs;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SaveTag
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly RotateProgramCatalogCache $rotateCache,
    ) {}

    public function handle(array $data, User $actor, ?Tag $tag = null): Tag
    {
        $saved = DB::transaction(function () use ($data, $actor, $tag): Tag {
            $tag = $tag === null
                ? new Tag
                : Tag::query()->lockForUpdate()->findOrFail($tag->id);
            $before = $tag->exists ? $tag->getAttributes() : [];

            $tag->fill($data);
            $tag->save();

            $this->audit->handle(
                $tag,
                $before === [] ? 'tag.created' : 'tag.updated',
                $actor,
                before: $before,
                after: $tag->getAttributes(),
            );

            return $tag;
        });

        $this->rotateCache->handle();

        return $saved;
    }
}
