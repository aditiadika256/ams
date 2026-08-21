<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class MediaAssetDeleteRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->checkPermissionTo('media-asset.delete', 'web') ?? false;
    }

    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:5', 'max:1000']];
    }
}
