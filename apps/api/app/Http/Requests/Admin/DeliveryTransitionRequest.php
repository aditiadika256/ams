<?php

namespace App\Http\Requests\Admin;

use App\Enums\BatchStatus;
use App\Enums\SessionStatus;
use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class DeliveryTransitionRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $permission = $this->route('session') === null
            ? 'program-batch.manage'
            : 'program-session.manage';

        return $this->user()?->checkPermissionTo($permission, 'web') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                $this->route('session') === null
                    ? Rule::enum(BatchStatus::class)
                    : Rule::enum(SessionStatus::class),
            ],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
