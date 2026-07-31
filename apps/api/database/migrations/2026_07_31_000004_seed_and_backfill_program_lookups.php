<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $timestamp = now();

        DB::table('program_levels')->insertOrIgnore([
            [
                'code' => 'sd',
                'name' => 'SD',
                'row_status' => 1,
                'sort_order' => 1,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'smp',
                'name' => 'SMP',
                'row_status' => 1,
                'sort_order' => 2,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'sma',
                'name' => 'SMA',
                'row_status' => 1,
                'sort_order' => 3,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'cpns',
                'name' => 'CPNS',
                'row_status' => 1,
                'sort_order' => 4,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'umum',
                'name' => 'Umum',
                'row_status' => 1,
                'sort_order' => 5,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ]);

        DB::table('program_types')->insertOrIgnore([
            [
                'code' => 'tryout',
                'name' => 'Tryout',
                'row_status' => 1,
                'sort_order' => 1,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'bimbel',
                'name' => 'Bimbel',
                'row_status' => 1,
                'sort_order' => 2,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'bootcamp',
                'name' => 'Bootcamp',
                'row_status' => 1,
                'sort_order' => 3,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ]);

        $programLevels = DB::table('program_levels')
            ->whereIn('code', ['sd', 'smp', 'sma', 'cpns', 'umum'])
            ->pluck('id', 'code');

        foreach ($programLevels as $code => $id) {
            DB::table('programs')
                ->whereNull('program_level_id')
                ->where('level', $code)
                ->update(['program_level_id' => $id]);
        }

        $programTypes = DB::table('program_types')
            ->whereIn('code', ['tryout', 'bimbel', 'bootcamp'])
            ->pluck('id', 'code');

        foreach ($programTypes as $code => $id) {
            DB::table('programs')
                ->whereNull('program_type_id')
                ->where('type', $code)
                ->update(['program_type_id' => $id]);
        }
    }

    public function down(): void
    {
        // Baseline rows and mappings may have been edited after deployment; preserve them.
    }
};
