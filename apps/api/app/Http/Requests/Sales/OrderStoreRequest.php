<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;

class OrderStoreRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'programs' => ['required', 'array', 'min:1'],
            'programs.*.id' => ['required', 'integer', 'distinct', 'exists:programs,id'],
            'programs.*.batch_id' => ['nullable', 'integer', 'exists:program_batches,id'],
            'programs.*.quantity' => ['sometimes', 'integer', 'min:1', 'max:1'],
            'payment_provider' => ['sometimes', 'string', 'max:50'],
            'payment_reference' => ['prohibited'],
            'meta' => ['sometimes', 'array'],
        ];
    }
}
