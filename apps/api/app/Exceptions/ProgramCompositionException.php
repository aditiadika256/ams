<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class ProgramCompositionException extends RuntimeException implements ShouldntReport
{
    public function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly array $details = [],
    ) {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'code' => $this->errorCode,
            'context' => $this->details,
        ], 422);
    }

    public function context(): array
    {
        return ['code' => $this->errorCode, ...$this->details];
    }
}
