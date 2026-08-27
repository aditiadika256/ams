<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class ComponentDefinitionIndexRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', \App\Models\ComponentDefinition::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:120'],
            'include_archived' => ['sometimes', 'boolean'],
        ];
    }
}
