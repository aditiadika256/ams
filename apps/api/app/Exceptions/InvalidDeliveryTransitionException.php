<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class InvalidDeliveryTransitionException extends RuntimeException implements ShouldntReport
{
    public function __construct(
        public readonly string $resource,
        public readonly string $from,
        public readonly string $to,
    ) {
        parent::__construct("{$resource} cannot transition from {$from} to {$to}.");
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => "Transisi status {$this->resource} tidak valid.",
            'code' => 'INVALID_'.strtoupper($this->resource).'_TRANSITION',
            'context' => ['from' => $this->from, 'to' => $this->to],
        ], 409);
    }

    public function context(): array
    {
        return ['resource' => $this->resource, 'from' => $this->from, 'to' => $this->to];
    }
}
