<?php

namespace App\Policies;

use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use App\Models\User;

class ProgramComponentContentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->checkPermissionTo('program-content.view', 'web');
    }

    public function view(User $user, ProgramComponentContent $content): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user, ProgramComponent $programComponent): bool
    {
        return $user->checkPermissionTo('program-content.manage', 'web');
    }

    public function update(User $user, ProgramComponentContent $content): bool
    {
        return $user->checkPermissionTo('program-content.manage', 'web');
    }

    public function publish(User $user, ProgramComponentContent|ProgramComponent $subject): bool
    {
        return $user->checkPermissionTo('program-content.publish', 'web');
    }

    public function delete(User $user, ProgramComponentContent $content): bool
    {
        return $user->checkPermissionTo('program-content.manage', 'web');
    }

    public function restore(User $user, ProgramComponentContent $content): bool
    {
        return $user->checkPermissionTo('program-content.manage', 'web');
    }
}
