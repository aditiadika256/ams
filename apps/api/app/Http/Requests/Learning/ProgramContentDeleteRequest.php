<?php

namespace App\Http\Requests\Learning;

use App\Http\Requests\BaseFormRequest;

class ProgramContentDeleteRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-content.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:5', 'max:1000']];
    }
}
