<?php

namespace App\Actions\Components;

use App\Enums\ComponentHandlerTemplate;
use App\Exceptions\DomainAuthorizationException;
use App\Exceptions\DomainConflictException;
use App\Exceptions\ProgramCompositionException;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use App\Models\ProgramComponentSubmission;
use App\Models\User;
use App\Support\Access\ComponentAccessGate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SubmitProgramComponentForm
{
    public function __construct(private readonly ComponentAccessGate $componentGate) {}

    /** @return array{submission: ProgramComponentSubmission, created: bool} */
    public function handle(
        User $user,
        ProgramAccess $programAccess,
        ProgramComponent $programComponent,
        ProgramComponentContent $content,
        array $answers,
    ): array {
        return DB::transaction(function () use ($user, $programAccess, $programComponent, $content, $answers): array {
            $access = ProgramAccess::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->findOrFail($programAccess->id);
            $component = ProgramComponent::query()
                ->with('definition')
                ->lockForUpdate()
                ->findOrFail($programComponent->id);
            $model = ProgramComponentContent::query()
                ->published()
                ->lockForUpdate()
                ->findOrFail($content->id);

            if ($component->program_id !== $access->program_id
                || $model->program_component_id !== $component->id
                || $component->definition->handler_template !== ComponentHandlerTemplate::Form
                || ! $this->componentGate->allows($user, $access, $component->definition->code)) {
                throw new DomainAuthorizationException(
                    'COMPONENT_ACCESS_DENIED',
                    'Form tidak tersedia untuk enrollment ini.',
                    ['program_access_id' => $access->id],
                );
            }

            $this->validateAnswers($model->payload['fields'] ?? [], $answers);
            $existing = ProgramComponentSubmission::query()
                ->where('program_component_content_id', $model->id)
                ->where('program_access_id', $access->id)
                ->lockForUpdate()
                ->first();

            if ($existing !== null) {
                if ($existing->payload === $answers) {
                    return ['submission' => $existing, 'created' => false];
                }

                throw new DomainConflictException(
                    'FORM_ALREADY_SUBMITTED',
                    'Form ini sudah memiliki submission untuk enrollment tersebut.',
                    ['submission_id' => $existing->id],
                );
            }

            $submission = ProgramComponentSubmission::query()->create([
                'program_component_content_id' => $model->id,
                'program_access_id' => $access->id,
                'user_id' => $user->id,
                'payload' => $answers,
                'submitted_at' => now(),
            ]);

            return ['submission' => $submission, 'created' => true];
        });
    }

    private function validateAnswers(array $fields, array $answers): void
    {
        $allowedKeys = collect($fields)->pluck('key')->filter()->all();
        $unknownKeys = array_diff(array_keys($answers), $allowedKeys);
        $rules = [];

        foreach ($fields as $field) {
            $key = $field['key'];
            $fieldRules = [($field['required'] ?? false) ? 'required' : 'sometimes'];
            $fieldRules = [...$fieldRules, ...match ($field['type']) {
                'text', 'textarea' => ['string', 'max:5000'],
                'email' => ['email:rfc', 'max:320'],
                'number' => ['numeric'],
                'select' => [Rule::in($field['options'] ?? [])],
                'checkbox' => ['boolean'],
                'date' => ['date_format:Y-m-d'],
                default => ['prohibited'],
            }];
            $rules["answers.{$key}"] = $fieldRules;
        }

        $validator = Validator::make(['answers' => $answers], $rules);
        if ($unknownKeys !== [] || $validator->fails()) {
            throw new ProgramCompositionException(
                'FORM_SUBMISSION_INVALID',
                'Jawaban form tidak sesuai schema yang dipublikasikan.',
                [
                    'unknown_fields' => array_values($unknownKeys),
                    'errors' => $validator->errors()->toArray(),
                ],
            );
        }
    }
}
