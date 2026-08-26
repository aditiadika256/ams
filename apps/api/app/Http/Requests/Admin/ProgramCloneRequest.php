<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use App\Models\Program;
use Illuminate\Validation\Rule;

class ProgramCloneRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash:ascii', Rule::unique(Program::class, 'slug')],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
