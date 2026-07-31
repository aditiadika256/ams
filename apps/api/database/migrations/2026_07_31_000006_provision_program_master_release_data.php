<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    private const PERMISSION_NAMES = [
        'manage_programs',
        'manage_program_masters',
    ];

    private const GUARDS = [
        'web',
        'sanctum',
    ];

    private const FULL_ACCESS_ROLES = [
        'superadmin',
        'direktur',
    ];

    public function up(): void
    {
        $timestamp = now();

        DB::transaction(function () use ($timestamp): void {
            $this->provisionPermissions($timestamp);
            $this->provisionMenus($timestamp);
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Release data may be user-edited or in use after deployment; preserve it.
    }

    private function provisionPermissions(\DateTimeInterface $timestamp): void
    {
        $permissionRows = [];

        foreach (self::GUARDS as $guard) {
            foreach (self::PERMISSION_NAMES as $permissionName) {
                $permissionRows[] = [
                    'name' => $permissionName,
                    'guard_name' => $guard,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }
        }

        DB::table('permissions')->insertOrIgnore($permissionRows);

        $permissionIds = [];
        $permissions = DB::table('permissions')
            ->whereIn('name', self::PERMISSION_NAMES)
            ->whereIn('guard_name', self::GUARDS)
            ->get(['id', 'name', 'guard_name']);

        foreach ($permissions as $permission) {
            $permissionIds[$permission->guard_name][$permission->name] = $permission->id;
        }

        $rolePermissionRows = [];
        $roles = DB::table('roles')
            ->whereIn('name', self::FULL_ACCESS_ROLES)
            ->whereIn('guard_name', self::GUARDS)
            ->get(['id', 'guard_name']);

        foreach ($roles as $role) {
            foreach (self::PERMISSION_NAMES as $permissionName) {
                $permissionId = $permissionIds[$role->guard_name][$permissionName] ?? null;

                if ($permissionId === null) {
                    continue;
                }

                $rolePermissionRows[] = [
                    'permission_id' => $permissionId,
                    'role_id' => $role->id,
                ];
            }
        }

        if ($rolePermissionRows !== []) {
            DB::table('role_has_permissions')->insertOrIgnore($rolePermissionRows);
        }
    }

    private function provisionMenus(\DateTimeInterface $timestamp): void
    {
        $masterId = $this->provisionMenu(
            seedKey: 'admin.sidebar.master',
            name: 'Master',
            icon: 'Database',
            url: 'admin://view/program-levels',
            layout: 'admin',
            section: 'sidebar',
            parentId: null,
            order: 4,
            timestamp: $timestamp,
        );

        $this->provisionMenu(
            seedKey: 'admin.sidebar.master.program-levels',
            name: 'Master Jenjang / Level',
            icon: 'GraduationCap',
            url: 'admin://view/program-levels',
            layout: 'admin',
            section: 'sidebar',
            parentId: $masterId,
            order: 1,
            timestamp: $timestamp,
        );

        $this->provisionMenu(
            seedKey: 'admin.sidebar.master.program-types',
            name: 'Master Tipe Program',
            icon: 'BookOpen',
            url: 'admin://view/program-types',
            layout: 'admin',
            section: 'sidebar',
            parentId: $masterId,
            order: 2,
            timestamp: $timestamp,
        );
    }

    private function provisionMenu(
        string $seedKey,
        string $name,
        ?string $icon,
        string $url,
        string $layout,
        string $section,
        ?int $parentId,
        int $order,
        \DateTimeInterface $timestamp,
    ): int {
        $this->adoptLegacyMenu(
            seedKey: $seedKey,
            url: $url,
            layout: $layout,
            section: $section,
            parentId: $parentId,
        );

        DB::table('menus')->upsert(
            [[
                'seed_key' => $seedKey,
                'name' => $name,
                'icon' => $icon,
                'url' => $url,
                'layout' => $layout,
                'section' => $section,
                'parent_id' => $parentId,
                'order' => $order,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]],
            ['seed_key'],
            [
                'name',
                'icon',
                'url',
                'layout',
                'section',
                'parent_id',
                'order',
                'updated_at',
            ],
        );

        return (int) DB::table('menus')
            ->where('seed_key', $seedKey)
            ->value('id');
    }

    private function adoptLegacyMenu(
        string $seedKey,
        string $url,
        string $layout,
        string $section,
        ?int $parentId,
    ): void {
        if (DB::table('menus')->where('seed_key', $seedKey)->exists()) {
            return;
        }

        $legacyMenu = DB::table('menus')
            ->whereNull('seed_key')
            ->where('url', $url)
            ->where('layout', $layout)
            ->where('section', $section)
            ->when(
                $parentId === null,
                fn ($query) => $query->whereNull('parent_id'),
                fn ($query) => $query->where('parent_id', $parentId),
            )
            ->orderBy('id')
            ->first(['id']);

        if ($legacyMenu === null) {
            return;
        }

        try {
            DB::table('menus')
                ->where('id', $legacyMenu->id)
                ->whereNull('seed_key')
                ->update(['seed_key' => $seedKey]);
        } catch (QueryException $exception) {
            if (! DB::table('menus')->where('seed_key', $seedKey)->exists()) {
                throw $exception;
            }
        }
    }
};
