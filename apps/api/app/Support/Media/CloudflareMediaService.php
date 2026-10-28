<?php

namespace App\Support\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CloudflareMediaService
{
    /**
     * Determine if Cloudflare R2 / CDN is configured and enabled.
     */
    public function isConfigured(): bool
    {
        $enabled = (bool) config('components.media.cloudflare.enabled', false);
        $hasCdnUrl = ! empty(config('components.media.cloudflare.cdn_url'))
            || ! empty(config('components.media.cloudflare.public_url'));
        $hasEndpoint = ! empty(config('filesystems.disks.cloudflare-r2-private.endpoint'))
            || ! empty(config('filesystems.disks.cloudflare-r2.endpoint'));

        return $enabled || ($hasCdnUrl && $hasEndpoint);
    }

    /**
     * Get the configured Cloudflare disk name (public or private).
     */
    public function getDisk(bool $isPublic = false): string
    {
        if ($isPublic) {
            return (string) config('components.media.cloudflare.public_disk', 'cloudflare-r2-public');
        }

        return (string) config('components.media.cloudflare.disk', 'cloudflare-r2-private');
    }

    /**
     * Get the private disk name.
     */
    public function getPrivateDisk(): string
    {
        return $this->getDisk(false);
    }

    /**
     * Get the public disk name.
     */
    public function getPublicDisk(): string
    {
        return $this->getDisk(true);
    }

    /**
     * Resolve the public or edge CDN URL for a given object key.
     */
    public function getCdnUrl(?string $objectKey, ?string $disk = null): ?string
    {
        if (empty($objectKey)) {
            return null;
        }

        // For private files, direct public CDN access is disabled unless explicit
        if ($disk === 'cloudflare-r2-private' && empty(config('components.media.cloudflare.cdn_url'))) {
            return null;
        }

        $cdnBase = config('components.media.cloudflare.public_url')
            ?: config('components.media.cloudflare.cdn_url')
            ?: config('filesystems.disks.cloudflare-r2-public.url');

        if (! empty($cdnBase)) {
            return rtrim((string) $cdnBase, '/') . '/' . ltrim($objectKey, '/');
        }

        return null;
    }

    /**
     * Upload an uploaded file to Cloudflare R2 / Object Storage with edge CDN support.
     *
     * @param  UploadedFile  $file
     * @param  string  $directory  Directory prefix (e.g. "programs/1/2026/10")
     * @param  array<string, mixed>  $options
     * @return array{
     *     disk: string,
     *     object_key: string,
     *     original_name: string,
     *     mime_type: string,
     *     extension: string,
     *     size_bytes: int,
     *     checksum_sha256: string,
     *     cdn_url: ?string
     * }
     */
    public function upload(UploadedFile $file, string $directory, array $options = []): array
    {
        $isPublic = (bool) ($options['is_public'] ?? false);
        $disk = $options['disk'] ?? ($this->isConfigured() ? $this->getDisk($isPublic) : (string) config('components.media.disk', 'component-media-local'));
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = (string) Str::ulid() . ($extension ? ".{$extension}" : '');
        $objectKey = rtrim($directory, '/') . '/' . $filename;

        $checksum = hash_file('sha256', $file->getRealPath());
        if ($checksum === false) {
            throw new RuntimeException('Gagal menghitung checksum SHA-256 berkas media.');
        }

        $visibility = $options['visibility'] ?? ($isPublic ? 'public' : 'private');
        $stored = Storage::disk($disk)->putFileAs(
            rtrim($directory, '/'),
            $file,
            $filename,
            [
                'visibility' => $visibility,
                'ContentType' => $file->getMimeType() ?: 'application/octet-stream',
            ]
        );

        if ($stored === false) {
            throw new RuntimeException("Gagal menyimpan berkas media ke storage disk [{$disk}].");
        }

        return [
            'disk' => $disk,
            'object_key' => $objectKey,
            'original_name' => $this->sanitizeFilename($file->getClientOriginalName()),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'extension' => $extension,
            'size_bytes' => (int) $file->getSize(),
            'checksum_sha256' => $checksum,
            'cdn_url' => $this->getCdnUrl($objectKey, $disk),
        ];
    }

    /**
     * Upload directly to the public bucket (for profile photos, product images, banners, logos).
     */
    public function uploadPublic(UploadedFile $file, string $directory, array $options = []): array
    {
        return $this->upload($file, $directory, array_merge($options, [
            'is_public' => true,
            'visibility' => 'public',
            'disk' => $this->getPublicDisk(),
        ]));
    }

    /**
     * Upload directly to the private bucket (for sensitive docs, user files, private course modules).
     */
    public function uploadPrivate(UploadedFile $file, string $directory, array $options = []): array
    {
        return $this->upload($file, $directory, array_merge($options, [
            'is_public' => false,
            'visibility' => 'private',
            'disk' => $this->getPrivateDisk(),
        ]));
    }

    /**
     * Delete an object key from the specified disk or default cloudflare disk.
     */
    public function delete(string $objectKey, ?string $disk = null): bool
    {
        $targetDisk = $disk ?? ($this->isConfigured() ? $this->getDisk() : (string) config('components.media.disk', 'component-media-local'));

        if (Storage::disk($targetDisk)->exists($objectKey)) {
            return Storage::disk($targetDisk)->delete($objectKey);
        }

        return false;
    }

    /**
     * Create a streamed response for viewing (inline) or downloading.
     */
    public function createStreamResponse(
        string $disk,
        string $objectKey,
        string $originalName,
        string $mimeType,
        bool $inline = false
    ): StreamedResponse {
        $storage = Storage::disk($disk);

        if (! $storage->exists($objectKey)) {
            abort(404, 'Berkas media tidak ditemukan pada storage.');
        }

        $disposition = $inline ? 'inline' : 'attachment';
        $safeName = $this->sanitizeFilename($originalName);

        $headers = [
            'Content-Type' => $mimeType ?: 'application/octet-stream',
            'Content-Disposition' => "{$disposition}; filename=\"{$safeName}\"",
            'Cache-Control' => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ];

        return $storage->response($objectKey, $safeName, $headers, $disposition);
    }

    /**
     * Sanitize original filename for safe storage and downloads.
     */
    public function sanitizeFilename(string $name): string
    {
        $sanitized = preg_replace('/[^a-zA-Z0-9_\-\.\(\) ]/', '_', $name);

        return trim((string) $sanitized) ?: 'media_asset';
    }
}
