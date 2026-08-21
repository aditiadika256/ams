<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ComponentDefinitionResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'handler_template' => $this->handler_template->value,
            'handler_key' => $this->handler_key,
            'icon' => $this->icon,
            'config_schema' => $this->config_schema,
            'is_system' => $this->is_system,
            'is_available' => $this->is_available,
            'sort_order' => $this->sort_order,
            'usage_count' => (int) ($this->usage_count ?? 0),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
