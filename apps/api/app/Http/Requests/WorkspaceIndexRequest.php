<?php

namespace App\Http\Requests;

use App\Enums\AccessStatus;
use Illuminate\Validation\Rule;

class WorkspaceIndexRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'tag' => ['nullable', 'string', 'max:80', 'exists:tags,code'],
            'status' => ['nullable', Rule::enum(AccessStatus::class)],
            'archived' => ['nullable', 'boolean'],
            'sort_by' => ['nullable', Rule::in(['last_accessed_at', 'created_at', 'starts_at', 'name'])],
            'sort_dir' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
