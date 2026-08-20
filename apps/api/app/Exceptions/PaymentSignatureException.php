<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class PaymentSignatureException extends RuntimeException implements ShouldntReport
{
    public function __construct()
    {
        parent::__construct('Signature callback pembayaran tidak valid.');
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'code' => 'PAYMENT_SIGNATURE_INVALID',
        ], 401);
    }
}
