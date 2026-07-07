<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;

class ProgramUpdateRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'level' => ['sometimes', 'string', 'in:sd,smp,sma,cpns,umum'],
            'type' => ['sometimes', 'string', 'in:tryout,bimbel,bootcamp'],
            'price' => ['sometimes', 'integer', 'min:0'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}

