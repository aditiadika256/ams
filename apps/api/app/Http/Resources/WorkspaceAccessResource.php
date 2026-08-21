<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class WorkspaceAccessResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        $program = $this->whenLoaded('program');

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'status' => $this->status->value,
            'source_type' => $this->source_type->value,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'activated_at' => $this->activated_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'archived_at' => $this->archived_at?->toIso8601String(),
            'last_accessed_at' => $this->last_accessed_at?->toIso8601String(),
            'program' => $program ? [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
                'short_description' => $program->short_description,
                'thumbnail_url' => $program->thumbnail_url,
                'cover_url' => $program->cover_url,
                'tags' => $program->tags->map(fn ($tag): array => [
                    'code' => $tag->code,
                    'name' => $tag->name,
                ])->values(),
            ] : null,
            'batch' => $this->batchData(),
            'next_session' => $this->sessionData(),
            'primary_component' => $program?->components->first()?->definition->code,
            'progress' => [
                'percent' => (float) $this->progress_percent,
                'content_count' => (int) ($program?->modules_count ?? 0),
                'breakdown' => $this->progress_breakdown ?? [],
                'calculated_at' => $this->progress_calculated_at?->toIso8601String(),
            ],
            'certificate' => $this->relationLoaded('certificate') && $this->certificate !== null ? [
                'certificate_number' => $this->certificate->certificate_number,
                'issued_at' => $this->certificate->issued_at->toIso8601String(),
                'revoked_at' => $this->certificate->revoked_at?->toIso8601String(),
            ] : null,
        ];
    }

    protected function batchData(): ?array
    {
        if (! $this->relationLoaded('batch') || $this->batch === null) {
            return null;
        }

        return [
            'id' => $this->batch->id,
            'name' => $this->batch->name,
            'code' => $this->batch->code,
            'starts_at' => $this->batch->starts_at?->toIso8601String(),
            'ends_at' => $this->batch->ends_at?->toIso8601String(),
            'mode' => $this->batch->mode->value,
            'timezone' => $this->batch->timezone,
            'status' => $this->batch->status->value,
        ];
    }

    protected function sessionData(): ?array
    {
        if (! $this->relationLoaded('nextSession') || $this->nextSession === null) {
            return null;
        }

        return [
            'id' => $this->nextSession->id,
            'title' => $this->nextSession->title,
            'starts_at' => $this->nextSession->starts_at->toIso8601String(),
            'ends_at' => $this->nextSession->ends_at->toIso8601String(),
            'timezone' => $this->nextSession->timezone,
            'mode' => $this->nextSession->mode->value,
            'mentor_assignment_mode' => $this->nextSession->mentor_assignment_mode->value,
            'location' => $this->nextSession->location,
            'status' => $this->nextSession->status->value,
        ];
    }
}
