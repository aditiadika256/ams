<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'level' => $this->level,
            'type' => $this->type,
            'program_level_id' => $this->program_level_id,
            'program_type_id' => $this->program_type_id,
            'program_level' => new ProgramLevelResource(
                $this->whenLoaded('programLevel')
            ),
            'program_type' => new ProgramTypeResource(
                $this->whenLoaded('programType')
            ),
            'price' => $this->price,
            'active' => $this->active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    public function with(Request $request): array
    {
        return [];
    }
}
