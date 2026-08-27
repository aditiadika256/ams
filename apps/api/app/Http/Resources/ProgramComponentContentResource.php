<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramComponentContentResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_component_id' => $this->program_component_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'summary' => $this->summary,
            'body' => $this->body,
            'external_url' => $this->external_url,
            'payload' => $this->payload,
            'status' => $this->status->value,
            'published_at' => $this->published_at?->toIso8601String(),
            'sort_order' => $this->sort_order,
            'media_asset' => $this->whenLoaded('mediaAsset', fn (): ?array => $this->mediaAsset === null ? null : [
                'id' => $this->mediaAsset->id,
                'original_name' => $this->mediaAsset->original_name,
                'mime_type' => $this->mediaAsset->mime_type,
                'size_bytes' => $this->mediaAsset->size_bytes,
            ]),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
