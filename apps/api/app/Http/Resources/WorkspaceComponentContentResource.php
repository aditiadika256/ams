<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * @OA\Schema(
 *     schema="WorkspaceComponentContentResource",
 *     title="Workspace Component Content Resource",
 *     description="Representasi konten komponen pada portal siswa/peserta",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="Modul Pembelajaran"),
 *     @OA\Property(property="slug", type="string", example="modul-pembelajaran"),
 *     @OA\Property(property="summary", type="string", nullable=true),
 *     @OA\Property(property="body", type="string", nullable=true),
 *     @OA\Property(property="external_url", type="string", nullable=true),
 *     @OA\Property(property="payload", type="object", nullable=true),
 *     @OA\Property(property="sort_order", type="integer", example=1),
 *     @OA\Property(property="published_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(
 *         property="media_asset",
 *         type="object",
 *         nullable=true,
 *         @OA\Property(property="id", type="integer"),
 *         @OA\Property(property="original_name", type="string"),
 *         @OA\Property(property="mime_type", type="string"),
 *         @OA\Property(property="size_bytes", type="integer"),
 *         @OA\Property(property="download_url", type="string"),
 *         @OA\Property(property="view_url", type="string"),
 *         @OA\Property(property="cdn_url", type="string", nullable=true)
 *     )
 * )
 */
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
                'view_url' => "/api/v1/workspace/accesses/{$accessId}/media-assets/{$this->mediaAsset->id}?inline=1",
                'cdn_url' => $this->mediaAsset->cdn_url,
            ]),
        ];
    }
}
