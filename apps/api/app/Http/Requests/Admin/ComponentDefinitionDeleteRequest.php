<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class ComponentDefinitionDeleteRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('delete', $this->route('componentDefinition')) ?? false;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
