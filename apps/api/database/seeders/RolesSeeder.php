<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

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

        // 2. Define Comprehensive Permissions per Feature (Based on PRD-ams-admin-menus.md)
        $permissions = [
            // --- 1. Dashboard ---
            'view_dashboard_global',
            'view_dashboard_branch',
            'view_dashboard_finance',
            'view_dashboard_learning',
            'view_dashboard_admin',
            'view_all_activities',
            'view_branch_activities',

            // --- 2. Personal & HR ---
            'manage_users_global',
            'manage_users_branch',
            'view_users',
            'manage_parent_relations',
            'manage_branches',
            'view_branches',
            'manage_roles',
            'view_permissions',
            'manage_permissions',
            'manage_mentors',
            'view_mentors',
            'manage_mentor_applications',
            'view_profile',
            'edit_profile',

            // --- 3. Landing Page (CMS) ---
            'manage_cms_content',
            'publish_cms_content',
            'manage_landing_layout',

            // --- 4. Master Assessment (Layer 1 CBT) ---
            'assessment-context.view',
            'assessment-context.create',
            'assessment-context.update',
            'assessment-context.delete',
            'assessment-question.view',
            'assessment-question.create',
            'assessment-question.update',
            'assessment-question.delete',
            'assessment-question.review',

            // --- 5. Schedule Tool ---
            'schedule-available-time.view',
            'schedule-available-time.manage',
            'schedule-physical-room.view',
            'schedule-physical-room.manage',

            // --- 6. Component Tool (Layer 2 CBT & Reusable Modules) ---
            'component-definition.view',
            'component-definition.create',
            'component-definition.update',
            'component-definition.delete',
            'component-definition.restore',
            'component-definition.force-delete',
            'media-asset.view',
            'media-asset.upload',
            'media-asset.delete',
            'assessment-blueprint.view',
            'assessment-blueprint.manage',
            'certificate-template.view',
            'certificate-template.manage',
            'component-forum.manage',
            'component-participant.manage',
            'component-schedule.manage',
            'component-link.manage',

            // --- 7. Workspace (Layer 3 CBT & Program Delivery) ---
            'program.view',
            'program.create',
            'program.update',
            'program.publish',
            'program.archive',
            'program.clone',
            'program-tag.manage',
            'program-component.manage',
            'program-content.view',
            'program-content.manage',
            'program-content.publish',
            'program-batch.manage',
            'program-session.manage',
            'mentor-assignment.manage',
            'program-access.view',
            'program-access.grant',
            'program-access.suspend',
            'program-access.revoke',
            'program-access.extend',
            'enrollment.view',
            'enrollment.manage',
            'installment.manage',
            'installment.bypass',

            // --- 8. Monitor (Layer 4 CBT - Live Proctoring & Item Analytics) ---
            'monitor-proctoring.view',
            'monitor-proctoring.control',
            'monitor-session.view',
            'monitor-session.manage',
            'monitor-result.view',
            'monitor-result.export',
            'monitor-analysis.view',
            'monitor-analysis.calculate-irt',
            'monitor-analysis.drop-question',
            'certificate-validation.view',
            'certificate-validation.approve',
            'schedule-evaluation.view',
            'schedule-evaluation.manage',

            // --- 9. Materials ---
            'materials-topic.view',
            'materials-topic.manage',
            'materials-classification.manage',
            'materials-support.manage',
            'materials-educational.manage',

            // --- 10. Finance ---
            'view_finance_analytics',
            'view_finance_reports',
            'finance-voucher.view',
            'finance-voucher.manage',
            'finance-order.view',
            'finance-order.manage',
            'finance-invoice.view',
            'finance-invoice.manage',
            'finance-transaction.view',
            'finance-transaction.approve',
            'finance-withdrawal.view',
            'finance-withdrawal.approve',
            'finance-withdrawal.reject',
            'finance-report.view',
            'finance-report.export',

            // --- 11. Store & Gamification ---
            'store-catalog.view',
            'store-catalog.manage',
            'store-points.view',
            'store-points.manage',
            'store-shipments.view',
            'store-shipments.manage',

            // --- 12. System ---
            'manage_global_settings',
            'manage_menus',
            'view_documentation',
            'manage_documentation',

            // --- 13. Database ---
            'database-manager.view',
            'database-manager.execute',
            'database-backup.view',
            'database-backup.create',
            'database-backup.restore',

            // --- Legacy Compatibility Keys ---
            'manage_students',
            'view_student_progress',
            'manage_learning_content',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'sanctum']);
        }

        // 3. Define Roles & Baseline Permissions Matrix
        $rolesStructure = [
            'superadmin' => $permissions,
            'direktur' => $permissions,

            'manajer_cabang' => [
                'view_dashboard_branch',
                'view_branch_activities',
                'manage_users_branch',
                'view_users',
                'manage_parent_relations',
                'schedule-available-time.view',
                'schedule-physical-room.view',
                'schedule-physical-room.manage',
                'program.view',
                'enrollment.view',
                'schedule-evaluation.view',
                'schedule-evaluation.manage',
                'view_profile',
                'edit_profile',
            ],

            'admin_keuangan' => [
                'view_dashboard_finance',
                'view_finance_analytics',
                'view_finance_reports',
                'finance-voucher.view',
                'finance-voucher.manage',
                'finance-order.view',
                'finance-order.manage',
                'finance-invoice.view',
                'finance-invoice.manage',
                'finance-transaction.view',
                'finance-transaction.approve',
                'finance-withdrawal.view',
                'finance-withdrawal.approve',
                'finance-withdrawal.reject',
                'finance-report.view',
                'finance-report.export',
                'enrollment.view',
                'installment.manage',
                'installment.bypass',
                'view_profile',
                'edit_profile',
            ],

            'admin_cabang' => [
                'view_dashboard_branch',
                'view_branch_activities',
                'manage_users_branch',
                'view_users',
                'schedule-available-time.view',
                'schedule-physical-room.view',
                'schedule-physical-room.manage',
                'schedule-evaluation.view',
                'schedule-evaluation.manage',
                'view_profile',
                'edit_profile',
            ],

            'admin_operasional' => [
                'view_dashboard_global',
                'view_dashboard_branch',
                'view_branch_activities',
                'schedule-available-time.view',
                'schedule-available-time.manage',
                'schedule-physical-room.view',
                'schedule-physical-room.manage',
                'program.view',
                'program-batch.manage',
                'program-session.manage',
                'mentor-assignment.manage',
                'enrollment.view',
                'monitor-session.view',
                'monitor-session.manage',
                'certificate-validation.view',
                'certificate-validation.approve',
                'view_profile',
                'edit_profile',
            ],

            'admin_akademik' => [
                'view_dashboard_learning',
                'assessment-context.view',
                'assessment-context.create',
                'assessment-context.update',
                'assessment-context.delete',
                'assessment-question.view',
                'assessment-question.create',
                'assessment-question.update',
                'assessment-question.delete',
                'assessment-question.review',
                'assessment-blueprint.view',
                'assessment-blueprint.manage',
                'component-definition.view',
                'media-asset.view',
                'media-asset.upload',
                'certificate-template.view',
                'program.view',
                'program.create',
                'program.update',
                'program-tag.manage',
                'program-component.manage',
                'program-content.view',
                'program-content.manage',
                'program-content.publish',
                'materials-topic.view',
                'materials-topic.manage',
                'materials-classification.manage',
                'materials-support.manage',
                'materials-educational.manage',
                'view_profile',
                'edit_profile',
            ],

            'proctor' => [
                'view_dashboard_learning',
                'monitor-proctoring.view',
                'monitor-proctoring.control',
                'monitor-session.view',
                'monitor-result.view',
                'monitor-result.export',
                'view_profile',
                'edit_profile',
            ],

            'mentor_utama' => [
                'view_dashboard_learning',
                'manage_students',
                'view_student_progress',
                'manage_learning_content',
                'assessment-context.view',
                'assessment-context.create',
                'assessment-context.update',
                'assessment-question.view',
                'assessment-question.create',
                'assessment-question.update',
                'schedule-available-time.view',
                'schedule-available-time.manage',
                'materials-topic.view',
                'materials-support.manage',
                'materials-educational.manage',
                'view_profile',
                'edit_profile',
            ],

            'mentor_harian' => [
                'view_dashboard_learning',
                'manage_students',
                'view_student_progress',
                'manage_learning_content',
                'assessment-question.view',
                'assessment-question.create',
                'schedule-available-time.view',
                'schedule-available-time.manage',
                'view_profile',
                'edit_profile',
            ],

            'admin_kemitraan' => [
                'view_dashboard_global',
                'view_profile',
                'edit_profile',
            ],

            'admin_teknologi' => [
                'view_dashboard_global',
                'manage_global_settings',
                'manage_menus',
                'view_documentation',
                'manage_documentation',
                'database-manager.view',
                'database-manager.execute',
                'database-backup.view',
                'database-backup.create',
                'view_profile',
                'edit_profile',
            ],

            'admin_pemasaran' => [
                'view_dashboard_global',
                'manage_cms_content',
                'publish_cms_content',
                'manage_landing_layout',
                'finance-voucher.view',
                'finance-voucher.manage',
                'store-catalog.view',
                'store-catalog.manage',
                'store-points.view',
                'store-points.manage',
                'view_profile',
                'edit_profile',
            ],

            'member' => [
                'view_dashboard_learning',
                'view_profile',
                'edit_profile',
            ],

            'student' => [
                'view_dashboard_learning',
                'view_profile',
                'edit_profile',
            ],
        ];

        foreach ($rolesStructure as $roleName => $rolePermissions) {
            foreach (['web', 'sanctum'] as $guardName) {
                $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => $guardName]);

                // Role assignments are managed dynamically through RoleController after creation.
                // Reseeding may register new capabilities, but must never reset an existing matrix.
                if ($role->wasRecentlyCreated) {
                    $baselinePermissions = Permission::query()
                        ->where('guard_name', $guardName)
                        ->whereIn('name', $rolePermissions)
                        ->get();

                    $role->syncPermissions($baselinePermissions);
                }
            }
        }

        // Grant ALL permissions explicitly to superadmin and direktur
        foreach (['web', 'sanctum'] as $guardName) {
            $allPerms = Permission::query()->where('guard_name', $guardName)->get();
            Role::findByName('superadmin', $guardName)->givePermissionTo($allPerms);
            Role::findByName('direktur', $guardName)->givePermissionTo($allPerms);
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
        $direktur->assignRole(Role::findByName('direktur', 'sanctum'));

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

        // Admin Akademik (Demo)
        $akademik = User::firstOrCreate(
            ['email' => 'akademik@arkanin.com'],
            [
                'name' => 'Admin Akademik & Kurikulum',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'branch_id' => $pusat->id,
            ]
        );
        $akademik->assignRole('admin_akademik');
        $akademik->assignRole(Role::findByName('admin_akademik', 'sanctum'));

        // Proctor (Demo)
        $proctor = User::firstOrCreate(
            ['email' => 'proctor@arkanin.com'],
            [
                'name' => 'Pengawas Ujian CBT',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'branch_id' => $pusat->id,
            ]
        );
        $proctor->assignRole('proctor');
        $proctor->assignRole(Role::findByName('proctor', 'sanctum'));
    }
}
