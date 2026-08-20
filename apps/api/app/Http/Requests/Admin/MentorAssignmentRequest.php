<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use App\Models\Mentor;
use Illuminate\Validation\Rule;

class MentorAssignmentRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('mentor-assignment.manage', 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'mentor_id' => ['required', 'integer', Rule::exists(Mentor::class, 'id')],
            'role' => ['sometimes', Rule::in(['lead', 'co_mentor', 'reviewer', 'substitute'])],
            'metadata' => ['nullable', 'array'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
