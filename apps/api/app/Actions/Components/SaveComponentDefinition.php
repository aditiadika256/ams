<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Enums\ComponentHandlerTemplate;
use App\Exceptions\DomainConflictException;
use App\Models\ComponentDefinition;
use App\Models\User;
use App\Support\Components\ComponentHandlerRegistry;
use Illuminate\Support\Facades\DB;

class SaveComponentDefinition
{
    public function __construct(
        private readonly ComponentHandlerRegistry $handlers,
        private readonly RecordDomainAudit $audit,
    ) {}

    public function handle(
        array $data,
        User $actor,
        ?ComponentDefinition $componentDefinition = null,
    ): ComponentDefinition {
        return DB::transaction(function () use ($data, $actor, $componentDefinition): ComponentDefinition {
            $definition = $componentDefinition === null
                ? new ComponentDefinition
                : ComponentDefinition::query()->lockForUpdate()->findOrFail($componentDefinition->id);
            $before = $definition->exists ? $definition->getAttributes() : [];

            if ($definition->exists && $this->changesHandler($definition, $data)
                && $definition->programComponents()->withTrashed()->exists()) {
                throw new DomainConflictException(
                    'COMPONENT_HANDLER_IMMUTABLE',
                    'Handler component tidak dapat diubah setelah component dipasang pada Program.',
                    ['component_definition_id' => $definition->id],
                );
            }

            $template = isset($data['handler_template'])
                ? ComponentHandlerTemplate::from($data['handler_template'])
                : ($definition->handler_template ?? ComponentHandlerTemplate::Native);
            $handlerKey = $template === ComponentHandlerTemplate::Native
                ? ($data['handler_key'] ?? $definition->handler_key)
                : null;

            $definition->fill([
                ...$data,
                'handler_template' => $template,
                'handler_key' => $handlerKey,
                'is_available' => $this->handlers->isImplemented($template, $handlerKey),
            ]);
            $definition->save();

            $this->audit->handle(
                $definition,
                $before === [] ? 'component_definition.created' : 'component_definition.updated',
                $actor,
                before: $before,
                after: $definition->getAttributes(),
            );

            return $definition;
        });
    }

    private function changesHandler(ComponentDefinition $definition, array $data): bool
    {
        $template = $data['handler_template'] ?? $definition->handler_template->value;
        $handlerKey = $data['handler_key'] ?? $definition->handler_key;

        return $template !== $definition->handler_template->value
            || $handlerKey !== $definition->handler_key;
    }
}
