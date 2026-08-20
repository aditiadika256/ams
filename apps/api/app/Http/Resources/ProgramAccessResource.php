<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramAccessResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'program_id' => $this->program_id,
            'program_batch_id' => $this->program_batch_id,
            'parent_program_access_id' => $this->parent_program_access_id,
            'source_type' => $this->source_type->value,
            'status' => $this->status->value,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'activated_at' => $this->activated_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'suspended_at' => $this->suspended_at?->toIso8601String(),
            'revoked_at' => $this->revoked_at?->toIso8601String(),
            'archived_at' => $this->archived_at?->toIso8601String(),
            'metadata' => $this->metadata,
        ];
    }
}
