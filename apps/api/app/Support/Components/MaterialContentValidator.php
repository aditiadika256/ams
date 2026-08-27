<?php

namespace App\Support\Components;

use App\Enums\ComponentHandlerTemplate;
use App\Exceptions\ProgramCompositionException;
use App\Models\MediaAsset;
use App\Models\Program;

class MaterialContentValidator
{
    public function validate(Program $program, array $data): void
    {
        $kind = ComponentHandlerTemplate::from($data['content_kind']);
        $mediaAssetId = $data['media_asset_id'] ?? null;

        if ($mediaAssetId !== null && ! MediaAsset::query()
            ->whereKey($mediaAssetId)
            ->where('program_id', $program->id)
            ->exists()) {
            $this->invalid('File tidak ditemukan pada Program ini.', ['media_asset_id']);
        }

        if (! ($data['is_published'] ?? false)) {
            return;
        }

        match ($kind) {
            ComponentHandlerTemplate::Information,
            ComponentHandlerTemplate::EmbeddedPage => $this->requireBody($data),
            ComponentHandlerTemplate::ExternalLink => $this->requireHttps($data['external_url'] ?? null),
            ComponentHandlerTemplate::FileDownload => $this->requireMedia($mediaAssetId),
            ComponentHandlerTemplate::Video => $mediaAssetId === null
                ? $this->requireHttps($data['external_url'] ?? null)
                : null,
            default => $this->invalid('Jenis materi tidak didukung.', ['content_kind']),
        };
    }

    private function requireBody(array $data): void
    {
        if (trim((string) ($data['content_body'] ?? '')) === '') {
            $this->invalid('Isi materi wajib diisi sebelum lesson dipublikasikan.', ['content_body']);
        }
    }

    private function requireMedia(mixed $mediaAssetId): void
    {
        if ($mediaAssetId === null) {
            $this->invalid('File privat wajib dipilih sebelum lesson dipublikasikan.', ['media_asset_id']);
        }
    }

    private function requireHttps(mixed $url): void
    {
        if (! is_string($url) || filter_var($url, FILTER_VALIDATE_URL) === false
            || strtolower((string) parse_url($url, PHP_URL_SCHEME)) !== 'https') {
            $this->invalid('URL HTTPS yang valid wajib diisi sebelum lesson dipublikasikan.', ['external_url']);
        }
    }

    /** @param array<int, string> $fields */
    private function invalid(string $message, array $fields): never
    {
        throw new ProgramCompositionException(
            'MATERIAL_CONTENT_INVALID',
            $message,
            ['fields' => $fields],
        );
    }
}
