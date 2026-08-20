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
            'seed_key' => 'admin.sidebar.education.programs',
            'url' => 'admin://view/programs',
        ]);
        $this->assertDatabaseHas('menus', [
            'seed_key' => 'admin.sidebar.education.tags',
            'url' => 'admin://view/tags',
        ]);
    }
}
