<?php

namespace App\Http\Requests;

class WorkspaceComponentSubmissionRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'max:50'],
        ];
    }
}
