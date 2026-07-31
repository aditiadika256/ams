<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class ProgramMasterIndexRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:100'],
            'row_status' => [
                'sometimes',
                'integer',
                Rule::in([-1, 0, 1]),
            ],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort_by' => [
                'sometimes',
                'string',
                Rule::in(['name', 'code', 'sort_order', 'created_at']),
            ],
            'sort_dir' => [
                'sometimes',
                'string',
                Rule::in(['asc', 'desc']),
            ],
        ];
    }
}
