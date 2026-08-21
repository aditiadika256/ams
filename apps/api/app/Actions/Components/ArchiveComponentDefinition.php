<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Exceptions\DomainConflictException;
use App\Models\ComponentDefinition;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ArchiveComponentDefinition
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(ComponentDefinition $componentDefinition, User $actor, string $reason): void
    {
        DB::transaction(function () use ($componentDefinition, $actor, $reason): void {
            $definition = ComponentDefinition::query()->lockForUpdate()->findOrFail($componentDefinition->id);

            if ($definition->is_system) {
                throw new DomainConflictException(
                    'SYSTEM_COMPONENT_IMMUTABLE',
                    'System component tidak dapat dihapus dari registry.',
                    ['component_definition_id' => $definition->id],
                );
            }

            $before = $definition->getAttributes();
            $definition->delete();
            $this->audit->handle(
                $definition,
                'component_definition.archived',
                $actor,
                $reason,
                $before,
                $definition->getAttributes(),
            );
        });
    }
}
