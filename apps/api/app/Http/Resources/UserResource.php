<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class UserResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->pluck('name');
            }, []),
            'permissions' => $this->when($this->relationLoaded('roles'), function () {
                if ($this->hasRole(['superadmin', 'super_admin'])) {
                    return \Spatie\Permission\Models\Permission::pluck('name')
                        ->prepend('*')
                        ->unique()
                        ->values();
                }

                return $this->getAllPermissions()->pluck('name');
            }, []),
            'avatar_url' => $this->avatar_url,
            'provider' => $this->provider,
            'branch_id' => $this->branch_id,
            'branch' => $this->branch ? [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
                'code' => $this->branch->code,
            ] : null,
            'mentor' => $this->mentor ? [
                'id' => $this->mentor->id,
                'specialization' => $this->mentor->specialization,
                'bio' => $this->mentor->bio,
                'experience_years' => $this->mentor->experience_years,
            ] : null,
            'profile' => $this->profile ? new UserProfileResource($this->profile) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [];
    }
}

