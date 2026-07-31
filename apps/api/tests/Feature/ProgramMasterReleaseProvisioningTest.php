<?php

namespace Tests\Feature;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProgramMasterReleaseProvisioningTest extends TestCase
{
    use RefreshDatabase;

    private const MIGRATION = '2026_07_31_000006_provision_program_master_release_data.php';

    private const PERMISSIONS = [
        'manage_programs',
        'manage_program_masters',
    ];

    private const SEED_KEYS = [
        'admin.sidebar.master',
        'admin.sidebar.master.program-levels',
        'admin.sidebar.master.program-types',
    ];

    public function test_migrations_alone_provision_permissions_and_program_master_menus(): void
    {
        foreach (['web', 'sanctum'] as $guard) {
            foreach (self::PERMISSIONS as $permission) {
                $this->assertDatabaseHas('permissions', [
                    'name' => $permission,
                    'guard_name' => $guard,
                ]);
            }
        }

        $master = DB::table('menus')
            ->where('seed_key', 'admin.sidebar.master')
            ->first();

        $this->assertNotNull($master);
        $this->assertSame('Master', $master->name);
        $this->assertNull($master->parent_id);
        $this->assertSame(
            [
                'admin.sidebar.master.program-levels',
                'admin.sidebar.master.program-types',
            ],
            DB::table('menus')
                ->where('parent_id', $master->id)
                ->orderBy('order')
                ->pluck('seed_key')
                ->all()
        );
        $this->assertSame(
            3,
            DB::table('menus')->whereIn('seed_key', self::SEED_KEYS)->count()
        );
        $this->assertDatabaseCount('users', 0);
    }

    public function test_rerun_is_idempotent_and_preserves_custom_menu_hierarchy(): void
    {
        $timestamp = now();
        DB::table('menus')
            ->whereIn('seed_key', [
                'admin.sidebar.master.program-levels',
                'admin.sidebar.master.program-types',
            ])
            ->delete();
        DB::table('menus')
            ->where('seed_key', 'admin.sidebar.master')
            ->delete();

        $legacyMasterId = DB::table('menus')->insertGetId([
            'name' => 'Legacy Master',
            'icon' => 'LegacyDatabase',
            'url' => 'admin://view/program-levels',
            'layout' => 'admin',
            'section' => 'sidebar',
            'parent_id' => null,
            'order' => 99,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
        $legacyLevelId = DB::table('menus')->insertGetId([
            'name' => 'Legacy Level',
            'icon' => 'LegacyLevel',
            'url' => 'admin://view/program-levels',
            'layout' => 'admin',
            'section' => 'sidebar',
            'parent_id' => $legacyMasterId,
            'order' => 91,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
        $legacyTypeId = DB::table('menus')->insertGetId([
            'name' => 'Legacy Type',
            'icon' => 'LegacyType',
            'url' => 'admin://view/program-types',
            'layout' => 'admin',
            'section' => 'sidebar',
            'parent_id' => $legacyMasterId,
            'order' => 92,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
        $customParentId = DB::table('menus')->insertGetId([
            'name' => 'Custom Operations',
            'icon' => 'Wrench',
            'url' => 'admin://view/custom-operations',
            'layout' => 'admin',
            'section' => 'sidebar',
            'parent_id' => null,
            'order' => 90,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
        $customChildId = DB::table('menus')->insertGetId([
            'name' => 'Custom Child',
            'icon' => 'ToolCase',
            'url' => 'admin://view/custom-child',
            'layout' => 'admin',
            'section' => 'sidebar',
            'parent_id' => $customParentId,
            'order' => 1,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $this->releaseMigration()->up();
        $this->releaseMigration()->up();

        $this->assertSame(
            3,
            DB::table('menus')->whereIn('seed_key', self::SEED_KEYS)->count()
        );
        $this->assertSame(
            $legacyMasterId,
            DB::table('menus')
                ->where('seed_key', 'admin.sidebar.master')
                ->value('id')
        );
        $this->assertSame(
            $legacyLevelId,
            DB::table('menus')
                ->where('seed_key', 'admin.sidebar.master.program-levels')
                ->value('id')
        );
        $this->assertSame(
            $legacyTypeId,
            DB::table('menus')
                ->where('seed_key', 'admin.sidebar.master.program-types')
                ->value('id')
        );
        $this->assertDatabaseHas('menus', [
            'id' => $customParentId,
            'name' => 'Custom Operations',
            'url' => 'admin://view/custom-operations',
            'parent_id' => null,
            'order' => 90,
            'seed_key' => null,
        ]);
        $this->assertDatabaseHas('menus', [
            'id' => $customChildId,
            'name' => 'Custom Child',
            'url' => 'admin://view/custom-child',
            'parent_id' => $customParentId,
            'order' => 1,
            'seed_key' => null,
        ]);

        foreach (['web', 'sanctum'] as $guard) {
            foreach (self::PERMISSIONS as $permission) {
                $this->assertSame(
                    1,
                    DB::table('permissions')
                        ->where('name', $permission)
                        ->where('guard_name', $guard)
                        ->count()
                );
            }
        }
    }

    public function test_rerun_assigns_both_permissions_to_existing_full_access_roles(): void
    {
        $timestamp = now();
        $roleIds = [];

        foreach (['web', 'sanctum'] as $guard) {
            foreach (['superadmin', 'direktur'] as $roleName) {
                $roleIds[] = DB::table('roles')->insertGetId([
                    'name' => $roleName,
                    'guard_name' => $guard,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        }

        $unrelatedRoleId = DB::table('roles')->insertGetId([
            'name' => 'admin_operasional',
            'guard_name' => 'web',
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $this->releaseMigration()->up();

        $expectedPermissions = self::PERMISSIONS;
        sort($expectedPermissions);

        foreach ($roleIds as $roleId) {
            $guard = DB::table('roles')->where('id', $roleId)->value('guard_name');

            $this->assertSame(
                $expectedPermissions,
                DB::table('role_has_permissions')
                    ->join(
                        'permissions',
                        'permissions.id',
                        '=',
                        'role_has_permissions.permission_id'
                    )
                    ->where('role_has_permissions.role_id', $roleId)
                    ->where('permissions.guard_name', $guard)
                    ->orderBy('permissions.name')
                    ->pluck('permissions.name')
                    ->all()
            );
        }

        $this->assertSame(
            0,
            DB::table('role_has_permissions')
                ->where('role_id', $unrelatedRoleId)
                ->count()
        );
        $this->assertDatabaseCount('users', 0);
    }

    private function releaseMigration(): Migration
    {
        return require database_path('migrations/'.self::MIGRATION);
    }
}
