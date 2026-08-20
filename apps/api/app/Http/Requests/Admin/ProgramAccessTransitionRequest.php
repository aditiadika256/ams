<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class ProgramAccessTransitionRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'ends_at' => [
                Rule::requiredIf(fn (): bool => $this->route()?->getActionMethod() === 'extend'),
                'nullable',
                'date',
            ],
        ];
    }
}
