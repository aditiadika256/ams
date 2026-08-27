<?php

namespace App\Http\Requests\Learning;

use App\Enums\ComponentHandlerTemplate;
use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class ProgramLessonUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $lesson = $this->route('lesson');
        $requiresPublishPermission = ($lesson?->is_published ?? false)
            || $this->boolean('is_published');

        return ($user?->checkPermissionTo('program-content.manage', 'web') ?? false)
            && (! $requiresPublishPermission || ($user?->checkPermissionTo('program-content.publish', 'web') ?? false));
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:190', 'lowercase', 'alpha_dash:ascii'],
            'content_kind' => ['sometimes', Rule::in([
                ComponentHandlerTemplate::Information->value,
                ComponentHandlerTemplate::EmbeddedPage->value,
                ComponentHandlerTemplate::ExternalLink->value,
                ComponentHandlerTemplate::FileDownload->value,
                ComponentHandlerTemplate::Video->value,
            ])],
            'content_type' => ['prohibited'],
            'content_url' => ['prohibited'],
            'content_body' => ['sometimes', 'nullable', 'string', 'max:100000'],
            'external_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'media_asset_id' => ['sometimes', 'nullable', 'integer', Rule::exists('media_assets', 'id')],
            'duration_minutes' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
            'is_preview' => ['sometimes', 'boolean'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
