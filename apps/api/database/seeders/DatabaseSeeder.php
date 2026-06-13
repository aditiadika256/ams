<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RolesSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and demo superadmin
        $this->call(RolesSeeder::class);
        $this->call(ProgramSeeder::class);
        $this->call(CbtSeeder::class);
        $this->call(ColorPaletteSeeder::class);
        $this->call(MenuSeeder::class);

        // Example test user
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );
    }
}
