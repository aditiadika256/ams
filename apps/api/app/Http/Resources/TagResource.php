<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class TagResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'archived_at' => $this->archived_at?->toIso8601String(),
        ];
    }
}
