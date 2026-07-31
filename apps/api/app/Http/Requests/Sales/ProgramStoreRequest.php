<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;
use App\Models\ProgramLevel;
use App\Models\ProgramType;
use Illuminate\Validation\Rule;

class ProgramStoreRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'program_level_id' => [
                'required',
                'integer',
                Rule::exists(ProgramLevel::class, 'id')->where('row_status', 1),
            ],
            'program_type_id' => [
                'required',
                'integer',
                Rule::exists(ProgramType::class, 'id')->where('row_status', 1),
            ],
            'price' => ['required', 'integer', 'min:0'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
