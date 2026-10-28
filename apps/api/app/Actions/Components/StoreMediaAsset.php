<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\MediaAsset;
use App\Models\Program;
use App\Models\User;
use App\Support\Media\CloudflareMediaService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Throwable;

class StoreMediaAsset
{
    public function __construct(
        private readonly RecordDomainAudit $audit,
        private readonly CloudflareMediaService $cloudflareMedia,
    ) {}

    public function handle(
        ?Program $program,
        UploadedFile $file,
        User $actor,
        string $reason,
        ?string $folder = 'general'
    ): MediaAsset {
        $cleanFolder = trim((string) $folder) ?: 'general';
        $directory = $program
            ? sprintf('programs/%d/%s', $program->id, now()->format('Y/m'))
            : sprintf('media-library/%s/%s', $cleanFolder, now()->format('Y/m'));

        $uploaded = $this->cloudflareMedia->upload($file, $directory);

        $disk = $uploaded['disk'];
        $objectKey = $uploaded['object_key'];
        $extension = $uploaded['extension'];
        $checksum = $uploaded['checksum_sha256'];

        try {
            return DB::transaction(function () use (
                $program,
                $file,
                $actor,
                $reason,
                $disk,
                $objectKey,
                $extension,
                $checksum,
                $cleanFolder,
            ): MediaAsset {
                $asset = MediaAsset::query()->create([
                    'program_id' => $program?->id,
                    'uploaded_by' => $actor->id,
                    'created_by' => $actor->id,
                    'updated_by' => $actor->id,
                    'folder' => $cleanFolder,
                    'disk' => $disk,
                    'object_key' => $objectKey,
                    'original_name' => $this->safeOriginalName($file),
                    'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                    'extension' => $extension,
                    'size_bytes' => $file->getSize(),
                    'checksum_sha256' => $checksum,
                ]);

                $this->audit->handle(
                    $asset,
                    'media_asset.uploaded',
                    $actor,
                    $reason,
                    after: $asset->only([
                        'id', 'program_id', 'folder', 'original_name', 'mime_type', 'extension',
                        'size_bytes', 'checksum_sha256',
                    ]),
                );

                return $asset;
            });
        } catch (Throwable $exception) {
            $this->cloudflareMedia->delete($objectKey, $disk);

            throw $exception;
        }
    }

    private function safeOriginalName(UploadedFile $file): string
    {
        $name = basename(str_replace('\\', '/', $file->getClientOriginalName()));
        $name = preg_replace('/[\x00-\x1F\x7F]/u', '', $name) ?: 'download';

        return mb_substr($name, 0, 255);
    }
}
