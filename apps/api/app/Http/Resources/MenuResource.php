<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class MenuResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'icon' => $this->icon,
            'url' => $this->url,
            'layout' => $this->layout,
            'section' => $this->section,
            'parent_id' => $this->parent_id,
            'order' => $this->order,
            'required_permission' => $this->required_permission,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'children' => MenuResource::collection($this->whenLoaded('children')),
        ];
    }

    public function with(Request $request): array
    {
        return [];
    }
}
