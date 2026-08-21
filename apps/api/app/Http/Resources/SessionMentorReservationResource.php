<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class SessionMentorReservationResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_session_id' => $this->program_session_id,
            'program_access_id' => $this->program_access_id,
            'status' => $this->status,
            'reserved_at' => $this->reserved_at->toIso8601String(),
            'mentor' => $this->whenLoaded('assignment', fn (): array => [
                'assignment_id' => $this->assignment->id,
                'id' => $this->assignment->mentor->id,
                'name' => $this->assignment->mentor->user->name,
                'role' => $this->assignment->role,
            ]),
        ];
    }
}
