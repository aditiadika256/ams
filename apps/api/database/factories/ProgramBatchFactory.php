<?php

namespace Database\Factories;

use App\Enums\BatchMode;
use App\Enums\BatchStatus;
use App\Models\Program;
use App\Models\ProgramBatch;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProgramBatch> */
class ProgramBatchFactory extends Factory
{
    protected $model = ProgramBatch::class;

    public function definition(): array
    {
        $startsAt = now()->addDays(fake()->numberBetween(5, 30));

        return [
            'program_id' => Program::factory(),
            'name' => 'Batch '.fake()->unique()->numerify('####'),
            'code' => 'B'.fake()->unique()->numerify('#####'),
            'registration_starts_at' => now(),
            'registration_ends_at' => $startsAt->copy()->subDay(),
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMonths(2),
            'capacity' => 30,
            'mode' => BatchMode::Online,
            'status' => BatchStatus::Open,
        ];
    }
}
