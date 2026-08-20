<?php

namespace App\Http\Requests\Admin;

use App\Enums\SessionMode;
use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class ProgramSessionStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-session.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:10000'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'timezone' => ['sometimes', 'timezone'],
            'mode' => ['required', Rule::enum(SessionMode::class)],
            'location' => ['nullable', 'required_if:mode,OFFLINE,HYBRID', 'string', 'max:500'],
            'meeting_url' => ['nullable', 'required_if:mode,ONLINE,HYBRID', 'url', 'max:2048'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'metadata' => ['nullable', 'array'],
            'status' => ['prohibited'],
            'reserved_count' => ['prohibited'],
        ];
    }
}
