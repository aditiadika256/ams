<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class MentorParticipantResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'program_access_id' => $this->id,
            'status' => $this->status->value,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'batch_id' => $this->program_batch_id,
        ];
    }
}
