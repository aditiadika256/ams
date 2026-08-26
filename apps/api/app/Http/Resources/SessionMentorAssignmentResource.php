<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class SessionMentorAssignmentResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_session_id' => $this->program_session_id,
            'mentor_id' => $this->mentor_id,
            'role' => $this->role,
            'status' => $this->status,
            'capacity' => $this->capacity,
            'reserved_count' => $this->reserved_count,
            'assigned_at' => $this->assigned_at?->toIso8601String(),
            'ended_at' => $this->ended_at?->toIso8601String(),
            'metadata' => $this->metadata,
            'mentor' => $this->whenLoaded('mentor', fn (): array => [
                'id' => $this->mentor->id,
                'name' => $this->mentor->user->name,
                'specialization' => $this->mentor->specialization,
            ]),
        ];
    }
}
