<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class ProgramTransitionRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:5', 'max:1000']];
    }
}
