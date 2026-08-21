<?php

namespace App\Http\Requests\Learning;

use App\Http\Requests\BaseFormRequest;

class ProgramModuleStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return ($user?->checkPermissionTo('program-content.manage', 'web') ?? false)
            && (! $this->boolean('is_published') || ($user?->checkPermissionTo('program-content.publish', 'web') ?? false));
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
