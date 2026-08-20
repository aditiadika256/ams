<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use App\Models\Tag;
use Illuminate\Validation\Rule;

class ProgramTagsUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-tag.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'tag_ids' => ['required', 'array', 'max:30'],
            'tag_ids.*' => [
                'integer', 'distinct',
                Rule::exists(Tag::class, 'id')
                    ->where('is_active', true)
                    ->whereNull('archived_at'),
            ],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
