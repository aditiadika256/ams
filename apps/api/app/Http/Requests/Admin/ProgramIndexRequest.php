<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProgramStatus;
use App\Enums\ProgramVisibility;
use App\Http\Requests\BaseFormRequest;
use App\Models\Program;
use Illuminate\Validation\Rule;

class ProgramIndexRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Program::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:120'],
            'status' => ['sometimes', Rule::enum(ProgramStatus::class)],
            'visibility' => ['sometimes', Rule::enum(ProgramVisibility::class)],
            'tag' => ['sometimes', 'string', 'max:80'],
            'component' => ['sometimes', 'string', 'max:80'],
            'sort_by' => ['sometimes', Rule::in(['name', 'base_price', 'created_at', 'updated_at'])],
            'sort_dir' => ['sometimes', Rule::in(['asc', 'desc'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
