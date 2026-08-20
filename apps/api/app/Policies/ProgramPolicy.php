<?php

namespace App\Policies;

use App\Models\Program;
use App\Models\User;

class ProgramPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->checkPermissionTo('program.view', 'web');
    }

    public function view(User $user, Program $program): bool
    {
        return $user->checkPermissionTo('program.view', 'web');
    }

    public function create(User $user): bool
    {
        return $user->checkPermissionTo('program.create', 'web');
    }

    public function update(User $user, Program $program): bool
    {
        return $user->checkPermissionTo('program.update', 'web');
    }

    public function publish(User $user, Program $program): bool
    {
        return $user->checkPermissionTo('program.publish', 'web');
    }

    public function archive(User $user, Program $program): bool
    {
        return $user->checkPermissionTo('program.archive', 'web');
    }

    public function clone(User $user, Program $program): bool
    {
        return $user->checkPermissionTo('program.clone', 'web');
    }

    public function delete(User $user, Program $program): bool
    {
        return $this->archive($user, $program);
    }
}
