<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class WorkspaceProgressResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'status' => $this->status->value,
            'progress' => [
                'percent' => (float) $this->progress_percent,
                'breakdown' => $this->progress_breakdown ?? [],
                'calculated_at' => $this->progress_calculated_at?->toIso8601String(),
            ],
            'certificate' => $this->whenLoaded('certificate', fn () => $this->certificate === null ? null : [
                'certificate_number' => $this->certificate->certificate_number,
                'issued_at' => $this->certificate->issued_at->toIso8601String(),
            ]),
        ];
    }
}
