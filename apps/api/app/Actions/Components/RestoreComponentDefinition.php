<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\ComponentDefinition;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RestoreComponentDefinition
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(ComponentDefinition $componentDefinition, User $actor, string $reason): ComponentDefinition
    {
        return DB::transaction(function () use ($componentDefinition, $actor, $reason): ComponentDefinition {
            $definition = ComponentDefinition::withTrashed()->lockForUpdate()->findOrFail($componentDefinition->id);
            $before = $definition->getAttributes();
            $definition->restore();
            $this->audit->handle(
                $definition,
                'component_definition.restored',
                $actor,
                $reason,
                $before,
                $definition->getAttributes(),
            );

            return $definition;
        });
    }
}
