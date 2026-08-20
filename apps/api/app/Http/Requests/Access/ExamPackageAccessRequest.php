<?php

namespace App\Http\Requests\Access;

use App\Http\Requests\BaseFormRequest;

class ExamPackageAccessRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'program_access_id' => ['required', 'integer'],
        ];
    }
}
