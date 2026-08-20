<?php

namespace App\Http\Requests\Access;

use App\Http\Requests\BaseFormRequest;

class ExamStartRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'package_id' => ['required', 'integer', 'exists:exam_packages,id'],
            'program_access_id' => ['required', 'integer'],
        ];
    }
}
