<?php

namespace App\Http\Requests\Admin;

use App\Enums\ComponentContentStatus;
use App\Http\Requests\BaseFormRequest;
use App\Models\ProgramComponentContent;
use Illuminate\Validation\Rule;

class ProgramComponentContentStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $canManage = $user?->checkPermissionTo('program-content.manage', 'web') ?? false;
        $canPublish = $this->input('status') !== ComponentContentStatus::Published->value
            || ($user?->checkPermissionTo('program-content.publish', 'web') ?? false);

        return $canManage && $canPublish;
    }

    public function rules(): array
    {
        $componentId = $this->route('programComponent')?->id;

        return [
            'title' => ['required', 'string', 'max:180'],
            'slug' => [
                'required', 'string', 'max:190', 'lowercase', 'alpha_dash:ascii',
                Rule::unique(ProgramComponentContent::class, 'slug')
                    ->where('program_component_id', $componentId),
            ],
            'summary' => ['nullable', 'string', 'max:5000'],
            'body' => ['nullable', 'string', 'max:100000'],
            'external_url' => ['nullable', 'string', 'max:2048'],
            'media_asset_id' => ['nullable', 'integer', Rule::exists('media_assets', 'id')],
            'payload' => ['nullable', 'array'],
            'status' => ['sometimes', Rule::enum(ComponentContentStatus::class)],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:4294967295'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('slug') && $this->filled('title')) {
            $this->merge(['slug' => str($this->input('title'))->slug()->toString()]);
        }
    }
}
