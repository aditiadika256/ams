<?php

namespace Tests\Feature;

use Database\Seeders\ProgramMasterSeeder;
use Database\Seeders\ProgramSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProgramMasterSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_the_canonical_program_levels_and_types_in_display_order(): void
    {
        $this->clearProgramLookups();
        $this->seed(ProgramMasterSeeder::class);

        $this->assertSame(
            [
                ['code' => 'sd', 'name' => 'SD', 'sort_order' => 1],
                ['code' => 'smp', 'name' => 'SMP', 'sort_order' => 2],
                ['code' => 'sma', 'name' => 'SMA', 'sort_order' => 3],
                ['code' => 'cpns', 'name' => 'CPNS', 'sort_order' => 4],
                ['code' => 'umum', 'name' => 'Umum', 'sort_order' => 5],
            ],
            DB::table('program_levels')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['code', 'name', 'sort_order'])
                ->map(fn (object $level): array => (array) $level)
                ->all()
        );

        $this->assertSame(
            [
                ['code' => 'tryout', 'name' => 'Tryout', 'sort_order' => 1],
                ['code' => 'bimbel', 'name' => 'Bimbel', 'sort_order' => 2],
                ['code' => 'bootcamp', 'name' => 'Bootcamp', 'sort_order' => 3],
            ],
            DB::table('program_types')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['code', 'name', 'sort_order'])
                ->map(fn (object $type): array => (array) $type)
                ->all()
        );
    }

    public function test_rerunning_the_master_seeder_does_not_create_duplicates(): void
    {
        $this->clearProgramLookups();
        $this->seed(ProgramMasterSeeder::class);
        $this->seed(ProgramMasterSeeder::class);

        $this->assertSame(5, DB::table('program_levels')->count());
        $this->assertSame(3, DB::table('program_types')->count());
        $this->assertSame(5, DB::table('program_levels')->distinct()->count('code'));
        $this->assertSame(3, DB::table('program_types')->distinct()->count('code'));
    }

    public function test_rerunning_the_master_seeder_preserves_admin_changes(): void
    {
        $this->clearProgramLookups();
        $this->seed(ProgramMasterSeeder::class);

        DB::table('program_levels')->where('code', 'sd')->update([
            'name' => 'Sekolah Dasar',
            'row_status' => 0,
            'sort_order' => 99,
        ]);
        DB::table('program_types')->where('code', 'tryout')->update([
            'name' => 'Uji Coba',
            'row_status' => -1,
            'sort_order' => 88,
        ]);

        $this->seed(ProgramMasterSeeder::class);

        $this->assertDatabaseHas('program_levels', [
            'code' => 'sd',
            'name' => 'Sekolah Dasar',
            'row_status' => 0,
            'sort_order' => 99,
        ]);
        $this->assertDatabaseHas('program_types', [
            'code' => 'tryout',
            'name' => 'Uji Coba',
            'row_status' => -1,
            'sort_order' => 88,
        ]);
    }

    public function test_data_migration_backfills_lookup_ids_from_legacy_codes(): void
    {
        $programId = DB::table('programs')->insertGetId([
            'name' => 'Program Existing',
            'level' => 'cpns',
            'type' => 'bimbel',
            'price' => 100000,
            'active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $migration = require database_path(
            'migrations/2026_07_31_000004_seed_and_backfill_program_lookups.php'
        );
        $migration->up();

        $program = DB::table('programs')->find($programId);

        $this->assertSame(
            'cpns',
            DB::table('program_levels')->where('id', $program->program_level_id)->value('code')
        );
        $this->assertSame(
            'bimbel',
            DB::table('program_types')->where('id', $program->program_type_id)->value('code')
        );
    }

    public function test_program_seeder_is_idempotent_and_sets_lookup_ids_and_legacy_codes(): void
    {
        $this->seed(ProgramMasterSeeder::class);
        $this->seed(ProgramSeeder::class);
        $this->seed(ProgramSeeder::class);

        $this->assertSame(4, DB::table('programs')->count());
        $this->assertSame(4, DB::table('programs')->distinct()->count('name'));

        DB::table('programs')
            ->orderBy('id')
            ->get()
            ->each(function (object $program): void {
                $this->assertNotNull($program->program_level_id);
                $this->assertNotNull($program->program_type_id);
                $this->assertSame(
                    $program->level,
                    DB::table('program_levels')
                        ->where('id', $program->program_level_id)
                        ->value('code')
                );
                $this->assertSame(
                    $program->type,
                    DB::table('program_types')
                        ->where('id', $program->program_type_id)
                        ->value('code')
                );
            });
    }

    public function test_program_level_codes_are_unique(): void
    {
        $this->expectException(QueryException::class);

        DB::table('program_levels')->insert([
            'code' => 'sd',
            'name' => 'Duplicate SD',
            'row_status' => 1,
            'sort_order' => 99,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_program_type_codes_are_unique(): void
    {
        $this->expectException(QueryException::class);

        DB::table('program_types')->insert([
            'code' => 'tryout',
            'name' => 'Duplicate Tryout',
            'row_status' => 1,
            'sort_order' => 99,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_referenced_program_level_cannot_be_deleted(): void
    {
        $this->createProgramWithLookups();

        $this->expectException(QueryException::class);

        DB::table('program_levels')->where('code', 'cpns')->delete();
    }

    public function test_referenced_program_type_cannot_be_deleted(): void
    {
        $this->createProgramWithLookups();

        $this->expectException(QueryException::class);

        DB::table('program_types')->where('code', 'bimbel')->delete();
    }

    public function test_lookup_migrations_can_be_rolled_back_and_reapplied_with_backfill(): void
    {
        $programId = $this->createProgramWithLookups();
        $dataMigration = require database_path(
            'migrations/2026_07_31_000004_seed_and_backfill_program_lookups.php'
        );
        $lookupColumnsMigration = require database_path(
            'migrations/2026_07_31_000003_add_program_lookup_ids_to_programs_table.php'
        );

        $dataMigration->down();
        $lookupColumnsMigration->down();
        $lookupColumnsMigration->up();

        $programAfterRollback = DB::table('programs')->find($programId);

        $this->assertNull($programAfterRollback->program_level_id);
        $this->assertNull($programAfterRollback->program_type_id);

        $dataMigration->up();

        $programAfterRemigration = DB::table('programs')->find($programId);

        $this->assertSame(
            'cpns',
            DB::table('program_levels')
                ->where('id', $programAfterRemigration->program_level_id)
                ->value('code')
        );
        $this->assertSame(
            'bimbel',
            DB::table('program_types')
                ->where('id', $programAfterRemigration->program_type_id)
                ->value('code')
        );
    }

    public function test_rerunning_program_seeder_preserves_existing_program_edits(): void
    {
        $this->seed(ProgramMasterSeeder::class);
        $this->seed(ProgramSeeder::class);

        DB::table('programs')
            ->where('name', 'Paket SKD CPNS 2025')
            ->update([
                'price' => 750000,
                'active' => false,
            ]);

        $this->seed(ProgramSeeder::class);

        $this->assertDatabaseHas('programs', [
            'name' => 'Paket SKD CPNS 2025',
            'price' => 750000,
            'active' => false,
        ]);
    }

    private function clearProgramLookups(): void
    {
        DB::table('program_types')->delete();
        DB::table('program_levels')->delete();
    }

    private function createProgramWithLookups(): int
    {
        return DB::table('programs')->insertGetId([
            'program_level_id' => DB::table('program_levels')
                ->where('code', 'cpns')
                ->value('id'),
            'program_type_id' => DB::table('program_types')
                ->where('code', 'bimbel')
                ->value('id'),
            'name' => 'Program With Lookups '.DB::table('programs')->count(),
            'level' => 'cpns',
            'type' => 'bimbel',
            'price' => 100000,
            'active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
