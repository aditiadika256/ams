<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class MediaAssetDeleteRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        if ($user->hasRole(['superadmin', 'super_admin', 'direktur'])
            || $user->hasRole('superadmin', 'web')
            || $user->hasRole('superadmin', 'sanctum')) {
            return true;
        }

        return $user->can('media-asset.delete')
            || $user->can('program-component.manage')
            || $user->can('component-definition.delete');
    }

    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:5', 'max:1000']];
    }
}
