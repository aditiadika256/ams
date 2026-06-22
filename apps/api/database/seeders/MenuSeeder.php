<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing menus for a clean slate
        Menu::query()->delete();

        // Users - TopBar
        $this->createMenu('Beranda', 'Home', '/', 'users', 'topbar', null, 1);
        $this->createMenu('Program', 'LayoutGrid', '/programs', 'users', 'topbar', null, 2);
        $this->createMenu('Ujian', 'FileText', '/exams', 'users', 'topbar', null, 3);
        $this->createMenu('Blog', 'FileText', '/blog', 'users', 'topbar', null, 4);
        $this->createMenu('Tentang', 'Info', '/about', 'users', 'topbar', null, 5);

        // Users - BottomNavigation (common)
        $this->createMenu('Home', 'Home', '/', 'users', 'bottomnavigation', null, 1);
        $this->createMenu('Program', 'LayoutGrid', '/programs', 'users', 'bottomnavigation', null, 2);
        $this->createMenu('Ujian', 'FileText', '/exams', 'users', 'bottomnavigation', null, 3);
        $this->createMenu('Order', 'ShoppingBag', '/orders', 'users', 'bottomnavigation', null, 4);
        $this->createMenu('Akun', 'User', '/profile', 'users', 'bottomnavigation', null, 5);

        // Admin - Sidebar
        $dashboard = $this->createMenu('Dashboard', 'LayoutDashboard', 'admin://view/dashboard', 'admin', 'sidebar', null, 1);
        
        $management = $this->createMenu('Management', 'Settings', 'admin://view/users', 'admin', 'sidebar', null, 2);
        $users = $this->createMenu('Users', 'Users', 'admin://view/users', 'admin', 'sidebar', $management->id, 1);
        $roles = $this->createMenu('Roles & Permissions', 'ShieldCheck', 'admin://view/roles', 'admin', 'sidebar', $management->id, 2);
        $finance = $this->createMenu('Finance', 'PieChart', 'admin://view/finance', 'admin', 'sidebar', $management->id, 3);

        $education = $this->createMenu('Education', 'GraduationCap', 'admin://view/programs', 'admin', 'sidebar', null, 3);
        $programs = $this->createMenu('Programs', 'BookOpen', 'admin://view/programs', 'admin', 'sidebar', $education->id, 1);
        $mentors = $this->createMenu('Mentors', 'GraduationCap', 'admin://view/mentors', 'admin', 'sidebar', $education->id, 2);
        $curriculum = $this->createMenu('Curriculum Builder', 'BookOpen', 'admin://view/curriculum-builder', 'admin', 'sidebar', $education->id, 3);

        $content = $this->createMenu('Content', 'FileText', 'admin://view/cms-posts', 'admin', 'sidebar', null, 4);
        $posts = $this->createMenu('Blog Posts', 'FileText', 'admin://view/cms-posts', 'admin', 'sidebar', $content->id, 1);
        $pages = $this->createMenu('Pages', 'FileText', 'admin://view/cms-pages', 'admin', 'sidebar', $content->id, 2);

        $system = $this->createMenu('System', 'Settings', 'admin://view/settings', 'admin', 'sidebar', null, 5);
        $settings = $this->createMenu('Settings', 'Settings', 'admin://view/settings', 'admin', 'sidebar', $system->id, 1);
        $menuMgmt = $this->createMenu('Menu Management', 'Menu', 'admin://view/menus', 'admin', 'sidebar', $system->id, 2);
        $colorPalette = $this->createMenu('Color Palette', 'Settings', 'admin://view/colorpalette', 'admin', 'sidebar', $system->id, 3);

        // Admin - Header (simple shortcuts)
        $this->createMenu('Dashboard', 'LayoutDashboard', 'admin://view/dashboard', 'admin', 'header', null, 1);
        $this->createMenu('Settings', 'Settings', 'admin://view/settings', 'admin', 'header', null, 2);
    }

    protected function createMenu(
        string $name,
        ?string $icon,
        string $url,
        string $layout,
        string $section,
        ?int $parentId,
        int $order
    ): Menu {
        return Menu::firstOrCreate(
            [
                'name' => $name,
                'url' => $url,
                'layout' => $layout,
                'section' => $section,
                'parent_id' => $parentId,
            ],
            [
                'icon' => $icon,
                'order' => $order,
            ]
        );
    }
}

