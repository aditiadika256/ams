<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class ProgramComponentContentIndexRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-content.view', 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'include_archived' => ['sometimes', 'boolean'],
        ];
    }
}
