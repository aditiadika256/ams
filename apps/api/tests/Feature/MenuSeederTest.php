<?php

namespace Tests\Feature;

use App\Models\Menu;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_rerunning_the_seeder_is_stable_and_preserves_custom_menus(): void
    {
        $this->seed(MenuSeeder::class);

        $canonicalCount = Menu::query()->count();
        $customMenu = Menu::create([
            'name' => 'Custom Operations',
            'icon' => 'Wrench',
            'url' => 'admin://view/custom-operations',
            'layout' => 'admin',
            'section' => 'sidebar',
            'order' => 99,
        ]);

        $this->seed(MenuSeeder::class);

        $customMenu->refresh();

        $this->assertModelExists($customMenu);
        $this->assertSame(
            [
                'name' => 'Custom Operations',
                'icon' => 'Wrench',
                'url' => 'admin://view/custom-operations',
                'order' => 99,
                'seed_key' => null,
            ],
            $customMenu->only(['name', 'icon', 'url', 'order', 'seed_key'])
        );
        $this->assertSame($canonicalCount + 1, Menu::query()->count());

        $seedKeys = Menu::query()->whereNotNull('seed_key')->pluck('seed_key');

        $this->assertCount($canonicalCount, $seedKeys);
        $this->assertCount($canonicalCount, $seedKeys->unique());
    }

    public function test_seeder_adopts_a_legacy_canonical_row_without_creating_a_duplicate(): void
    {
        Menu::query()
            ->whereIn('seed_key', [
                'admin.sidebar.master.program-levels',
                'admin.sidebar.master.program-types',
            ])
            ->delete();
        Menu::query()
            ->where('seed_key', 'admin.sidebar.master')
            ->delete();

        $legacyMaster = Menu::create([
            'name' => 'Legacy Master',
            'icon' => 'LegacyIcon',
            'url' => 'admin://view/program-levels',
            'layout' => 'admin',
            'section' => 'sidebar',
            'order' => 99,
        ]);

        $this->seed(MenuSeeder::class);

        $master = Menu::query()->where('seed_key', 'admin.sidebar.master')->firstOrFail();

        $this->assertSame($legacyMaster->id, $master->id);
        $this->assertSame('Master', $master->name);
        $this->assertSame('Database', $master->icon);
        $this->assertSame(4, $master->order);
        $this->assertSame(
            1,
            Menu::query()
                ->where('url', 'admin://view/program-levels')
                ->where('layout', 'admin')
                ->where('section', 'sidebar')
                ->whereNull('parent_id')
                ->count()
        );
    }

    public function test_rerunning_the_seeder_refreshes_canonical_metadata_without_replacing_the_row(): void
    {
        $this->seed(MenuSeeder::class);

        $master = Menu::query()
            ->where('seed_key', 'admin.sidebar.master')
            ->firstOrFail();

        $masterId = $master->id;
        $master->update([
            'name' => 'Changed Master',
            'icon' => 'ChangedIcon',
            'order' => 99,
        ]);

        $this->seed(MenuSeeder::class);

        $master->refresh();

        $this->assertSame($masterId, $master->id);
        $this->assertSame('Master', $master->name);
        $this->assertSame('Database', $master->icon);
        $this->assertSame(4, $master->order);
    }

    public function test_seeder_creates_the_program_master_menu_hierarchy(): void
    {
        $this->seed(MenuSeeder::class);

        $master = Menu::query()
            ->where('seed_key', 'admin.sidebar.master')
            ->firstOrFail();

        $this->assertSame(
            [
                [
                    'name' => 'Master Jenjang / Level',
                    'url' => 'admin://view/program-levels',
                    'order' => 1,
                ],
                [
                    'name' => 'Master Tipe Program',
                    'url' => 'admin://view/program-types',
                    'order' => 2,
                ],
            ],
            $master->children()
                ->get(['name', 'url', 'order'])
                ->map(fn (Menu $menu): array => $menu->only(['name', 'url', 'order']))
                ->all()
        );
    }
}
