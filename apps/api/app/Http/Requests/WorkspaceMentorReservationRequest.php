<?php

namespace App\Http\Requests;

use App\Models\SessionMentorAssignment;
use Illuminate\Validation\Rule;

class WorkspaceMentorReservationRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'mentor_assignment_id' => ['required', 'integer', Rule::exists(SessionMentorAssignment::class, 'id')],
            'idempotency_key' => ['required', 'string', 'max:128'],
        ];
    }
}
