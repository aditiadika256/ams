<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;

class OrderStoreRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'programs' => ['required', 'array', 'min:1'],
            'programs.*.id' => ['required', 'integer', 'exists:programs,id'],
            'programs.*.quantity' => ['sometimes', 'integer', 'min:1'],
            'payment_provider' => ['sometimes', 'string', 'max:50'],
            'payment_reference' => ['sometimes', 'string', 'max:100'],
            'meta' => ['sometimes', 'array'],
        ];
    }
}

