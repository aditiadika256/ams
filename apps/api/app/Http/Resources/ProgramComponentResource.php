<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramComponentResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'component_definition_id' => $this->component_definition_id,
            'code' => $this->definition->code,
            'name' => $this->definition->name,
            'is_enabled' => $this->is_enabled,
            'label' => $this->label,
            'sort_order' => $this->sort_order,
            'configuration' => $this->configuration ?? [],
        ];
    }
}
