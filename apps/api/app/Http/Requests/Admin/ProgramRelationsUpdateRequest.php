<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use App\Models\Program;
use Illuminate\Validation\Rule;

class ProgramRelationsUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-component.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'children' => ['required', 'array', 'max:50'],
            'children.*.program_id' => ['required', 'integer', 'distinct', Rule::exists(Program::class, 'id')],
            'children.*.sort_order' => ['sometimes', 'integer', 'min:0'],
            'children.*.is_required' => ['sometimes', 'boolean'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
