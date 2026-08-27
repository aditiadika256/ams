<?php

namespace App\Http\Requests\Learning;

use App\Http\Requests\BaseFormRequest;

class ProgramCurriculumIndexRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return ($user?->checkPermissionTo('program-content.view', 'web') ?? false)
            || ($user?->checkPermissionTo('program-content.manage', 'web') ?? false);
    }

    public function rules(): array
    {
        return [];
    }
}
