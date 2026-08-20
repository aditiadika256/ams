<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class DomainValidationException extends RuntimeException implements ShouldntReport
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
        $response = [
            'success' => false,
            'message' => $this->getMessage(),
            'code' => $this->errorCode,
            'context' => $this->details,
        ];

        if (isset($this->details['field'])) {
            $response['errors'] = [$this->details['field'] => [$this->getMessage()]];
        }

        return response()->json($response, 422);
    }

    public function context(): array
    {
        return ['code' => $this->errorCode, ...$this->details];
    }
}
