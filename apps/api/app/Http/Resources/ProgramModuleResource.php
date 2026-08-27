<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramModuleResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'title' => $this->title,
            'description' => $this->description,
            'order' => $this->order,
            'is_published' => $this->is_published,
            'lessons' => ProgramLessonResource::collection($this->whenLoaded('lessons')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
