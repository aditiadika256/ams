<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * @OA\Schema(
 *     schema="MediaAssetResource",
 *     title="Media Asset Resource",
 *     description="Representasi data berkas media privat program dengan dukungan Cloudflare CDN",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="program_id", type="integer", example=10),
 *     @OA\Property(property="original_name", type="string", example="Modul-01.pdf"),
 *     @OA\Property(property="mime_type", type="string", example="application/pdf"),
 *     @OA\Property(property="extension", type="string", example="pdf"),
 *     @OA\Property(property="size_bytes", type="integer", example=1048576),
 *     @OA\Property(property="checksum_sha256", type="string", example="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
 *     @OA\Property(property="cdn_url", type="string", nullable=true, example="https://cdn.example.com/programs/10/2026/10/asset.pdf"),
 *     @OA\Property(property="deleted_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 */
class MediaAssetResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'extension' => $this->extension,
            'size_bytes' => $this->size_bytes,
            'checksum_sha256' => $this->checksum_sha256,
            'cdn_url' => $this->cdn_url,
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
