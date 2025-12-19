<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            [
                'name' => 'Paket SKD CPNS 2025',
                'level' => 'cpns',
                'type' => 'bimbel',
                'price' => 499000,
                'active' => true,
            ],
            [
                'name' => 'Tryout Akbar SKD #1',
                'level' => 'cpns',
                'type' => 'tryout',
                'price' => 49000,
                'active' => true,
            ],
            [
                'name' => 'Bimbel Intensif UTBK SNBT',
                'level' => 'sma',
                'type' => 'bimbel',
                'price' => 1200000,
                'active' => true,
            ],
            [
                'name' => 'Tryout UTBK SNBT #1',
                'level' => 'sma',
                'type' => 'tryout',
                'price' => 25000,
                'active' => true,
            ],
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }
    }
}
