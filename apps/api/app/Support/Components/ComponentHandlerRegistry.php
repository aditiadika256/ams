<?php

namespace App\Support\Components;

use App\Enums\ComponentHandlerTemplate;

class ComponentHandlerRegistry
{
    private const NATIVE_HANDLERS = [
        'material' => true,
        'meeting' => true,
        'assessment' => true,
        'certificate' => true,
        'attendance' => false,
        'qr_attendance' => false,
        'assignment' => false,
        'discussion' => false,
        'shipping' => false,
        'consultation' => false,
        'ai_tutor' => false,
        'live_chat' => false,
    ];

    /** @return array<int, string> */
    public function nativeKeys(): array
    {
        return array_keys(self::NATIVE_HANDLERS);
    }

    public function hasNativeHandler(?string $handlerKey): bool
    {
        return $handlerKey !== null && array_key_exists($handlerKey, self::NATIVE_HANDLERS);
    }

    public function isImplemented(ComponentHandlerTemplate $template, ?string $handlerKey): bool
    {
        if ($template !== ComponentHandlerTemplate::Native) {
            return true;
        }

        return $this->hasNativeHandler($handlerKey) && self::NATIVE_HANDLERS[$handlerKey] === true;
    }
}
