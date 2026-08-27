<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rules\File;

class MediaAssetStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('media-asset.upload', 'web') ?? false;
    }

    public function rules(): array
    {
        $extensions = config('components.media.allowed_extensions', []);

        return [
            'file' => [
                'required',
                File::types($extensions)->max((int) config('components.media.max_kilobytes', 102400)),
                'extensions:'.implode(',', $extensions),
            ],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
