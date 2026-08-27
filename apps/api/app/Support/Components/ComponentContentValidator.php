<?php

namespace App\Support\Components;

use App\Enums\ComponentContentStatus;
use App\Enums\ComponentHandlerTemplate;
use App\Exceptions\ProgramCompositionException;
use App\Models\MediaAsset;
use App\Models\ProgramComponent;

class ComponentContentValidator
{
    private const FORM_FIELD_TYPES = [
        'text', 'textarea', 'email', 'number', 'select', 'checkbox', 'date',
    ];

    public function validate(ProgramComponent $component, array $data): void
    {
        $component->loadMissing('definition');
        $definition = $component->definition;

        if ($definition === null || $definition->trashed() || ! $definition->is_available) {
            $this->invalid('Component tidak tersedia untuk pengelolaan isi.');
        }

        if ($definition->handler_template === ComponentHandlerTemplate::Native) {
            throw new ProgramCompositionException(
                'NATIVE_COMPONENT_CONTENT_UNSUPPORTED',
                'Component native menggunakan editor domain khusus, bukan generic content.',
                ['component' => $definition->code],
            );
        }

        $this->validatePayloadLimits($data['payload'] ?? null);

        if (($data['status'] ?? ComponentContentStatus::Draft->value) !== ComponentContentStatus::Published->value) {
            return;
        }

        match ($definition->handler_template) {
            ComponentHandlerTemplate::Information,
            ComponentHandlerTemplate::EmbeddedPage => $this->requireBody($data),
            ComponentHandlerTemplate::ExternalLink => $this->requireHttpsUrl($data['external_url'] ?? null),
            ComponentHandlerTemplate::FileDownload => $this->requireProgramAsset($component, $data['media_asset_id'] ?? null),
            ComponentHandlerTemplate::Video => $this->validateVideo($component, $data),
            ComponentHandlerTemplate::Form => $this->validateForm($data['payload'] ?? null),
            ComponentHandlerTemplate::Iframe => $this->validateIframe($data['external_url'] ?? null),
            ComponentHandlerTemplate::Native => null,
        };
    }

    private function requireBody(array $data): void
    {
        if (trim((string) ($data['body'] ?? '')) === '') {
            $this->invalid('Body wajib diisi sebelum content dipublikasikan.', ['body']);
        }
    }

    private function requireHttpsUrl(mixed $url): void
    {
        if (! is_string($url) || filter_var($url, FILTER_VALIDATE_URL) === false
            || strtolower((string) parse_url($url, PHP_URL_SCHEME)) !== 'https') {
            $this->invalid('URL HTTPS yang valid wajib diisi sebelum content dipublikasikan.', ['external_url']);
        }
    }

    private function requireProgramAsset(ProgramComponent $component, mixed $mediaAssetId): void
    {
        if (! is_int($mediaAssetId) && ! ctype_digit((string) $mediaAssetId)) {
            $this->invalid('File privat wajib dipilih sebelum content dipublikasikan.', ['media_asset_id']);
        }

        $exists = MediaAsset::query()
            ->whereKey((int) $mediaAssetId)
            ->where('program_id', $component->program_id)
            ->exists();

        if (! $exists) {
            $this->invalid('File tidak ditemukan pada Program ini.', ['media_asset_id']);
        }
    }

    private function validateVideo(ProgramComponent $component, array $data): void
    {
        if (! empty($data['media_asset_id'])) {
            $this->requireProgramAsset($component, $data['media_asset_id']);

            return;
        }

        $this->requireHttpsUrl($data['external_url'] ?? null);
    }

    private function validateIframe(mixed $url): void
    {
        $this->requireHttpsUrl($url);
        $host = strtolower((string) parse_url((string) $url, PHP_URL_HOST));
        $allowedHosts = array_map('strtolower', config('components.iframe_allowed_hosts', []));

        if ($allowedHosts === [] || ! in_array($host, $allowedHosts, true)) {
            $this->invalid('Host iframe tidak termasuk allowlist aplikasi.', ['external_url']);
        }
    }

    private function validateForm(mixed $payload): void
    {
        $fields = is_array($payload) ? ($payload['fields'] ?? null) : null;
        $maxFields = (int) config('components.content.max_form_fields', 50);

        if (! is_array($fields) || $fields === [] || count($fields) > $maxFields) {
            $this->invalid('Form wajib memiliki field yang valid.', ['payload.fields']);
        }

        $keys = [];
        foreach ($fields as $index => $field) {
            $key = is_array($field) ? ($field['key'] ?? null) : null;
            $label = is_array($field) ? ($field['label'] ?? null) : null;
            $type = is_array($field) ? ($field['type'] ?? null) : null;
            $allowedKeys = ['key', 'label', 'type', 'required', 'options'];

            if (! is_array($field) || array_diff(array_keys($field), $allowedKeys) !== []
                || ! is_string($key) || preg_match('/^[a-z][a-z0-9_]{0,63}$/', $key) !== 1
                || ! is_string($label) || trim($label) === '' || mb_strlen($label) > 120
                || ! in_array($type, self::FORM_FIELD_TYPES, true)
                || in_array($key, $keys, true)) {
                $this->invalid('Schema field form tidak valid atau memiliki key duplikat.', ["payload.fields.{$index}"]);
            }

            if ($type === 'select' && (! isset($field['options']) || ! is_array($field['options']) || $field['options'] === [])) {
                $this->invalid('Field select wajib memiliki options.', ["payload.fields.{$index}.options"]);
            }

            $keys[] = $key;
        }
    }

    private function validatePayloadLimits(mixed $payload): void
    {
        if ($payload === null) {
            return;
        }

        if (! is_array($payload)) {
            $this->invalid('Payload content harus berupa object JSON.', ['payload']);
        }

        $encoded = json_encode($payload, JSON_THROW_ON_ERROR);
        if (strlen($encoded) > (int) config('components.content.max_payload_bytes', 65536)
            || $this->depth($payload) > (int) config('components.content.max_payload_depth', 8)) {
            $this->invalid('Payload content melewati batas ukuran atau kedalaman.', ['payload']);
        }
    }

    private function depth(array $value): int
    {
        $depth = 1;
        foreach ($value as $item) {
            if (is_array($item)) {
                $depth = max($depth, 1 + $this->depth($item));
            }
        }

        return $depth;
    }

    /** @param array<int, string> $fields */
    private function invalid(string $message, array $fields = []): never
    {
        throw new ProgramCompositionException(
            'COMPONENT_CONTENT_INVALID',
            $message,
            ['fields' => $fields],
        );
    }
}
