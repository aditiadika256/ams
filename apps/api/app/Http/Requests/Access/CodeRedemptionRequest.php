<?php

namespace App\Http\Requests\Access;

use App\Http\Requests\BaseFormRequest;

class CodeRedemptionRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'min:4', 'max:100'],
            'idempotency_key' => ['required', 'string', 'min:8', 'max:191'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['code' => mb_strtoupper(trim((string) $this->input('code')))]);
    }
}
