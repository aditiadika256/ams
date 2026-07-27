<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MutableCollectionFreshnessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesSeeder::class);
    }

    public function test_admin_menu_collection_is_not_reused_from_browser_cache(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('superadmin');
        Sanctum::actingAs($admin);

        Menu::create([
            'name' => 'Menu Awal',
            'url' => '/admin/awal',
            'layout' => 'admin',
            'section' => 'sidebar',
        ]);

        $response = $this->getJson('/api/v1/admin/menus');

        $response->assertOk();
        $this->assertStringContainsString(
            'no-store',
            (string) $response->headers->get('Cache-Control')
        );
    }

    public function test_program_collection_requires_browser_revalidation(): void
    {
        $response = $this->getJson('/api/v1/programs');

        $response->assertOk();
        $this->assertStringContainsString(
            'no-cache',
            (string) $response->headers->get('Cache-Control')
        );
        $this->assertStringContainsString(
            'must-revalidate',
            (string) $response->headers->get('Cache-Control')
        );
    }

    public function test_menu_mutation_rotates_the_server_cache_generation(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('superadmin');
        Sanctum::actingAs($admin);

        $menu = Menu::create([
            'name' => 'Menu Awal',
            'url' => '/awal',
            'layout' => 'users',
            'section' => 'topbar',
        ]);

        $this->getJson('/api/v1/menus?layout=users&section=topbar')->assertOk();
        $versionBefore = Cache::get('menus:cache_version', 'initial');

        $this->putJson("/api/v1/admin/menus/{$menu->id}", [
            'name' => 'Menu Baru',
        ])->assertOk();

        $this->assertNotSame(
            $versionBefore,
            Cache::get('menus:cache_version', 'initial')
        );
        $this->getJson('/api/v1/menus?layout=users&section=topbar')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Menu Baru']);
    }

    public function test_public_menu_collection_requires_browser_revalidation(): void
    {
        foreach ([
            '/api/v1/menus?layout=users&section=topbar',
            '/api/v1/menus',
        ] as $url) {
            $response = $this->getJson($url);

            $response->assertOk();
            $this->assertStringContainsString(
                'no-cache',
                (string) $response->headers->get('Cache-Control')
            );
            $this->assertStringContainsString(
                'must-revalidate',
                (string) $response->headers->get('Cache-Control')
            );
        }
    }
}
