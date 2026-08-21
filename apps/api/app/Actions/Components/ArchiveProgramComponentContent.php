<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\ProgramComponentContent;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ArchiveProgramComponentContent
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(ProgramComponentContent $content, User $actor, string $reason): void
    {
        DB::transaction(function () use ($content, $actor, $reason): void {
            $model = ProgramComponentContent::query()->lockForUpdate()->findOrFail($content->id);
            $before = $model->getAttributes();
            $model->delete();

            $this->audit->handle(
                $model,
                'program_component_content.archived',
                $actor,
                $reason,
                $before,
                $model->getAttributes(),
            );
        });
    }
}
