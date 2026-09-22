<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class ProgramComponentContentIndexRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-content.view', 'web') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('include_archived')) {
            $this->merge([
                'include_archived' => filter_var($this->input('include_archived'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'include_archived' => ['sometimes', 'boolean'],
        ];
    }
}
