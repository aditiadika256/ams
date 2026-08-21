<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Exceptions\DomainConflictException;
use App\Models\ComponentDefinition;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ForceDeleteComponentDefinition
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(ComponentDefinition $componentDefinition, User $actor, string $reason): void
    {
        DB::transaction(function () use ($componentDefinition, $actor, $reason): void {
            $definition = ComponentDefinition::withTrashed()->lockForUpdate()->findOrFail($componentDefinition->id);

            if (! $definition->trashed() || $definition->is_system) {
                throw new DomainConflictException(
                    'COMPONENT_DEFINITION_NOT_PURGEABLE',
                    'Hanya custom component yang sudah diarsipkan yang dapat dihapus permanen.',
                    ['component_definition_id' => $definition->id],
                );
            }

            if ($definition->programComponents()->withTrashed()->exists()) {
                throw new DomainConflictException(
                    'COMPONENT_DEFINITION_REFERENCED',
                    'Component masih memiliki pemasangan atau histori Program.',
                    ['component_definition_id' => $definition->id],
                );
            }

            $before = $definition->getAttributes();
            $this->audit->handle(
                $definition,
                'component_definition.force_deleted',
                $actor,
                $reason,
                $before,
            );
            $definition->forceDelete();
        });
    }
}
