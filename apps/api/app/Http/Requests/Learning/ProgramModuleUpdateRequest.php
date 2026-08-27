<?php

namespace App\Http\Requests\Learning;

use App\Http\Requests\BaseFormRequest;

class ProgramModuleUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $module = $this->route('module');
        $requiresPublishPermission = ($module?->is_published ?? false)
            || $this->boolean('is_published');

        return ($user?->checkPermissionTo('program-content.manage', 'web') ?? false)
            && (! $requiresPublishPermission || ($user?->checkPermissionTo('program-content.publish', 'web') ?? false));
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
