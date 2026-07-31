<?php

namespace Database\Seeders;

use App\Models\ProgramLevel;
use App\Models\ProgramType;
use Illuminate\Database\Seeder;

class ProgramMasterSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            ['code' => 'sd', 'name' => 'SD', 'sort_order' => 1],
            ['code' => 'smp', 'name' => 'SMP', 'sort_order' => 2],
            ['code' => 'sma', 'name' => 'SMA', 'sort_order' => 3],
            ['code' => 'cpns', 'name' => 'CPNS', 'sort_order' => 4],
            ['code' => 'umum', 'name' => 'Umum', 'sort_order' => 5],
        ];

        foreach ($levels as $level) {
            ProgramLevel::query()->firstOrCreate(
                ['code' => $level['code']],
                [
                    'name' => $level['name'],
                    'row_status' => 1,
                    'sort_order' => $level['sort_order'],
                ]
            );
        }

        $types = [
            ['code' => 'tryout', 'name' => 'Tryout', 'sort_order' => 1],
            ['code' => 'bimbel', 'name' => 'Bimbel', 'sort_order' => 2],
            ['code' => 'bootcamp', 'name' => 'Bootcamp', 'sort_order' => 3],
        ];

        foreach ($types as $type) {
            ProgramType::query()->firstOrCreate(
                ['code' => $type['code']],
                [
                    'name' => $type['name'],
                    'row_status' => 1,
                    'sort_order' => $type['sort_order'],
                ]
            );
        }
    }
}
