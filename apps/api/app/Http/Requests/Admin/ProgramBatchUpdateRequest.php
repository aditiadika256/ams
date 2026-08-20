<?php

namespace App\Http\Requests\Admin;

use App\Enums\BatchMode;
use App\Http\Requests\BaseFormRequest;
use App\Models\ProgramBatch;
use Illuminate\Validation\Rule;

class ProgramBatchUpdateRequest extends BaseFormRequest
{
    protected function prepareForValidation(): void
    {
        $batch = $this->route('batch');
        $this->merge([
            'registration_starts_at' => $this->input('registration_starts_at', $batch->registration_starts_at?->toIso8601String()),
            'registration_ends_at' => $this->input('registration_ends_at', $batch->registration_ends_at?->toIso8601String()),
            'starts_at' => $this->input('starts_at', $batch->starts_at?->toIso8601String()),
            'ends_at' => $this->input('ends_at', $batch->ends_at?->toIso8601String()),
        ]);
    }

    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-batch.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        $batch = $this->route('batch');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'code' => [
                'sometimes', 'required', 'string', 'max:80', 'alpha_dash:ascii',
                Rule::unique(ProgramBatch::class, 'code')
                    ->where('program_id', $this->route('program')->id)
                    ->ignore($batch->id),
            ],
            'registration_starts_at' => ['nullable', 'date'],
            'registration_ends_at' => ['nullable', 'date', 'after:registration_starts_at'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'capacity' => ['nullable', 'integer', 'min:'.max(1, $batch->enrolled_count)],
            'mode' => ['sometimes', Rule::enum(BatchMode::class)],
            'location' => ['nullable', 'required_if:mode,OFFLINE,HYBRID', 'string', 'max:500'],
            'timezone' => ['sometimes', 'timezone'],
            'price_override' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'],
            'allow_retakes' => ['sometimes', 'boolean'],
            'metadata' => ['nullable', 'array'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'status' => ['prohibited'],
            'enrolled_count' => ['prohibited'],
        ];
    }
}
