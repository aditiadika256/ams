<?php

namespace App\Observers;

use App\Models\Menu;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class MenuObserver
{
    /**
     * Handle the Menu "saved" event (triggered on both create and update).
     *
     * Ensures that any permission required by this menu:
     * 1. Is automatically created in the database for both 'web' and 'sanctum' guards if not exists.
     * 2. Is automatically granted to Superadmin and Direktur roles so that administrators
     *    never lose access to menus they create.
     * 3. Flushes Spatie cached permissions and updates the menu cache version.
     */
    public function saved(Menu $menu): void
    {
        if (empty($menu->required_permission)) {
            Cache::forever('menus:cache_version', Str::uuid()->toString());
            return;
        }

        $permissions = explode('|', $menu->required_permission);
        $rolesToSync = ['superadmin', 'direktur'];
        $guards = ['web', 'sanctum'];
        $hasNewGrant = false;

        foreach ($permissions as $permissionName) {
            $permissionName = trim($permissionName);
            if ($permissionName === '' || $permissionName === 'auth' || $permissionName === 'authenticated' || $permissionName === '*') {
                continue;
            }

            foreach ($guards as $guard) {
                $permission = Permission::firstOrCreate([
                    'name' => $permissionName,
                    'guard_name' => $guard,
                ]);

                foreach ($rolesToSync as $roleName) {
                    $role = Role::firstOrCreate([
                        'name' => $roleName,
                        'guard_name' => $guard,
                    ]);

                    if (! $role->hasPermissionTo($permission)) {
                        $role->givePermissionTo($permission);
                        $hasNewGrant = true;
                    }
                }
            }
        }

        if ($hasNewGrant) {
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        }

        Cache::forever('menus:cache_version', Str::uuid()->toString());
    }

    /**
     * Handle the Menu "deleted" event.
     */
    public function deleted(Menu $menu): void
    {
        Cache::forever('menus:cache_version', Str::uuid()->toString());
    }
}
