<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramSessionResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_batch_id' => $this->program_batch_id,
            'title' => $this->title,
            'description' => $this->description,
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $this->ends_at->toIso8601String(),
            'timezone' => $this->timezone,
            'mode' => $this->mode->value,
            'mentor_assignment_mode' => $this->mentor_assignment_mode->value,
            'location' => $this->location,
            'meeting_url' => $this->meeting_url,
            'capacity' => $this->capacity,
            'reserved_count' => $this->reserved_count,
            'status' => $this->status->value,
            'metadata' => $this->metadata,
            'mentor_assignments' => SessionMentorAssignmentResource::collection(
                $this->whenLoaded('mentorAssignments')
            ),
        ];
    }
}
