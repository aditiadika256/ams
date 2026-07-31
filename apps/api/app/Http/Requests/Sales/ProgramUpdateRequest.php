<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;
use App\Models\ProgramLevel;
use App\Models\ProgramType;
use Illuminate\Validation\Rule;

class ProgramUpdateRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'program_level_id' => [
                'sometimes',
                'integer',
                Rule::exists(ProgramLevel::class, 'id')->where('row_status', 1),
            ],
            'program_type_id' => [
                'sometimes',
                'integer',
                Rule::exists(ProgramType::class, 'id')->where('row_status', 1),
            ],
            'price' => ['sometimes', 'integer', 'min:0'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
