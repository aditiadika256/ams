<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class ProgramReferencedException extends RuntimeException implements ShouldntReport
{
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Program tidak dapat dihapus karena memiliki histori.',
            'code' => 'PROGRAM_REFERENCED',
        ], 422);
    }
}
