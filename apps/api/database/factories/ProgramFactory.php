<?php

namespace Database\Factories;

use App\Enums\ProgramStatus;
use App\Enums\ProgramVisibility;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Program> */
class ProgramFactory extends Factory
{
    protected $model = Program::class;

    public function definition(): array
    {
        $name = fake()->unique()->sentence(3);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('####'),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'base_price' => fake()->randomElement(['0.00', '49000.00', '499000.00']),
            'currency' => 'IDR',
            'visibility' => ProgramVisibility::Public,
            'status' => ProgramStatus::Draft,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'status' => ProgramStatus::Published,
            'published_at' => now(),
        ]);
    }

    public function private(): static
    {
        return $this->state(fn () => ['visibility' => ProgramVisibility::Private]);
    }
}
