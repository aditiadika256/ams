<?php

namespace App\Http\Requests;

class WorkspaceLessonCompleteRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'idempotency_key' => ['required', 'string', 'max:128'],
        ];
    }
}
