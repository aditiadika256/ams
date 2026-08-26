<?php

namespace App\Http\Requests\Admin;

use App\Enums\MentorAssignmentMode;
use App\Enums\SessionMode;
use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class ProgramSessionUpdateRequest extends BaseFormRequest
{
    protected function prepareForValidation(): void
    {
        $session = $this->route('session');
        $this->merge([
            'starts_at' => $this->input('starts_at', $session->starts_at->toIso8601String()),
            'ends_at' => $this->input('ends_at', $session->ends_at->toIso8601String()),
        ]);
    }

    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('program-session.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        $session = $this->route('session');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:10000'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'timezone' => ['sometimes', 'timezone'],
            'mode' => ['sometimes', Rule::enum(SessionMode::class)],
            'mentor_assignment_mode' => ['sometimes', Rule::enum(MentorAssignmentMode::class)],
            'location' => ['nullable', 'required_if:mode,OFFLINE,HYBRID', 'string', 'max:500'],
            'meeting_url' => ['nullable', 'required_if:mode,ONLINE,HYBRID', 'url', 'max:2048'],
            'capacity' => ['nullable', 'integer', 'min:'.max(1, $session->reserved_count)],
            'metadata' => ['nullable', 'array'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'status' => ['prohibited'],
            'reserved_count' => ['prohibited'],
        ];
    }
}
