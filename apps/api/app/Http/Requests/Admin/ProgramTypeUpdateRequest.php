<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class ProgramTypeUpdateRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['prohibited'],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'row_status' => [
                'sometimes',
                'integer',
                Rule::in([-1, 0, 1]),
            ],
            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
                'max:65535',
            ],
        ];
    }
}
