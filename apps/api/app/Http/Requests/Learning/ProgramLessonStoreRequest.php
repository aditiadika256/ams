<?php

namespace App\Http\Requests\Learning;

use App\Enums\ComponentHandlerTemplate;
use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class ProgramLessonStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return ($user?->checkPermissionTo('program-content.manage', 'web') ?? false)
            && (! $this->boolean('is_published') || ($user?->checkPermissionTo('program-content.publish', 'web') ?? false));
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:190', 'lowercase', 'alpha_dash:ascii'],
            'content_kind' => ['required', Rule::in($this->contentKinds())],
            'content_type' => ['prohibited'],
            'content_url' => ['prohibited'],
            'content_body' => ['nullable', 'string', 'max:100000'],
            'external_url' => ['nullable', 'string', 'max:2048'],
            'media_asset_id' => ['nullable', 'integer', Rule::exists('media_assets', 'id')],
            'duration_minutes' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
            'is_preview' => ['sometimes', 'boolean'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('slug') && $this->filled('title')) {
            $this->merge(['slug' => str($this->input('title'))->slug()->toString()]);
        }
    }

    /** @return array<int, string> */
    private function contentKinds(): array
    {
        return [
            ComponentHandlerTemplate::Information->value,
            ComponentHandlerTemplate::EmbeddedPage->value,
            ComponentHandlerTemplate::ExternalLink->value,
            ComponentHandlerTemplate::FileDownload->value,
            ComponentHandlerTemplate::Video->value,
        ];
    }
}
