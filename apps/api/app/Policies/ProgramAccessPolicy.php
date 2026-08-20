<?php

namespace App\Policies;

use App\Models\ProgramAccess;
use App\Models\User;

class ProgramAccessPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->checkPermissionTo('program-access.view', 'web');
    }

    public function view(User $user, ProgramAccess $access): bool
    {
        return $access->user_id === $user->id
            || $user->checkPermissionTo('program-access.view', 'web');
    }

    public function grant(User $user): bool
    {
        return $user->checkPermissionTo('program-access.grant', 'web');
    }

    public function activate(User $user, ProgramAccess $access): bool
    {
        return $this->grant($user);
    }

    public function suspend(User $user, ProgramAccess $access): bool
    {
        return $user->checkPermissionTo('program-access.suspend', 'web');
    }

    public function restore(User $user, ProgramAccess $access): bool
    {
        return $this->suspend($user, $access);
    }

    public function revoke(User $user, ProgramAccess $access): bool
    {
        return $user->checkPermissionTo('program-access.revoke', 'web');
    }

    public function extend(User $user, ProgramAccess $access): bool
    {
        return $user->checkPermissionTo('program-access.extend', 'web');
    }
}
