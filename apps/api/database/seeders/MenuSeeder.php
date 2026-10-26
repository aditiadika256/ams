<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\QueryException;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    /** @var array<int, string> */
    private array $seededKeys = [];

    public function run(): void
    {
        // --- 1. Public & User Topbar (Desktop) ---
        $this->createMenu('users.topbar.home', 'Beranda', 'Home', '/', 'users', 'topbar', null, 1);
        $this->createMenu('users.topbar.workspace', 'Workspace', 'PanelsTopLeft', '/workspace', 'users', 'topbar', null, 2, 'auth');
        $this->createMenu('users.topbar.programs', 'Programs', 'LayoutGrid', '/programs', 'users', 'topbar', null, 3);
        $this->createMenu('users.topbar.store', 'Store', 'ShoppingBag', '/store', 'users', 'topbar', null, 4);
        $this->createMenu('users.topbar.notifications', 'Notifikasi', 'Bell', '/notifications', 'users', 'topbar', null, 5);

        // --- 2. Public & User Bottom Navigation (Mobile) ---
        $this->createMenu('users.bottom.home', 'Beranda', 'Home', '/', 'users', 'bottomnavigation', null, 1);
        $this->createMenu('users.bottom.programs', 'Programs', 'LayoutGrid', '/programs', 'users', 'bottomnavigation', null, 2);
        $this->createMenu('users.bottom.workspace', 'Workspace', 'PanelsTopLeft', '/workspace', 'users', 'bottomnavigation', null, 3, 'auth');
        $this->createMenu('users.bottom.store', 'Store', 'ShoppingBag', '/store', 'users', 'bottomnavigation', null, 4);
        $this->createMenu('users.bottom.notifications', 'Notifikasi', 'Bell', '/notifications', 'users', 'bottomnavigation', null, 5);

        // --- 3. Admin: Dashboard ---
        $this->createMenu('admin.sidebar.dashboard', 'Dashboard', 'LayoutDashboard', 'admin://view/dashboard', 'admin', 'sidebar', null, 1);

        // --- 4. Admin: Personal ---
        $personal = $this->createMenu('admin.sidebar.personal', 'Personal', 'Users', 'admin://view/users', 'admin', 'sidebar', null, 2, 'manage_users_global|manage_roles|manage_branches|manage_learning_content');
        $this->createMenu('admin.sidebar.personal.roles', 'Role Permission', 'ShieldCheck', 'admin://view/roles', 'admin', 'sidebar', $personal->id, 1, 'manage_roles');
        $this->createMenu('admin.sidebar.personal.branch', 'Branch', 'Building2', 'admin://view/branches', 'admin', 'sidebar', $personal->id, 2, 'manage_branches');
        $this->createMenu('admin.sidebar.personal.user', 'User', 'Users', 'admin://view/users', 'admin', 'sidebar', $personal->id, 3, 'manage_users_global');
        $this->createMenu('admin.sidebar.personal.mentor', 'Mentor', 'GraduationCap', 'admin://view/mentors', 'admin', 'sidebar', $personal->id, 4, 'manage_learning_content');

        // --- 5. Admin: Landing Page ---
        $landingPage = $this->createMenu('admin.sidebar.landing-page', 'Landing Page', 'Globe', 'admin://view/cms-pages', 'admin', 'sidebar', null, 3);
        $this->createMenu('admin.sidebar.landing-page.content', 'Content Page', 'FileText', 'admin://view/cms-pages', 'admin', 'sidebar', $landingPage->id, 1);
        $this->createMenu('admin.sidebar.landing-page.layout', 'Layout Page', 'PanelsTopLeft', 'admin://view/landing-layout', 'admin', 'sidebar', $landingPage->id, 2);

        // --- 6. Admin: Master Assessment ---
        $assessment = $this->createMenu('admin.sidebar.assessment', 'Master Assessment', 'ClipboardCheck', 'admin://view/assessment-contexts', 'admin', 'sidebar', null, 4);
        $this->createMenu('admin.sidebar.assessment.context', 'Context Bank', 'FileQuestion', 'admin://view/assessment-contexts', 'admin', 'sidebar', $assessment->id, 1, 'manage_learning_content');
        $this->createMenu('admin.sidebar.assessment.question', 'Question Bank', 'HelpCircle', 'admin://view/assessment-questions', 'admin', 'sidebar', $assessment->id, 2, 'manage_learning_content');

        // --- 7. Admin: Schedule ---
        $schedule = $this->createMenu('admin.sidebar.schedule', 'Schedule', 'Calendar', 'admin://view/schedule-available-time', 'admin', 'sidebar', null, 5);
        $this->createMenu('admin.sidebar.schedule.available-time', 'Available Time', 'Clock', 'admin://view/schedule-available-time', 'admin', 'sidebar', $schedule->id, 1);
        $this->createMenu('admin.sidebar.schedule.physical-room', 'Physical Room', 'MapPin', 'admin://view/schedule-physical-room', 'admin', 'sidebar', $schedule->id, 2);

        // --- 8. Admin: Component ---
        $component = $this->createMenu('admin.sidebar.component', 'Component', 'Blocks', 'admin://view/components', 'admin', 'sidebar', null, 6, 'component-definition.view');
        $this->createMenu('admin.sidebar.component.media-library', 'Media Library', 'Image', 'admin://view/media-library', 'admin', 'sidebar', $component->id, 1, 'component-definition.view');
        $this->createMenu('admin.sidebar.component.assessment', 'Assessment Blueprint', 'FileCheck2', 'admin://view/component-assessments', 'admin', 'sidebar', $component->id, 2, 'component-definition.view');
        $this->createMenu('admin.sidebar.component.certificate', 'Certificate', 'Award', 'admin://view/component-certificates', 'admin', 'sidebar', $component->id, 3, 'component-definition.view');
        $this->createMenu('admin.sidebar.component.forum', 'Forum', 'MessageSquare', 'admin://view/component-forums', 'admin', 'sidebar', $component->id, 4, 'component-definition.view');
        $this->createMenu('admin.sidebar.component.participant', 'Participant', 'Users', 'admin://view/component-participants', 'admin', 'sidebar', $component->id, 5, 'component-definition.view');
        $this->createMenu('admin.sidebar.component.schedule', 'Schedule', 'CalendarRange', 'admin://view/component-schedules', 'admin', 'sidebar', $component->id, 6, 'component-definition.view');
        $this->createMenu('admin.sidebar.component.link', 'Link', 'ExternalLink', 'admin://view/component-links', 'admin', 'sidebar', $component->id, 7, 'component-definition.view');

        // --- 9. Admin: Workspace ---
        $workspace = $this->createMenu('admin.sidebar.workspace', 'Workspace', 'Briefcase', 'admin://view/programs', 'admin', 'sidebar', null, 7);
        $this->createMenu('admin.sidebar.workspace.tags', 'Tag', 'Tags', 'admin://view/tags', 'admin', 'sidebar', $workspace->id, 1, 'program-tag.manage');
        $this->createMenu('admin.sidebar.workspace.programs', 'Program', 'BookOpen', 'admin://view/programs', 'admin', 'sidebar', $workspace->id, 2, 'program.view');
        $this->createMenu('admin.sidebar.workspace.enrollment', 'Enrollment', 'UserCheck', 'admin://view/enrollments', 'admin', 'sidebar', $workspace->id, 3);

        // --- 10. Admin: Monitor ---
        $monitor = $this->createMenu('admin.sidebar.monitor', 'Monitor', 'Activity', 'admin://view/monitor-assessment-results', 'admin', 'sidebar', null, 8);
        $this->createMenu('admin.sidebar.monitor.proctoring', 'Live Proctoring', 'ShieldAlert', 'admin://view/monitor-proctoring', 'admin', 'sidebar', $monitor->id, 1, 'view_dashboard_learning');
        $this->createMenu('admin.sidebar.monitor.sessions', 'Assessment Sessions', 'CalendarRange', 'admin://view/monitor-sessions', 'admin', 'sidebar', $monitor->id, 2);
        $this->createMenu('admin.sidebar.monitor.assessment-result', 'Assessment Result', 'FileSpreadsheet', 'admin://view/monitor-assessment-results', 'admin', 'sidebar', $monitor->id, 3, 'view_dashboard_learning');
        $this->createMenu('admin.sidebar.monitor.analysis', 'Assessment Analysis', 'BarChart3', 'admin://view/monitor-analysis', 'admin', 'sidebar', $monitor->id, 4, 'manage_learning_content');
        $this->createMenu('admin.sidebar.monitor.certificate-validation', 'Certificate Validation', 'Award', 'admin://view/monitor-certificate-validation', 'admin', 'sidebar', $monitor->id, 5);
        $this->createMenu('admin.sidebar.monitor.schedule-evaluation', 'Schedule Evaluation', 'Star', 'admin://view/monitor-schedule-evaluations', 'admin', 'sidebar', $monitor->id, 6);

        // --- 11. Admin: Materials ---
        $materials = $this->createMenu('admin.sidebar.materials', 'Materials', 'FolderTree', 'admin://view/materials-learning-topics', 'admin', 'sidebar', null, 9);
        $this->createMenu('admin.sidebar.materials.learning-topic', 'Learning Topic', 'Bookmark', 'admin://view/materials-learning-topics', 'admin', 'sidebar', $materials->id, 1);
        $this->createMenu('admin.sidebar.materials.classification-support', 'Classification Support', 'Layers', 'admin://view/materials-classification-support', 'admin', 'sidebar', $materials->id, 2);
        $this->createMenu('admin.sidebar.materials.topic-support', 'Support for Learning Topic', 'LifeBuoy', 'admin://view/materials-topic-support', 'admin', 'sidebar', $materials->id, 3);
        $this->createMenu('admin.sidebar.materials.educational', 'Educational', 'GraduationCap', 'admin://view/materials-educational', 'admin', 'sidebar', $materials->id, 4);

        // --- 12. Admin: Finance ---
        $finance = $this->createMenu('admin.sidebar.finance', 'Finance', 'CircleDollarSign', 'admin://view/finance', 'admin', 'sidebar', null, 10);
        $this->createMenu('admin.sidebar.finance.voucher', 'Voucher', 'Ticket', 'admin://view/finance-vouchers', 'admin', 'sidebar', $finance->id, 1);
        $this->createMenu('admin.sidebar.finance.order', 'Order', 'ShoppingBag', 'admin://view/finance-orders', 'admin', 'sidebar', $finance->id, 2);
        $this->createMenu('admin.sidebar.finance.invoice', 'Invoice', 'Receipt', 'admin://view/finance-invoices', 'admin', 'sidebar', $finance->id, 3);
        $this->createMenu('admin.sidebar.finance.transaction', 'Transaction', 'ArrowLeftRight', 'admin://view/finance-transactions', 'admin', 'sidebar', $finance->id, 4, 'view_finance_analytics');
        $this->createMenu('admin.sidebar.finance.holds', 'Hold Balances', 'CircleDollarSign', 'admin://view/finance-holds', 'admin', 'sidebar', $finance->id, 5, 'view_finance_analytics');
        $this->createMenu('admin.sidebar.finance.report', 'Report', 'BarChart3', 'admin://view/finance-reports', 'admin', 'sidebar', $finance->id, 6, 'view_finance_analytics');

        // --- 13. Admin: Store ---
        $store = $this->createMenu('admin.sidebar.store', 'Store', 'ShoppingBag', 'admin://view/store-catalog', 'admin', 'sidebar', null, 11);
        $this->createMenu('admin.sidebar.store.catalog', 'E-Catalog (Produk Fisik)', 'Package', 'admin://view/store-catalog', 'admin', 'sidebar', $store->id, 1);
        $this->createMenu('admin.sidebar.store.point', 'Point', 'Coins', 'admin://view/store-points', 'admin', 'sidebar', $store->id, 2);
        $this->createMenu('admin.sidebar.store.shipment', 'Shipment', 'Truck', 'admin://view/store-shipments', 'admin', 'sidebar', $store->id, 3);

        // --- 14. Admin: System ---
        $system = $this->createMenu('admin.sidebar.system', 'System', 'Settings', 'admin://view/settings', 'admin', 'sidebar', null, 12);
        $this->createMenu('admin.sidebar.system.menus', 'Menu Management', 'Menu', 'admin://view/menus', 'admin', 'sidebar', $system->id, 1, 'manage_menus');
        $this->createMenu('admin.sidebar.system.appearance', 'Appearance (Color Palette)', 'Palette', 'admin://view/colorpalette', 'admin', 'sidebar', $system->id, 2, 'manage_global_settings');
        $this->createMenu('admin.sidebar.system.documentation', 'Documentation', 'BookOpen', 'admin://view/documentation', 'admin', 'sidebar', $system->id, 3);
        $this->createMenu('admin.sidebar.system.telescope', 'Telescope Monitoring', 'Activity', '/telescope', 'admin', 'sidebar', $system->id, 4, 'manage_global_settings');

        // --- 15. Admin: Database ---
        $database = $this->createMenu('admin.sidebar.database', 'Database', 'Database', 'admin://view/database-manager', 'admin', 'sidebar', null, 13);
        $this->createMenu('admin.sidebar.database.manager', 'Data Manager', 'HardDrive', 'admin://view/database-manager', 'admin', 'sidebar', $database->id, 1, 'manage_global_settings');
        $this->createMenu('admin.sidebar.database.backup', 'Backup', 'Archive', 'admin://view/database-backup', 'admin', 'sidebar', $database->id, 2, 'manage_global_settings');

        // --- 16. Admin: Header ---
        $this->createMenu('admin.header.dashboard', 'Dashboard', 'LayoutDashboard', 'admin://view/dashboard', 'admin', 'header', null, 1);
        $this->createMenu('admin.header.settings', 'Settings', 'Settings', 'admin://view/settings', 'admin', 'header', null, 2);

        $this->pruneObsoleteSeededMenus();
        Cache::forever('menus:cache_version', Str::uuid()->toString());
    }

    protected function createMenu(
        string $seedKey,
        string $name,
        ?string $icon,
        string $url,
        string $layout,
        string $section,
        ?int $parentId,
        int $order,
        ?string $requiredPermission = null,
    ): Menu {
        $this->seededKeys[] = $seedKey;
        $this->adoptLegacyMenu($seedKey, $url, $layout, $section, $parentId);

        Menu::query()->upsert(
            [[
                'seed_key' => $seedKey,
                'name' => $name,
                'icon' => $icon,
                'url' => $url,
                'layout' => $layout,
                'section' => $section,
                'parent_id' => $parentId,
                'order' => $order,
                'required_permission' => $requiredPermission,
            ]],
            ['seed_key'],
            ['name', 'icon', 'url', 'layout', 'section', 'parent_id', 'order', 'required_permission']
        );

        return Menu::query()->where('seed_key', $seedKey)->firstOrFail();
    }

    private function pruneObsoleteSeededMenus(): void
    {
        $staleMenus = Menu::query()
            ->whereNotNull('seed_key')
            ->whereNotIn('seed_key', $this->seededKeys)
            ->get(['id', 'parent_id']);

        while ($staleMenus->isNotEmpty()) {
            $staleIds = $staleMenus->pluck('id');
            $leafMenus = $staleMenus->reject(
                fn (Menu $menu): bool => $staleMenus->contains('parent_id', $menu->id)
            );

            if ($leafMenus->isEmpty()) {
                throw new \LogicException('Cannot prune cyclic seeded menu hierarchy.');
            }

            foreach ($leafMenus as $menu) {
                Menu::query()
                    ->where('parent_id', $menu->id)
                    ->whereNotIn('id', $staleIds)
                    ->update(['parent_id' => $menu->parent_id]);

                $menu->delete();
                $staleMenus = $staleMenus->reject(fn (Menu $stale): bool => $stale->id === $menu->id);
            }
        }
    }

    private function adoptLegacyMenu(
        string $seedKey,
        string $url,
        string $layout,
        string $section,
        ?int $parentId
    ): void {
        if (Menu::query()->where('seed_key', $seedKey)->exists()) {
            return;
        }

        $legacyId = Menu::query()
            ->whereNull('seed_key')
            ->where('url', $url)
            ->where('layout', $layout)
            ->where('section', $section)
            ->where('parent_id', $parentId)
            ->oldest('id')
            ->value('id');

        if ($legacyId === null) {
            return;
        }

        try {
            Menu::query()
                ->whereKey($legacyId)
                ->whereNull('seed_key')
                ->update(['seed_key' => $seedKey]);
        } catch (QueryException $exception) {
            if (! Menu::query()->where('seed_key', $seedKey)->exists()) {
                throw $exception;
            }
        }
    }
}
