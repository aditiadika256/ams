<?php

namespace App\Http\Requests\Admin;

use App\Enums\ComponentContentStatus;
use App\Http\Requests\BaseFormRequest;
use App\Models\ProgramComponentContent;
use Illuminate\Validation\Rule;

class ProgramComponentContentUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $content = $this->route('content');
        $canUpdate = $content !== null && ($user?->can('update', $content) ?? false);
        $effectiveStatus = $this->has('status')
            ? $this->input('status')
            : $content?->status?->value;
        $canPublish = $effectiveStatus !== ComponentContentStatus::Published->value
            || ($user?->can('publish', $content) ?? false);

        return $canUpdate && $canPublish;
    }

    public function rules(): array
    {
        /** @var ProgramComponentContent $content */
        $content = $this->route('content');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:180'],
            'slug' => [
                'sometimes', 'required', 'string', 'max:190', 'lowercase', 'alpha_dash:ascii',
                Rule::unique(ProgramComponentContent::class, 'slug')
                    ->where('program_component_id', $content->program_component_id)
                    ->ignore($content->id),
            ],
            'summary' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'body' => ['sometimes', 'nullable', 'string', 'max:100000'],
            'external_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'media_asset_id' => ['sometimes', 'nullable', 'integer', Rule::exists('media_assets', 'id')],
            'payload' => ['sometimes', 'nullable', 'array'],
            'status' => ['sometimes', Rule::enum(ComponentContentStatus::class)],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:4294967295'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
