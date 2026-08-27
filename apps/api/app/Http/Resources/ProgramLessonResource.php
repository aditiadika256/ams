<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramLessonResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        $accessId = $request->route('programAccess');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content_kind' => $this->content_kind,
            'content_body' => $this->content_body,
            'external_url' => $this->external_url,
            'duration_minutes' => $this->duration_minutes,
            'order' => $this->order,
            'is_published' => $this->is_published,
            'is_preview' => $this->is_preview,
            'media_asset' => $this->whenLoaded('mediaAsset', fn (): ?array => $this->mediaAsset === null ? null : [
                'id' => $this->mediaAsset->id,
                'original_name' => $this->mediaAsset->original_name,
                'mime_type' => $this->mediaAsset->mime_type,
                'size_bytes' => $this->mediaAsset->size_bytes,
                'download_url' => $accessId === null
                    ? null
                    : "/api/v1/workspace/accesses/{$accessId}/media-assets/{$this->mediaAsset->id}",
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
