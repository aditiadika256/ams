<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramComponentSubmissionResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_component_content_id' => $this->program_component_content_id,
            'program_access_id' => $this->program_access_id,
            'answers' => $this->payload,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
        ];
    }
}
