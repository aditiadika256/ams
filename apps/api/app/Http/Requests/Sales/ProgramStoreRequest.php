<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;

class ProgramStoreRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'in:sd,smp,sma,cpns,umum'],
            'type' => ['required', 'string', 'in:tryout,bimbel,bootcamp'],
            'price' => ['required', 'integer', 'min:0'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}

