<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use App\Models\Branch;

class RolesSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Default Branch (Pusat)
        $pusat = Branch::firstOrCreate(
            ['code' => 'PUSAT'],
            ['name' => 'Kantor Pusat', 'is_active' => true]
        );

        // 2. Define Permissions
        $permissions = [
            // Dashboard
            'view_dashboard_global',
            'view_dashboard_branch',
            'view_dashboard_finance',
            'view_dashboard_learning',
            
            // Activities
            'view_all_activities',
            'view_branch_activities',
            
            // Global Settings
            'manage_global_settings',
            
            // User Management
            'manage_users_global', // Create, read, update, delete, assign roles globally
            'manage_users_branch', // Read only (or manage) within branch
            
            // Branch Management (Master Cabang)
            'manage_branches', // CRUD branches, link users
            
            // Role Management (Master Role)
            'manage_roles', // CRUD roles, assign permissions
            
            // Permission Management
            'view_permissions',
            
            // Finance
            'view_finance_analytics',
            'view_finance_reports',
            
            // Learning / Mentoring
            'manage_students',
            'view_student_progress',
            'manage_learning_content',
            
            // General
            'view_profile',
            'edit_profile',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'sanctum']);
        }

        // 3. Define Roles & Assign Permissions
        $rolesStructure = [
            'superadmin' => $permissions, // All permissions
            'direktur' => $permissions,   // All permissions (similar to Super Admin)
            
            'manajer_cabang' => [
                'view_dashboard_branch',
                'view_branch_activities',
                'manage_users_branch', // View detail user sesuai cabang
                'view_profile',
                'edit_profile',
                // Add specific branch management permissions if needed
            ],
            
            'admin_keuangan' => [
                'view_dashboard_finance',
                'view_finance_analytics',
                'view_finance_reports',
                'view_profile',
                'edit_profile',
            ],
            
            'admin_cabang' => [
                'view_dashboard_branch',
                'manage_users_branch',
                'view_profile',
                'edit_profile',
            ],
            
            // Other Admins (Placeholder permissions, customize as needed)
            'admin_kemitraan' => ['view_dashboard_global', 'view_profile', 'edit_profile'],
            'admin_operasional' => ['view_dashboard_global', 'view_profile', 'edit_profile'],
            'admin_teknologi' => ['view_dashboard_global', 'view_profile', 'edit_profile'],
            'admin_pemasaran' => ['view_dashboard_global', 'view_profile', 'edit_profile'],
            
            'mentor_harian' => [
                'view_dashboard_learning',
                'manage_students',
                'view_student_progress',
                'view_profile',
                'edit_profile',
            ],
            
            'mentor_utama' => [
                'view_dashboard_learning',
                'manage_students',
                'view_student_progress',
                'manage_learning_content',
                'view_profile',
                'edit_profile',
            ],
            
            'member' => [
                'view_dashboard_learning',
                'view_profile',
                'edit_profile',
            ],
            
            'student' => [ // Previously 'siswa'
                'view_dashboard_learning',
                'view_profile',
                'edit_profile',
            ],
        ];

        foreach ($rolesStructure as $roleName => $rolePermissions) {
            // Web Guard
            $roleWeb = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $roleWeb->syncPermissions($rolePermissions);

            // Sanctum Guard
            $roleSanctum = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'sanctum']);
            $roleSanctum->syncPermissions($rolePermissions);
        }

        // 4. Create Demo Users
        // Super Admin
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@arkanin.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'branch_id' => $pusat->id,
            ]
        );
        $superadmin->assignRole('superadmin');
        $superadmin->assignRole(Role::findByName('superadmin', 'sanctum'));

        // Direktur
        $direktur = User::firstOrCreate(
            ['email' => 'direktur@arkanin.com'],
            [
                'name' => 'Bapak Direktur',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'branch_id' => $pusat->id,
            ]
        );
        $direktur->assignRole('direktur');

        // Manajer Cabang (Demo Branch)
        $cabangJakarta = Branch::firstOrCreate(
            ['code' => 'JKT01'],
            ['name' => 'Cabang Jakarta Selatan', 'is_active' => true]
        );
        
        $manajer = User::firstOrCreate(
            ['email' => 'manajer.jkt@arkanin.com'],
            [
                'name' => 'Manajer Jakarta',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'branch_id' => $cabangJakarta->id,
            ]
        );
        $manajer->assignRole('manajer_cabang');
        $manajer->assignRole(Role::findByName('manajer_cabang', 'sanctum'));

        // Admin Keuangan
        $finance = User::firstOrCreate(
            ['email' => 'finance@arkanin.com'],
            [
                'name' => 'Staff Keuangan',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'branch_id' => $pusat->id,
            ]
        );
        $finance->assignRole('admin_keuangan');
        $finance->assignRole(Role::findByName('admin_keuangan', 'sanctum'));
    }
}
