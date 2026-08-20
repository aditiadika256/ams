<?php

namespace Database\Factories;

use App\Enums\SessionMode;
use App\Enums\SessionStatus;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProgramSession> */
class ProgramSessionFactory extends Factory
{
    protected $model = ProgramSession::class;

    public function definition(): array
    {
        $startsAt = now()->addDays(fake()->numberBetween(1, 14))->startOfHour();

        return [
            'program_batch_id' => ProgramBatch::factory(),
            'title' => fake()->sentence(4),
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMinutes(90),
            'timezone' => 'Asia/Makassar',
            'mode' => SessionMode::Online,
            'meeting_url' => 'https://meet.example.test/'.fake()->uuid(),
            'status' => SessionStatus::Scheduled,
        ];
    }
}
