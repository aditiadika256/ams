# Developer Guide: Roles, Permissions & Menu Auto-Sync Architecture

Panduan teknis bagi pengembang (*software engineers*) dalam mengelola arsitektur Role-Based Access Control (RBAC) Spatie dan mekanisme otomatisasi izin akses menu pada platform Arkanin Management System (AMS).

---

## 1. Arsitektur 2-Layer Super Admin Guarantee

Untuk memastikan administrator eksekutif (`superadmin`, `super_admin`, dan `direktur`) tidak pernah kehilangan akses terhadap fitur atau menu yang baru dibuat, AMS menerapkan arsitektur keamanan dua lapis:

```mermaid
flowchart TD
    Req[Request Inbound] --> GateBefore{Gate::before Check}
    GateBefore -- Role is superadmin / direktur --> Allow[Return TRUE / Super Admin Bypass]
    GateBefore -- Non Super Admin --> RBAC[Spatie Model & Role Permissions Check]
    
    MenuCreate[Super Admin Buat / Update Menu] --> MenuObs[MenuObserver::saved]
    MenuObs --> Split[Split required_permission string '|']
    Split --> EnsurePerm[Permission::firstOrCreate for web & sanctum]
    EnsurePerm --> GrantSuper[Role::givePermissionTo superadmin & direktur]
    GrantSuper --> FlushCache[Flush Spatie & Menu Cache Version]
```

### Lapisan 1: Gate Authorization Universal (`Gate::before`)
Didefinisikan pada [`AppServiceProvider.php`](file:///d:/project/ams/apps/api/app/Providers/AppServiceProvider.php#L26):
```php
Gate::before(function ($user, $ability) {
    if ($user->hasRole(['superadmin', 'super_admin', 'direktur'])
        || $user->hasRole('superadmin', 'web')
        || $user->hasRole('superadmin', 'sanctum')) {
        return true;
    }

    return null;
});
```
Setiap pengecekan `$user->can(...)` atau `@can(...)` pada policy dan controller akan langsung mengembalikan nilai `true` untuk Super Admin.

### Lapisan 2: Database Persistence & Spatie Auto-Sync (`MenuObserver`)
Diimplementasikan pada [`MenuObserver.php`](file:///d:/project/ams/apps/api/app/Observers/MenuObserver.php):
Saat model `Menu` disimpan (`created` / `updated`):
1. Kolom `required_permission` diparsing (mendukung multi-permission dengan tanda pipe `|`).
2. Record `Permission` otomatis dibuat jika belum ada di database untuk guard `web` dan `sanctum`.
3. Permission langsung ditautkan (*granted*) ke role `superadmin` dan `direktur` di kedua guard.
4. Cache registrar permission Spatie dibersihkan seketika.

---

## 2. Struktur Seeder Permissions Per Fitur (PRD 2.0.0)

Semua permission fitur didefinisikan secara terstruktur di [`RolesSeeder.php`](file:///d:/project/ams/apps/api/database/seeders/RolesSeeder.php), mencakup 13 kategori utama menu AMS:

| Kategori Utama | Prefix / Nama Permission | Contoh Permission |
| :--- | :--- | :--- |
| **1. Dashboard** | `view_dashboard_*`, `view_*_activities` | `view_dashboard_global`, `view_dashboard_branch` |
| **2. Personal** | `manage_users_*`, `manage_roles`, `manage_branches`, `manage_mentors` | `manage_users_global`, `manage_roles`, `manage_mentors` |
| **3. Landing Page** | `manage_cms_content`, `manage_landing_layout` | `manage_cms_content`, `publish_cms_content` |
| **4. Master Assessment (L1)** | `assessment-context.*`, `assessment-question.*` | `assessment-context.view`, `assessment-question.create` |
| **5. Schedule Tool** | `schedule-available-time.*`, `schedule-physical-room.*` | `schedule-physical-room.manage` |
| **6. Component Tool (L2)** | `component-definition.*`, `media-asset.*`, `assessment-blueprint.*`, `certificate-template.*` | `media-asset.upload`, `assessment-blueprint.manage` |
| **7. Workspace (L3)** | `program.*`, `program-tag.*`, `program-component.*`, `enrollment.*`, `installment.*` | `program.publish`, `installment.manage` |
| **8. Monitor (L4)** | `monitor-proctoring.*`, `monitor-session.*`, `monitor-result.*`, `monitor-analysis.*` | `monitor-proctoring.control`, `monitor-analysis.calculate-irt` |
| **9. Materials** | `materials-topic.*`, `materials-classification.*`, `materials-support.*`, `materials-educational.*` | `materials-topic.view`, `materials-support.manage` |
| **10. Finance** | `finance-voucher.*`, `finance-order.*`, `finance-invoice.*`, `finance-transaction.*`, `finance-withdrawal.*` | `finance-transaction.approve`, `finance-withdrawal.approve` |
| **11. Store** | `store-catalog.*`, `store-points.*`, `store-shipments.*` | `store-catalog.manage`, `store-points.manage` |
| **12. System** | `manage_menus`, `manage_global_settings`, `view_documentation` | `manage_menus`, `manage_global_settings` |
| **13. Database** | `database-manager.*`, `database-backup.*` | `database-backup.create`, `database-manager.execute` |

---

## 3. Best Practices Penggunaan Permission dalam Kode

1. **Gunakan `$user->can('permission.name')`**: Jangan pernah memeriksa peran `$user->hasRole(...)` langsung di controller atau view bisnis, gunakan `$user->can(...)` agar Super Admin otomatis lolos via Gate.
2. **Multi-Permission pada Menu**: Gunakan format pipe `|` jika sebuah menu dapat diakses oleh lebih dari satu permission, contoh: `media-asset.view|component-definition.view`.
3. **Idempotensi Seeder**: `RolesSeeder` dirancang aman dijalankan berulang kali (*re-seeding*) tanpa menghapus perubahan matriks hak akses kustom yang telah diatur administrator melalui antarmuka Master Role.
