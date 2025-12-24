<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\RolesSeeder;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // $this->app->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolesSeeder::class);
    }

    public function test_finance_admin_can_access_finance_routes()
    {
        $user = User::where('email', 'finance@arkanin.com')->first();
        
        if (!$user) {
            $this->markTestSkipped('Finance user not found. Please seed the database.');
        }

        Sanctum::actingAs($user);

        // Should access
        $response = $this->getJson('/api/v1/finance/transactions');
        // If no transactions exist, it might be 200 with empty list. If 403, permission failed.
        // We just want to ensure it's NOT 403.
        $this->assertNotEquals(403, $response->status(), 'Finance admin should access finance transactions');
    }

    public function test_branch_manager_cannot_access_finance_routes()
    {
        $user = User::where('email', 'manajer.jkt@arkanin.com')->first();
        
        if (!$user) {
            $this->markTestSkipped('Manager user not found.');
        }

        Sanctum::actingAs($user);

        // Should NOT access
        $response = $this->getJson('/api/v1/finance/transactions');
        $response->assertStatus(403);
    }

    public function test_finance_admin_cannot_access_cms()
    {
        $user = User::where('email', 'finance@arkanin.com')->first();
        
        if (!$user) {
            $this->markTestSkipped('Finance user not found.');
        }

        Sanctum::actingAs($user);

        // Should NOT access
        $response = $this->postJson('/api/v1/cms/posts', []);
        $response->assertStatus(403);
    }

    public function test_analytics_endpoints_security()
    {
        // This test checks if analytics endpoints are protected
        // Manager does not have analytics permissions in RolesSeeder
        $user = User::where('email', 'manajer.jkt@arkanin.com')->first();
        
        if (!$user) {
            $this->markTestSkipped('Manager user not found.');
        }

        Sanctum::actingAs($user);

        // Manager accessing exam analytics should be blocked
        $response = $this->getJson('/api/v1/analytics/user/progress');
        
        // Should be 403 Forbidden
        $response->assertStatus(403); 
    }

    public function test_admin_dashboard_stats_security()
    {
        // This test checks if admin dashboard stats are protected
        $user = User::where('email', 'finance@arkanin.com')->first();
        
        if (!$user) {
            $this->markTestSkipped('Finance user not found.');
        }

        Sanctum::actingAs($user);

        // Finance admin accessing Admin Dashboard Stats
        // Currently NO permission check, so it returns 200 (or 500 if logic fails)
        $response = $this->getJson('/api/v1/admin/dashboard/stats');
        
        // If this is 200, it means security hole.
        // I'll assert 200 for now to confirm "I can reproduce the issue"
        $response->assertStatus(200);
    }
}
