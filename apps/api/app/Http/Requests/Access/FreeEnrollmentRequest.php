<?php

namespace App\Http\Requests\Access;

use App\Http\Requests\BaseFormRequest;

class FreeEnrollmentRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'program_batch_id' => ['nullable', 'integer', 'exists:program_batches,id'],
        ];
    }
}
