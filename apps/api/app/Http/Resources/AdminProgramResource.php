<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminProgramResource extends ProgramResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'completion_rule' => $this->completion_rule,
            'archived_at' => $this->archived_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'components' => $this->whenLoaded('components', fn () => $this->components->map(fn ($component): array => [
                'id' => $component->id,
                'definition_id' => $component->component_definition_id,
                'code' => $component->definition->code,
                'name' => $component->definition->name,
                'handler_template' => $component->definition->handler_template->value,
                'handler_key' => $component->definition->handler_key,
                'icon' => $component->definition->icon,
                'is_enabled' => $component->is_enabled,
                'label' => $component->label,
                'sort_order' => $component->sort_order,
                'configuration' => $component->configuration,
            ])->values()),
            'children' => $this->whenLoaded('children', fn () => $this->children->map(fn ($child): array => [
                'id' => $child->id,
                'name' => $child->name,
                'slug' => $child->slug,
                'sort_order' => $child->pivot->sort_order,
                'is_required' => $child->pivot->is_required,
            ])->values()),
        ];
    }
}
