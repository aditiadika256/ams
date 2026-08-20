<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class TagUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-tag.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'code' => ['prohibited'],
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
