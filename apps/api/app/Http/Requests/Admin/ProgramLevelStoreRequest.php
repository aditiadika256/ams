<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use App\Models\ProgramLevel;
use Illuminate\Validation\Rule;

class ProgramLevelStoreRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:20',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique(ProgramLevel::class, 'code'),
            ],
            'name' => ['required', 'string', 'max:100'],
            'row_status' => [
                'sometimes',
                'integer',
                Rule::in([0, 1]),
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
