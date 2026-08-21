<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Models\MediaAsset;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class StoreMediaAsset
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(Program $program, UploadedFile $file, User $actor, string $reason): MediaAsset
    {
        $disk = (string) config('components.media.disk');
        $extension = strtolower($file->getClientOriginalExtension());
        $objectKey = sprintf(
            'programs/%d/%s/%s.%s',
            $program->id,
            now()->format('Y/m'),
            (string) Str::ulid(),
            $extension,
        );
        $checksum = hash_file('sha256', $file->getRealPath());

        if ($checksum === false) {
            throw new RuntimeException('Unable to calculate uploaded file checksum.');
        }

        $stored = Storage::disk($disk)->putFileAs(
            dirname($objectKey),
            $file,
            basename($objectKey),
            ['visibility' => 'private'],
        );

        if ($stored === false) {
            throw new RuntimeException('Unable to store uploaded component media.');
        }

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
            ): MediaAsset {
                $asset = MediaAsset::query()->create([
                    'program_id' => $program->id,
                    'uploaded_by' => $actor->id,
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
                        'id', 'program_id', 'original_name', 'mime_type', 'extension',
                        'size_bytes', 'checksum_sha256',
                    ]),
                );

                return $asset;
            });
        } catch (Throwable $exception) {
            Storage::disk($disk)->delete($objectKey);

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
