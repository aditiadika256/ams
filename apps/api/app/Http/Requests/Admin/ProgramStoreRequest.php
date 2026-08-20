<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProgramVisibility;
use App\Http\Requests\BaseFormRequest;
use App\Models\Program;
use Illuminate\Validation\Rule;

class ProgramStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Program::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash:ascii', Rule::unique(Program::class, 'slug')],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:20000'],
            'thumbnail_url' => ['nullable', 'url', 'max:2048'],
            'cover_url' => ['nullable', 'url', 'max:2048'],
            'base_price' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'currency' => ['sometimes', 'string', 'size:3', Rule::in(['IDR'])],
            'visibility' => ['required', Rule::enum(ProgramVisibility::class)],
            'completion_rule' => ['nullable', 'array'],
            'level' => ['prohibited'],
            'type' => ['prohibited'],
            'program_level_id' => ['prohibited'],
            'program_type_id' => ['prohibited'],
        ];
    }
}
