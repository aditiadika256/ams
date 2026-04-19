<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;

class ProgramUpdateRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'level' => ['sometimes', 'string', 'in:sd,smp,sma,cpns'],
            'type' => ['sometimes', 'string', 'in:tryout,bimbel'],
            'price' => ['sometimes', 'integer', 'min:0'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}

