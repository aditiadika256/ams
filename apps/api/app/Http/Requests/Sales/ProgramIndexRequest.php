<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;
use App\Models\ComponentDefinition;
use App\Models\Tag;
use Illuminate\Validation\Rule;

class ProgramIndexRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:120'],
            'tag' => ['sometimes', 'string', 'max:80', Rule::exists(Tag::class, 'code')->where('is_active', true)],
            'component' => ['sometimes', 'string', 'max:80', Rule::exists(ComponentDefinition::class, 'code')->where('is_available', true)],
            'min_price' => ['sometimes', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'numeric', 'min:0', 'gte:min_price'],
            'sort_by' => ['sometimes', Rule::in(['name', 'base_price', 'published_at'])],
            'sort_dir' => ['sometimes', Rule::in(['asc', 'desc'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
