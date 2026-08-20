<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use App\Models\ComponentDefinition;
use Illuminate\Validation\Rule;

class ProgramComponentsUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-component.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'components' => ['required', 'array', 'max:50'],
            'components.*.component_definition_id' => [
                'required', 'integer', 'distinct',
                Rule::exists(ComponentDefinition::class, 'id')->where('is_available', true),
            ],
            'components.*.is_enabled' => ['sometimes', 'boolean'],
            'components.*.label' => ['nullable', 'string', 'max:120'],
            'components.*.sort_order' => ['sometimes', 'integer', 'min:0'],
            'components.*.configuration' => ['nullable', 'array'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
