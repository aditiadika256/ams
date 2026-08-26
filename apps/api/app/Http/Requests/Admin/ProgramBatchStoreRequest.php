<?php

namespace App\Http\Requests\Admin;

use App\Enums\BatchMode;
use App\Http\Requests\BaseFormRequest;
use App\Models\ProgramBatch;
use Illuminate\Validation\Rule;

class ProgramBatchStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-batch.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'code' => [
                'required', 'string', 'max:80', 'alpha_dash:ascii',
                Rule::unique(ProgramBatch::class, 'code')->where('program_id', $this->route('program')->id),
            ],
            'registration_starts_at' => ['nullable', 'date'],
            'registration_ends_at' => ['nullable', 'date', 'after:registration_starts_at'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'mode' => ['required', Rule::enum(BatchMode::class)],
            'location' => ['nullable', 'required_if:mode,OFFLINE,HYBRID', 'string', 'max:500'],
            'timezone' => ['sometimes', 'timezone'],
            'price_override' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'],
            'allow_retakes' => ['sometimes', 'boolean'],
            'metadata' => ['nullable', 'array'],
            'status' => ['prohibited'],
            'enrolled_count' => ['prohibited'],
        ];
    }
}
