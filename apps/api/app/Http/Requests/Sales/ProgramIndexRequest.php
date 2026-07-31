<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;
use App\Models\ProgramLevel;
use App\Models\ProgramType;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ProgramIndexRequest extends BaseFormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('active')) {
            $active = $this->input('active');
            if ($active === 'true') {
                $this->merge(['active' => true]);
            } elseif ($active === 'false') {
                $this->merge(['active' => false]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'level' => [
                'sometimes',
                'string',
                Rule::exists(ProgramLevel::class, 'code')->where('row_status', 1),
            ],
            'type' => [
                'sometimes',
                'string',
                Rule::exists(ProgramType::class, 'code')->where('row_status', 1),
            ],
            'program_level_id' => [
                'sometimes',
                'integer',
                Rule::exists(ProgramLevel::class, 'id')->where('row_status', 1),
            ],
            'program_type_id' => [
                'sometimes',
                'integer',
                Rule::exists(ProgramType::class, 'id')->where('row_status', 1),
            ],
            'active' => ['sometimes', 'boolean'],
            'search' => ['sometimes', 'string', 'max:255'],
            'sort_by' => ['sometimes', 'string', 'in:name,price,created_at'],
            'sort_dir' => ['sometimes', 'string', 'in:asc,desc'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $this->validateProgramLevelPair($validator);
                $this->validateProgramTypePair($validator);
            },
        ];
    }

    private function validateProgramLevelPair(Validator $validator): void
    {
        if (
            !$this->filled('level')
            || !$this->filled('program_level_id')
            || $validator->errors()->has('level')
            || $validator->errors()->has('program_level_id')
        ) {
            return;
        }

        $matches = ProgramLevel::query()
            ->active()
            ->whereKey($this->integer('program_level_id'))
            ->where('code', $this->input('level'))
            ->exists();

        if (!$matches) {
            $validator->errors()->add(
                'program_level_id',
                'The selected program level ID does not match the level code.'
            );
        }
    }

    private function validateProgramTypePair(Validator $validator): void
    {
        if (
            !$this->filled('type')
            || !$this->filled('program_type_id')
            || $validator->errors()->has('type')
            || $validator->errors()->has('program_type_id')
        ) {
            return;
        }

        $matches = ProgramType::query()
            ->active()
            ->whereKey($this->integer('program_type_id'))
            ->where('code', $this->input('type'))
            ->exists();

        if (!$matches) {
            $validator->errors()->add(
                'program_type_id',
                'The selected program type ID does not match the type code.'
            );
        }
    }
}
