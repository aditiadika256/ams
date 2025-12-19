<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;

class OrderIndexRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', 'in:pending,paid,expired,failed'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}

