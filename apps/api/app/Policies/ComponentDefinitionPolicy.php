<?php

namespace App\Policies;

use App\Models\ComponentDefinition;
use App\Models\User;

class ComponentDefinitionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->checkPermissionTo('component-definition.view', 'web');
    }

    public function view(User $user, ComponentDefinition $componentDefinition): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->checkPermissionTo('component-definition.create', 'web');
    }

    public function update(User $user, ComponentDefinition $componentDefinition): bool
    {
        return $user->checkPermissionTo('component-definition.update', 'web');
    }

    public function delete(User $user, ComponentDefinition $componentDefinition): bool
    {
        return $user->checkPermissionTo('component-definition.delete', 'web');
    }

    public function restore(User $user, ComponentDefinition $componentDefinition): bool
    {
        return $user->checkPermissionTo('component-definition.restore', 'web');
    }

    public function forceDelete(User $user, ComponentDefinition $componentDefinition): bool
    {
        return $user->hasRole('superadmin')
            && $user->checkPermissionTo('component-definition.force-delete', 'web');
    }
}
