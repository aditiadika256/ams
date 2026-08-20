<?php

namespace Database\Factories;

use App\Enums\AccessSource;
use App\Enums\AccessStatus;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<ProgramAccess> */
class ProgramAccessFactory extends Factory
{
    protected $model = ProgramAccess::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'program_id' => Program::factory(),
            'source_type' => AccessSource::AdminGrant,
            'source_id' => (string) fake()->unique()->randomNumber(7),
            'grant_key' => 'factory:'.Str::uuid(),
            'status' => AccessStatus::Waiting,
            'metadata' => [],
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => AccessStatus::Active,
            'starts_at' => now()->subDay(),
            'activated_at' => now()->subDay(),
        ]);
    }
}
