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
            'config_schema' => $this->config_schema,
            'is_available' => $this->is_available,
            'sort_order' => $this->sort_order,
        ];
    }
}
