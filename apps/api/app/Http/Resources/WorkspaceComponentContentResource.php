<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class WorkspaceComponentContentResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        $accessId = $request->route('programAccess');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'summary' => $this->summary,
            'body' => $this->body,
            'external_url' => $this->external_url,
            'payload' => $this->payload,
            'sort_order' => $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
            'media_asset' => $this->whenLoaded('mediaAsset', fn (): ?array => $this->mediaAsset === null ? null : [
                'id' => $this->mediaAsset->id,
                'original_name' => $this->mediaAsset->original_name,
                'mime_type' => $this->mediaAsset->mime_type,
                'size_bytes' => $this->mediaAsset->size_bytes,
                'download_url' => "/api/v1/workspace/accesses/{$accessId}/media-assets/{$this->mediaAsset->id}",
            ]),
        ];
    }
}
