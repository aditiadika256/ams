<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramBatchResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'name' => $this->name,
            'code' => $this->code,
            'registration_starts_at' => $this->registration_starts_at?->toIso8601String(),
            'registration_ends_at' => $this->registration_ends_at?->toIso8601String(),
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'capacity' => $this->capacity,
            'enrolled_count' => $this->enrolled_count,
            'mode' => $this->mode->value,
            'location' => $this->location,
            'timezone' => $this->timezone,
            'price_override' => $this->price_override,
            'status' => $this->status->value,
            'allow_retakes' => $this->allow_retakes,
            'metadata' => $this->metadata,
            'sessions' => ProgramSessionResource::collection($this->whenLoaded('sessions')),
        ];
    }
}
