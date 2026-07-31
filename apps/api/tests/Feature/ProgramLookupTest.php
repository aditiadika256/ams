<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\ProgramLevel;
use App\Models\ProgramType;
use App\Models\User;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ProgramLookupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        Permission::findOrCreate('manage_programs', 'web');
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_public_lookups_return_only_active_rows_in_deterministic_order_with_minimal_fields(): void
    {
        ProgramLevel::query()->create([
            'code' => 'active-last',
            'name' => 'Active Last',
            'row_status' => 1,
            'sort_order' => 90,
        ]);
        ProgramLevel::query()->create([
            'code' => 'active-first',
            'name' => 'Active First',
            'row_status' => 1,
            'sort_order' => 0,
        ]);
        ProgramLevel::query()->create([
            'code' => 'inactive-level',
            'name' => 'Inactive Level',
            'row_status' => 0,
            'sort_order' => 0,
        ]);
        ProgramLevel::query()->create([
            'code' => 'deleted-level',
            'name' => 'Deleted Level',
            'row_status' => -1,
            'sort_order' => 0,
        ]);

        ProgramType::query()->create([
            'code' => 'active-type',
            'name' => 'Active Type',
            'row_status' => 1,
            'sort_order' => 90,
        ]);
        ProgramType::query()->create([
            'code' => 'inactive-type',
            'name' => 'Inactive Type',
            'row_status' => 0,
            'sort_order' => 0,
        ]);
        ProgramType::query()->create([
            'code' => 'deleted-type',
            'name' => 'Deleted Type',
            'row_status' => -1,
            'sort_order' => 0,
        ]);

        $response = $this->getJson('/api/v1/program-lookups')->assertOk();

        $levels = $response->json('data.levels');
        $types = $response->json('data.types');

        $this->assertSame(
            ['active-first', 'sd', 'smp', 'sma', 'cpns', 'umum', 'active-last'],
            array_column($levels, 'code')
        );
        $this->assertSame(
            ['tryout', 'bimbel', 'bootcamp', 'active-type'],
            array_column($types, 'code')
        );
        $this->assertSame(['id', 'code', 'name'], array_keys($levels[0]));
        $this->assertSame(['id', 'code', 'name'], array_keys($types[0]));
        $this->assertNotContains('inactive-level', array_column($levels, 'code'));
        $this->assertNotContains('deleted-level', array_column($levels, 'code'));
        $this->assertNotContains('inactive-type', array_column($types, 'code'));
        $this->assertNotContains('deleted-type', array_column($types, 'code'));
    }

    public function test_public_lookups_are_cached_for_the_current_generation(): void
    {
        $this->getJson('/api/v1/program-lookups')->assertOk();

        $this->assertTrue(Cache::has('program-lookups:initial'));

        ProgramLevel::query()->create([
            'code' => 'cached-out',
            'name' => 'Cached Out',
            'row_status' => 1,
            'sort_order' => 99,
        ]);

        $this->getJson('/api/v1/program-lookups')
            ->assertOk()
            ->assertJsonMissing(['code' => 'cached-out']);

        Cache::forever('program-lookups:cache_version', 'next');

        $this->getJson('/api/v1/program-lookups')
            ->assertOk()
            ->assertJsonFragment(['code' => 'cached-out']);
        $this->assertTrue(Cache::has('program-lookups:next'));
    }

    public function test_store_accepts_active_lookup_ids_and_synchronizes_legacy_codes(): void
    {
        $this->authenticate();
        $level = ProgramLevel::query()->where('code', 'umum')->firstOrFail();
        $type = ProgramType::query()->where('code', 'bootcamp')->firstOrFail();

        $response = $this->postJson('/api/v1/programs', [
            'name' => 'Program Umum Bootcamp',
            'program_level_id' => $level->id,
            'program_type_id' => $type->id,
            'level' => 'sd',
            'type' => 'tryout',
            'price' => 125000,
        ])->assertCreated();

        $response
            ->assertJsonPath('data.level', 'umum')
            ->assertJsonPath('data.type', 'bootcamp')
            ->assertJsonPath('data.program_level_id', $level->id)
            ->assertJsonPath('data.program_type_id', $type->id)
            ->assertJsonPath('data.program_level.code', 'umum')
            ->assertJsonPath('data.program_type.code', 'bootcamp');

        $this->assertDatabaseHas('programs', [
            'name' => 'Program Umum Bootcamp',
            'program_level_id' => $level->id,
            'program_type_id' => $type->id,
            'level' => 'umum',
            'type' => 'bootcamp',
        ]);
    }

    public function test_store_rejects_inactive_deleted_and_wrong_table_lookup_ids(): void
    {
        $this->authenticate();
        $inactiveLevel = $this->createLevel('inactive-validation', 0);
        $deletedType = $this->createType('deleted-validation', -1);
        $activeLevel = ProgramLevel::query()->where('code', 'sd')->firstOrFail();
        $activeType = ProgramType::query()->where('code', 'tryout')->firstOrFail();
        $wrongTableType = $this->createType('wrong-table-type', 1);

        $this->postJson('/api/v1/programs', [
            'name' => 'Missing Lookups',
            'price' => 1000,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'program_level_id',
                'program_type_id',
            ]);

        $this->postJson('/api/v1/programs', [
            'name' => 'Invalid Inactive',
            'program_level_id' => $inactiveLevel->id,
            'program_type_id' => $activeType->id,
            'price' => 1000,
        ])->assertUnprocessable()->assertJsonValidationErrors('program_level_id');

        $this->postJson('/api/v1/programs', [
            'name' => 'Invalid Deleted',
            'program_level_id' => $activeLevel->id,
            'program_type_id' => $deletedType->id,
            'price' => 1000,
        ])->assertUnprocessable()->assertJsonValidationErrors('program_type_id');

        while (ProgramLevel::query()->whereKey($wrongTableType->id)->exists()) {
            $wrongTableType = $this->createType(
                'wrong-table-type-'.$wrongTableType->id,
                1
            );
        }

        $this->postJson('/api/v1/programs', [
            'name' => 'Invalid Cross Table',
            'program_level_id' => $wrongTableType->id,
            'program_type_id' => $activeType->id,
            'price' => 1000,
        ])->assertUnprocessable()->assertJsonValidationErrors('program_level_id');

        $this->postJson('/api/v1/programs', [
            'name' => 'Invalid Unknown IDs',
            'program_level_id' => 999999,
            'program_type_id' => 999999,
            'price' => 1000,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'program_level_id',
                'program_type_id',
            ]);
    }

    public function test_update_accepts_active_lookup_ids_and_rejects_inactive_or_deleted_ids(): void
    {
        $this->authenticate();
        $program = $this->createProgram('sd', 'tryout');
        $newLevel = ProgramLevel::query()->where('code', 'cpns')->firstOrFail();
        $newType = ProgramType::query()->where('code', 'bimbel')->firstOrFail();

        $this->putJson("/api/v1/programs/{$program->id}", [
            'program_level_id' => $newLevel->id,
            'program_type_id' => $newType->id,
        ])
            ->assertOk()
            ->assertJsonPath('data.level', 'cpns')
            ->assertJsonPath('data.type', 'bimbel')
            ->assertJsonPath('data.program_level.code', 'cpns')
            ->assertJsonPath('data.program_type.code', 'bimbel');

        $inactiveLevel = $this->createLevel('inactive-update', 0);
        $deletedType = $this->createType('deleted-update', -1);

        $this->putJson("/api/v1/programs/{$program->id}", [
            'program_level_id' => $inactiveLevel->id,
        ])->assertUnprocessable()->assertJsonValidationErrors('program_level_id');

        $this->putJson("/api/v1/programs/{$program->id}", [
            'program_type_id' => $deletedType->id,
        ])->assertUnprocessable()->assertJsonValidationErrors('program_type_id');

        $this->putJson("/api/v1/programs/{$program->id}", [
            'program_level_id' => 999999,
            'program_type_id' => 999999,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'program_level_id',
                'program_type_id',
            ]);
    }

    public function test_store_returns_validation_error_if_lookup_becomes_inactive_after_validation(): void
    {
        $this->authenticate();
        $level = ProgramLevel::query()->where('code', 'umum')->firstOrFail();
        $type = ProgramType::query()->where('code', 'bootcamp')->firstOrFail();
        $deactivated = false;

        DB::listen(function (QueryExecuted $query) use ($level, &$deactivated): void {
            if (
                !$deactivated
                && str_contains($query->sql, 'program_levels')
                && str_contains(strtolower($query->sql), 'count(*)')
            ) {
                $deactivated = true;
                DB::table('program_levels')
                    ->where('id', $level->id)
                    ->update(['row_status' => 0]);
            }
        });

        $this->postJson('/api/v1/programs', [
            'name' => 'Concurrent Deactivation',
            'program_level_id' => $level->id,
            'program_type_id' => $type->id,
            'price' => 100000,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('program_level_id');

        $this->assertTrue($deactivated);
        $this->assertDatabaseMissing('programs', [
            'name' => 'Concurrent Deactivation',
        ]);
    }

    public function test_update_returns_validation_error_if_lookup_disappears_after_validation(): void
    {
        $this->authenticate();
        $program = $this->createProgram('sd', 'tryout');
        $replacementType = $this->createType('temporary-type', 1);
        $removed = false;

        DB::listen(function (QueryExecuted $query) use ($replacementType, &$removed): void {
            if (
                !$removed
                && str_contains($query->sql, 'program_types')
                && str_contains(strtolower($query->sql), 'count(*)')
            ) {
                $removed = true;
                DB::table('program_types')
                    ->where('id', $replacementType->id)
                    ->delete();
            }
        });

        $this->putJson("/api/v1/programs/{$program->id}", [
            'program_type_id' => $replacementType->id,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('program_type_id');

        $this->assertTrue($removed);
        $program->refresh();
        $this->assertSame('tryout', $program->type);
        $this->assertNotSame($replacementType->id, $program->program_type_id);
    }

    public function test_program_show_retains_legacy_codes_and_includes_lookup_relations(): void
    {
        $program = $this->createProgram('umum', 'bootcamp');

        $this->getJson("/api/v1/programs/{$program->id}")
            ->assertOk()
            ->assertJsonPath('data.level', 'umum')
            ->assertJsonPath('data.type', 'bootcamp')
            ->assertJsonPath('data.program_level_id', $program->program_level_id)
            ->assertJsonPath('data.program_type_id', $program->program_type_id)
            ->assertJsonPath('data.program_level.code', 'umum')
            ->assertJsonPath('data.program_type.code', 'bootcamp');
    }

    public function test_index_supports_all_canonical_codes_and_lookup_id_filters(): void
    {
        $matching = $this->createProgram('umum', 'bootcamp');
        $this->createProgram('cpns', 'tryout');

        $this->getJson('/api/v1/programs?level=umum&type=bootcamp')
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $matching->id)
            ->assertJsonPath('data.data.0.program_level.code', 'umum')
            ->assertJsonPath('data.data.0.program_type.code', 'bootcamp');

        $this->getJson(
            '/api/v1/programs?program_level_id='.$matching->program_level_id
            .'&program_type_id='.$matching->program_type_id
        )
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $matching->id);
    }

    public function test_index_rejects_conflicting_lookup_codes_and_ids(): void
    {
        $umum = ProgramLevel::query()->where('code', 'umum')->firstOrFail();
        $cpns = ProgramLevel::query()->where('code', 'cpns')->firstOrFail();
        $bootcamp = ProgramType::query()->where('code', 'bootcamp')->firstOrFail();
        $tryout = ProgramType::query()->where('code', 'tryout')->firstOrFail();

        $this->getJson(
            '/api/v1/programs?level='.$umum->code
            .'&program_level_id='.$cpns->id
            .'&type='.$bootcamp->code
            .'&program_type_id='.$tryout->id
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'program_level_id',
                'program_type_id',
            ]);
    }

    public function test_index_accepts_matching_lookup_codes_and_ids(): void
    {
        $matching = $this->createProgram('umum', 'bootcamp');

        $this->getJson(
            '/api/v1/programs?level=umum'
            .'&program_level_id='.$matching->program_level_id
            .'&type=bootcamp'
            .'&program_type_id='.$matching->program_type_id
        )
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $matching->id);
    }

    private function authenticate(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(
            Permission::findByName('manage_programs', 'web')
        );

        Sanctum::actingAs($user);
    }

    private function createLevel(string $code, int $rowStatus): ProgramLevel
    {
        return ProgramLevel::query()->create([
            'code' => $code,
            'name' => ucfirst(str_replace('-', ' ', $code)),
            'row_status' => $rowStatus,
            'sort_order' => 99,
        ]);
    }

    private function createType(string $code, int $rowStatus): ProgramType
    {
        return ProgramType::query()->create([
            'code' => $code,
            'name' => ucfirst(str_replace('-', ' ', $code)),
            'row_status' => $rowStatus,
            'sort_order' => 99,
        ]);
    }

    private function createProgram(string $levelCode, string $typeCode): Program
    {
        $level = ProgramLevel::query()->where('code', $levelCode)->firstOrFail();
        $type = ProgramType::query()->where('code', $typeCode)->firstOrFail();

        return Program::query()->create([
            'name' => "Program {$levelCode} {$typeCode}",
            'program_level_id' => $level->id,
            'program_type_id' => $type->id,
            'level' => $level->code,
            'type' => $type->code,
            'price' => 100000,
            'active' => true,
        ]);
    }
}
