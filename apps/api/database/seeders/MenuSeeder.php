<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\QueryException;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $this->createMenu('users.topbar.home', 'Beranda', 'Home', '/', 'users', 'topbar', null, 1);
        $this->createMenu('users.topbar.workspace', 'Workspace', 'PanelsTopLeft', '/workspace', 'users', 'topbar', null, 2);
        $this->createMenu('users.topbar.programs', 'Program', 'LayoutGrid', '/programs', 'users', 'topbar', null, 3);
        $this->createMenu('users.topbar.exams', 'Ujian', 'FileText', '/exams', 'users', 'topbar', null, 4);
        $this->createMenu('users.topbar.blog', 'Blog', 'FileText', '/blog', 'users', 'topbar', null, 5);

        $this->createMenu('users.bottom.workspace', 'Workspace', 'PanelsTopLeft', '/workspace', 'users', 'bottomnavigation', null, 1);
        $this->createMenu('users.bottom.programs', 'Program', 'LayoutGrid', '/programs', 'users', 'bottomnavigation', null, 2);
        $this->createMenu('users.bottom.exams', 'Ujian', 'FileText', '/exams', 'users', 'bottomnavigation', null, 3);
        $this->createMenu('users.bottom.orders', 'Order', 'ShoppingBag', '/orders', 'users', 'bottomnavigation', null, 4);
        $this->createMenu('users.bottom.account', 'Akun', 'User', '/profile', 'users', 'bottomnavigation', null, 5);

        $this->createMenu('admin.sidebar.dashboard', 'Dashboard', 'LayoutDashboard', 'admin://view/dashboard', 'admin', 'sidebar', null, 1);

        $management = $this->createMenu('admin.sidebar.management', 'Management', 'Settings', 'admin://view/users', 'admin', 'sidebar', null, 2);
        $this->createMenu('admin.sidebar.management.users', 'Users', 'Users', 'admin://view/users', 'admin', 'sidebar', $management->id, 1);
        $this->createMenu('admin.sidebar.management.roles', 'Roles & Permissions', 'ShieldCheck', 'admin://view/roles', 'admin', 'sidebar', $management->id, 2);
        $this->createMenu('admin.sidebar.management.finance', 'Finance', 'PieChart', 'admin://view/finance', 'admin', 'sidebar', $management->id, 3);

        $education = $this->createMenu('admin.sidebar.education', 'Education', 'GraduationCap', 'admin://view/programs', 'admin', 'sidebar', null, 3);
        $this->createMenu('admin.sidebar.education.programs', 'Programs', 'BookOpen', 'admin://view/programs', 'admin', 'sidebar', $education->id, 1);
        $this->createMenu('admin.sidebar.education.tags', 'Tags', 'Tags', 'admin://view/tags', 'admin', 'sidebar', $education->id, 2);
        $this->createMenu('admin.sidebar.education.mentors', 'Mentors', 'GraduationCap', 'admin://view/mentors', 'admin', 'sidebar', $education->id, 3);
        $this->createMenu('admin.sidebar.education.curriculum', 'Curriculum Builder', 'BookOpen', 'admin://view/curriculum-builder', 'admin', 'sidebar', $education->id, 4);

        $content = $this->createMenu('admin.sidebar.content', 'Content', 'FileText', 'admin://view/cms-posts', 'admin', 'sidebar', null, 5);
        $this->createMenu('admin.sidebar.content.posts', 'Blog Posts', 'FileText', 'admin://view/cms-posts', 'admin', 'sidebar', $content->id, 1);
        $this->createMenu('admin.sidebar.content.pages', 'Pages', 'FileText', 'admin://view/cms-pages', 'admin', 'sidebar', $content->id, 2);

        $system = $this->createMenu('admin.sidebar.system', 'System', 'Settings', 'admin://view/settings', 'admin', 'sidebar', null, 6);
        $this->createMenu('admin.sidebar.system.settings', 'Settings', 'Settings', 'admin://view/settings', 'admin', 'sidebar', $system->id, 1);
        $this->createMenu('admin.sidebar.system.menus', 'Menu Management', 'Menu', 'admin://view/menus', 'admin', 'sidebar', $system->id, 2);
        $this->createMenu('admin.sidebar.system.color-palette', 'Color Palette', 'Settings', 'admin://view/colorpalette', 'admin', 'sidebar', $system->id, 3);

        $this->createMenu('admin.header.dashboard', 'Dashboard', 'LayoutDashboard', 'admin://view/dashboard', 'admin', 'header', null, 1);
        $this->createMenu('admin.header.settings', 'Settings', 'Settings', 'admin://view/settings', 'admin', 'header', null, 2);
    }

    protected function createMenu(
        string $seedKey,
        string $name,
        ?string $icon,
        string $url,
        string $layout,
        string $section,
        ?int $parentId,
        int $order
    ): Menu {
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
            ]],
            ['seed_key'],
            ['name', 'icon', 'url', 'layout', 'section', 'parent_id', 'order']
        );

        return Menu::query()->where('seed_key', $seedKey)->firstOrFail();
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
