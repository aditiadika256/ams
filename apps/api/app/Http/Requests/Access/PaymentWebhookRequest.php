<?php

namespace App\Http\Requests\Access;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class PaymentWebhookRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'string', 'max:100'],
            'status_code' => ['required', 'string', 'max:10'],
            'gross_amount' => ['required', 'decimal:0,2'],
            'transaction_status' => [
                'required',
                Rule::in(['capture', 'settlement', 'deny', 'expire', 'cancel', 'pending']),
            ],
            'fraud_status' => ['nullable', Rule::in(['accept', 'challenge', 'deny'])],
            'signature_key' => ['required', 'string', 'max:128'],
        ];
    }

    public function hasValidSignature(): bool
    {
        $secret = config('services.payment.webhook_secret');

        if (! is_string($secret) || $secret === '') {
            return false;
        }

        $expected = hash(
            'sha512',
            $this->string('order_id')
                .$this->string('status_code')
                .$this->string('gross_amount')
                .$secret,
        );

        return hash_equals($expected, (string) $this->input('signature_key'));
    }
}
