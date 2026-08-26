<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProgramVisibility;
use App\Http\Requests\BaseFormRequest;
use App\Models\Program;
use Illuminate\Validation\Rule;

class ProgramUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $program = $this->route('program');

        return $program instanceof Program && ($this->user()?->can('update', $program) ?? false);
    }

    public function rules(): array
    {
        $program = $this->route('program');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash:ascii', Rule::unique(Program::class, 'slug')->ignore($program)],
            'short_description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'description' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'thumbnail_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'cover_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'base_price' => ['sometimes', 'numeric', 'min:0', 'decimal:0,2'],
            'currency' => ['sometimes', 'string', 'size:3', Rule::in(['IDR'])],
            'visibility' => ['sometimes', Rule::enum(ProgramVisibility::class)],
            'completion_rule' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
