<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\ProgramComponentContent;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RestoreProgramComponentContent
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(ProgramComponentContent $content, User $actor, string $reason): ProgramComponentContent
    {
        return DB::transaction(function () use ($content, $actor, $reason): ProgramComponentContent {
            $model = ProgramComponentContent::withTrashed()->lockForUpdate()->findOrFail($content->id);
            $before = $model->getAttributes();
            $model->restore();

            $this->audit->handle(
                $model,
                'program_component_content.restored',
                $actor,
                $reason,
                $before,
                $model->getAttributes(),
            );

            return $model->load('mediaAsset');
        });
    }
}
