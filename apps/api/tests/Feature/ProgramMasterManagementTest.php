<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\ProgramLevel;
use App\Models\ProgramType;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProgramMasterManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        Permission::findOrCreate('manage_program_masters', 'web');
        Permission::findOrCreate('manage_programs', 'web');
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_master_routes_require_authentication_and_permission(): void
    {
        $this->getJson('/api/v1/admin/master/program-levels')
            ->assertUnauthorized();

        $this->authenticate();

        $this->getJson('/api/v1/admin/master/program-levels')
            ->assertForbidden();
        $this->getJson('/api/v1/admin/master/program-types')
            ->assertForbidden();

        $this->authenticate('manage_program_masters');

        $this->getJson('/api/v1/admin/master/program-levels')
            ->assertOk();
        $this->getJson('/api/v1/admin/master/program-types')
            ->assertOk();
    }

    public function test_level_index_is_paginated_searchable_filterable_and_deterministically_sorted(): void
    {
        $this->authenticate('manage_program_masters');

        ProgramLevel::query()->create([
            'code' => 'senior-z',
            'name' => 'Senior',
            'row_status' => 0,
            'sort_order' => 50,
        ]);
        $expected = ProgramLevel::query()->create([
            'code' => 'senior-a',
            'name' => 'Senior',
            'row_status' => 0,
            'sort_order' => 50,
        ]);
        ProgramLevel::query()->create([
            'code' => 'active-senior',
            'name' => 'Senior',
            'row_status' => 1,
            'sort_order' => 1,
        ]);

        $response = $this->getJson(
            '/api/v1/admin/master/program-levels'
            .'?search=SENIOR&row_status=0&sort_by=code&sort_dir=asc&per_page=1&page=1'
        )->assertOk();

        $response
            ->assertJsonPath('data.meta.current_page', 1)
            ->assertJsonPath('data.meta.per_page', 1)
            ->assertJsonPath('data.meta.total', 2)
            ->assertJsonPath('data.data.0.id', $expected->id)
            ->assertJsonStructure([
                'data' => [
                    'data' => [[
                        'id',
                        'code',
                        'name',
                        'row_status',
                        'sort_order',
                    ]],
                    'links',
                    'meta' => [
                        'current_page',
                        'last_page',
                        'per_page',
                        'total',
                    ],
                ],
            ]);

        $this->assertSame(
            ['id', 'code', 'name', 'row_status', 'sort_order'],
            array_keys($response->json('data.data.0'))
        );
    }

    public function test_type_index_supports_deterministic_sorting_and_rejects_invalid_filters(): void
    {
        $this->authenticate('manage_program_masters');

        $first = ProgramType::query()->create([
            'code' => 'same-first',
            'name' => 'Same',
            'sort_order' => 42,
        ]);
        $second = ProgramType::query()->create([
            'code' => 'same-second',
            'name' => 'Same',
            'sort_order' => 42,
        ]);

        $this->getJson(
            '/api/v1/admin/master/program-types?search=same'
            .'&sort_by=sort_order&sort_dir=asc&per_page=100'
        )
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $first->id)
            ->assertJsonPath('data.data.1.id', $second->id);

        $this->getJson(
            '/api/v1/admin/master/program-types'
            .'?row_status=2&sort_by=id&sort_dir=sideways&per_page=101&page=0'
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'row_status',
                'sort_by',
                'sort_dir',
                'per_page',
                'page',
            ]);
    }

    public function test_show_returns_the_exact_level_and_type_resources(): void
    {
        $this->authenticate('manage_program_masters');

        $level = ProgramLevel::query()->where('code', 'cpns')->firstOrFail();
        $type = ProgramType::query()->where('code', 'tryout')->firstOrFail();

        $levelResponse = $this->getJson(
            "/api/v1/admin/master/program-levels/{$level->id}"
        )->assertOk();
        $typeResponse = $this->getJson(
            "/api/v1/admin/master/program-types/{$type->id}"
        )->assertOk();

        $this->assertSame(
            ['id', 'code', 'name', 'row_status', 'sort_order'],
            array_keys($levelResponse->json('data'))
        );
        $this->assertSame(
            ['id', 'code', 'name', 'row_status', 'sort_order'],
            array_keys($typeResponse->json('data'))
        );
        $levelResponse->assertJsonPath('data.code', 'cpns');
        $typeResponse->assertJsonPath('data.code', 'tryout');
    }

    public function test_store_uses_defaults_and_records_audit_stamps(): void
    {
        $admin = $this->authenticate('manage_program_masters');

        $response = $this->postJson('/api/v1/admin/master/program-levels', [
            'code' => 'universitas',
            'name' => 'Universitas',
        ])->assertCreated();

        $response
            ->assertJsonPath('data.code', 'universitas')
            ->assertJsonPath('data.row_status', 1)
            ->assertJsonPath('data.sort_order', 0);

        $this->assertDatabaseHas('program_levels', [
            'code' => 'universitas',
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
            'row_status' => 1,
            'sort_order' => 0,
        ]);
    }

    public function test_store_validates_fields_and_rejects_duplicate_codes(): void
    {
        $this->authenticate('manage_program_masters');

        $this->postJson('/api/v1/admin/master/program-levels', [
            'code' => 'Invalid Code',
            'name' => str_repeat('x', 101),
            'row_status' => 2,
            'sort_order' => 65536,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'code',
                'name',
                'row_status',
                'sort_order',
            ]);

        $this->postJson('/api/v1/admin/master/program-levels', [
            'code' => 'sd',
            'name' => 'Duplicate SD',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->postJson('/api/v1/admin/master/program-types', [
            'code' => 'tryout',
            'name' => 'Duplicate Tryout',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }

    public function test_update_changes_mutable_fields_records_audit_and_prohibits_code(): void
    {
        $this->authenticate('manage_program_masters');
        $level = ProgramLevel::query()->where('code', 'sma')->firstOrFail();

        $editor = $this->authenticate('manage_program_masters');
        $this->putJson(
            "/api/v1/admin/master/program-levels/{$level->id}",
            [
                'name' => 'Sekolah Menengah Atas',
                'row_status' => 0,
                'sort_order' => 10,
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.code', 'sma')
            ->assertJsonPath('data.name', 'Sekolah Menengah Atas')
            ->assertJsonPath('data.row_status', 0)
            ->assertJsonPath('data.sort_order', 10);

        $this->assertDatabaseHas('program_levels', [
            'id' => $level->id,
            'code' => 'sma',
            'name' => 'Sekolah Menengah Atas',
            'updated_by' => $editor->id,
        ]);

        $this->putJson(
            "/api/v1/admin/master/program-levels/{$level->id}",
            ['code' => 'changed-code']
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->assertSame('sma', $level->refresh()->code);
    }

    public function test_type_can_be_created_and_updated(): void
    {
        $this->authenticate('manage_program_masters');

        $typeId = $this->postJson('/api/v1/admin/master/program-types', [
            'code' => 'intensif',
            'name' => 'Intensif',
            'row_status' => 0,
            'sort_order' => 12,
        ])
            ->assertCreated()
            ->assertJsonPath('data.code', 'intensif')
            ->json('data.id');

        $this->putJson(
            "/api/v1/admin/master/program-types/{$typeId}",
            ['name' => 'Kelas Intensif', 'row_status' => 1]
        )
            ->assertOk()
            ->assertJsonPath('data.name', 'Kelas Intensif')
            ->assertJsonPath('data.row_status', 1);
    }

    public function test_delete_is_logical_and_keeps_referenced_program_history(): void
    {
        $admin = $this->authenticate('manage_program_masters');
        $level = ProgramLevel::query()->where('code', 'cpns')->firstOrFail();
        $type = ProgramType::query()->where('code', 'bimbel')->firstOrFail();
        $program = Program::query()->create([
            'name' => 'Referenced History',
            'program_level_id' => $level->id,
            'program_type_id' => $type->id,
            'level' => $level->code,
            'type' => $type->code,
            'price' => 100000,
            'active' => true,
        ]);

        $this->deleteJson(
            "/api/v1/admin/master/program-levels/{$level->id}"
        )->assertNoContent();
        $this->deleteJson(
            "/api/v1/admin/master/program-types/{$type->id}"
        )->assertNoContent();

        $this->assertModelExists($program);
        $this->assertDatabaseHas('program_levels', [
            'id' => $level->id,
            'row_status' => -1,
            'updated_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('program_types', [
            'id' => $type->id,
            'row_status' => -1,
            'updated_by' => $admin->id,
        ]);
    }

    public function test_every_master_mutation_rotates_lookup_and_program_cache_generations(): void
    {
        $this->authenticate('manage_program_masters');
        Cache::forever('program-lookups:cache_version', 'lookups-before-store');
        Cache::forever('programs:cache_version', 'programs-before-store');

        $typeId = $this->postJson('/api/v1/admin/master/program-types', [
            'code' => 'cache-test',
            'name' => 'Cache Test',
        ])->assertCreated()->json('data.id');

        $lookupAfterStore = Cache::get('program-lookups:cache_version');
        $programAfterStore = Cache::get('programs:cache_version');
        $this->assertNotSame('lookups-before-store', $lookupAfterStore);
        $this->assertNotSame('programs-before-store', $programAfterStore);

        $this->putJson(
            "/api/v1/admin/master/program-types/{$typeId}",
            ['name' => 'Cache Test Updated']
        )->assertOk();

        $lookupAfterUpdate = Cache::get('program-lookups:cache_version');
        $programAfterUpdate = Cache::get('programs:cache_version');
        $this->assertNotSame($lookupAfterStore, $lookupAfterUpdate);
        $this->assertNotSame($programAfterStore, $programAfterUpdate);

        $this->deleteJson(
            "/api/v1/admin/master/program-types/{$typeId}"
        )->assertNoContent();

        $this->assertNotSame(
            $lookupAfterUpdate,
            Cache::get('program-lookups:cache_version')
        );
        $this->assertNotSame(
            $programAfterUpdate,
            Cache::get('programs:cache_version')
        );
    }

    public function test_program_mutations_require_manage_programs_but_reads_stay_public(): void
    {
        $level = ProgramLevel::query()->where('code', 'sd')->firstOrFail();
        $type = ProgramType::query()->where('code', 'tryout')->firstOrFail();
        $payload = [
            'name' => 'Permission Program',
            'program_level_id' => $level->id,
            'program_type_id' => $type->id,
            'price' => 100000,
        ];

        $this->getJson('/api/v1/programs')->assertOk();
        $this->postJson('/api/v1/programs', $payload)->assertUnauthorized();

        $this->authenticate();
        $this->postJson('/api/v1/programs', $payload)->assertForbidden();

        $this->authenticate('manage_programs');
        $programId = $this->postJson('/api/v1/programs', $payload)
            ->assertCreated()
            ->json('data.id');

        $this->getJson("/api/v1/programs/{$programId}")->assertOk();
        $this->putJson("/api/v1/programs/{$programId}", [
            'name' => 'Permission Program Updated',
        ])->assertOk();
        $this->deleteJson("/api/v1/programs/{$programId}")
            ->assertNoContent();
    }

    public function test_roles_seeder_registers_permissions_for_both_guards_and_full_access_roles(): void
    {
        $this->seed(RolesSeeder::class);

        foreach (['web', 'sanctum'] as $guard) {
            $this->assertDatabaseHas('permissions', [
                'name' => 'manage_programs',
                'guard_name' => $guard,
            ]);
            $this->assertDatabaseHas('permissions', [
                'name' => 'manage_program_masters',
                'guard_name' => $guard,
            ]);

            foreach (['superadmin', 'direktur'] as $roleName) {
                $role = Role::findByName($roleName, $guard);

                $this->assertTrue($role->hasPermissionTo('manage_programs'));
                $this->assertTrue(
                    $role->hasPermissionTo('manage_program_masters')
                );
            }
        }

        $this->assertFalse(
            Role::findByName('admin_operasional', 'web')
                ->hasPermissionTo('manage_programs')
        );
        $this->assertFalse(
            Role::findByName('admin_operasional', 'web')
                ->hasPermissionTo('manage_program_masters')
        );
    }

    private function authenticate(?string $permission = null): User
    {
        $user = User::factory()->create();

        if ($permission !== null) {
            $user->givePermissionTo(
                Permission::findByName($permission, 'web')
            );
        }

        Sanctum::actingAs($user);

        return $user;
    }
}
