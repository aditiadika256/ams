<?php

namespace App\Exceptions;

use App\Enums\ProgramStatus;
use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class InvalidProgramTransitionException extends RuntimeException implements ShouldntReport
{
    public function __construct(
        public readonly ProgramStatus $from,
        public readonly ProgramStatus $to,
    ) {
        parent::__construct("Program cannot transition from {$from->value} to {$to->value}.");
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Transisi status Program tidak valid.',
            'code' => 'INVALID_PROGRAM_TRANSITION',
            'context' => ['from' => $this->from->value, 'to' => $this->to->value],
        ], 409);
    }

    public function context(): array
    {
        return ['from' => $this->from->value, 'to' => $this->to->value];
    }
}
