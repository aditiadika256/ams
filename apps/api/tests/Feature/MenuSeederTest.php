<?php

namespace Tests\Feature;

use App\Models\Menu;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MenuSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_rerunning_the_seeder_is_stable_and_preserves_custom_menus(): void
    {
        $this->seed(MenuSeeder::class);
        $firstCacheVersion = Cache::get('menus:cache_version');
        $canonicalCount = Menu::query()->count();
        $customMenu = Menu::query()->create([
            'name' => 'Custom Operations',
            'icon' => 'Wrench',
            'url' => 'admin://view/custom-operations',
            'layout' => 'admin',
            'section' => 'sidebar',
            'order' => 99,
        ]);

        $this->seed(MenuSeeder::class);

        $this->assertModelExists($customMenu);
        $this->assertSame($canonicalCount + 1, Menu::query()->count());
        $this->assertSame(
            $canonicalCount,
            Menu::query()->whereNotNull('seed_key')->distinct()->count('seed_key')
        );
        $this->assertNotSame($firstCacheVersion, Cache::get('menus:cache_version'));
    }

    public function test_seeder_creates_workspace_and_program_management_navigation(): void
    {
        $this->seed(MenuSeeder::class);

        $this->assertDatabaseHas('menus', [
            'seed_key' => 'users.bottom.workspace',
            'name' => 'Workspace',
            'url' => '/workspace',
        ]);
        $this->assertDatabaseHas('menus', [
            'seed_key' => 'admin.sidebar.workspace.programs',
            'url' => 'admin://view/programs',
        ]);
        $this->assertDatabaseHas('menus', [
            'seed_key' => 'admin.sidebar.workspace.tags',
            'url' => 'admin://view/tags',
        ]);
        $this->assertDatabaseHas('menus', [
            'seed_key' => 'admin.sidebar.component',
            'name' => 'Component',
            'icon' => 'Blocks',
            'url' => 'admin://view/components',
            'order' => 6,
        ]);

        $this->assertDatabaseMissing('menus', ['seed_key' => 'users.topbar.blog']);
        $this->assertDatabaseMissing('menus', ['seed_key' => 'admin.sidebar.education.curriculum']);
        $this->assertDatabaseMissing('menus', ['url' => 'admin://view/program-levels']);
        $this->assertDatabaseMissing('menus', ['url' => 'admin://view/program-types']);
    }

    public function test_admin_seeded_views_match_the_frontend_view_map(): void
    {
        $this->seed(MenuSeeder::class);

        $expectedViews = [
            'assessment-contexts',
            'assessment-questions',
            'branches',
            'cms-pages',
            'colorpalette',
            'component-assessments',
            'component-certificates',
            'component-forums',
            'component-links',
            'component-participants',
            'component-schedules',
            'components',
            'dashboard',
            'database-backup',
            'database-manager',
            'documentation',
            'enrollments',
            'finance',
            'finance-invoices',
            'finance-orders',
            'finance-reports',
            'finance-transactions',
            'finance-vouchers',
            'landing-layout',
            'materials-classification-support',
            'materials-educational',
            'materials-learning-topics',
            'materials-topic-support',
            'media-library',
            'mentors',
            'menus',
            'monitor-assessment-results',
            'monitor-schedule-evaluations',
            'programs',
            'roles',
            'schedule-available-time',
            'schedule-physical-room',
            'settings',
            'store-catalog',
            'store-points',
            'store-shipments',
            'tags',
            'users',
        ];
        $actualViews = Menu::query()
            ->where('layout', 'admin')
            ->where('url', 'like', 'admin://view/%')
            ->pluck('url')
            ->map(fn (string $url): string => str_replace('admin://view/', '', $url))
            ->unique()
            ->sort()
            ->values()
            ->all();

        $this->assertSame($expectedViews, $actualViews);
    }

    public function test_rerun_prunes_obsolete_seeded_menus_without_deleting_custom_children(): void
    {
        $obsolete = Menu::query()->create([
            'seed_key' => 'users.topbar.obsolete',
            'name' => 'Obsolete',
            'url' => '/obsolete',
            'layout' => 'users',
            'section' => 'topbar',
            'order' => 99,
        ]);
        $customChild = Menu::query()->create([
            'name' => 'Custom Child',
            'url' => '/custom-child',
            'layout' => 'users',
            'section' => 'topbar',
            'parent_id' => $obsolete->id,
            'order' => 1,
        ]);

        $this->seed(MenuSeeder::class);

        $this->assertModelMissing($obsolete);
        $this->assertModelExists($customChild);
        $this->assertNull($customChild->fresh()->parent_id);
    }
}
