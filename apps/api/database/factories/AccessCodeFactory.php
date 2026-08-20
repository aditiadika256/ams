<?php

namespace Database\Factories;

use App\Enums\CodeType;
use App\Models\AccessCode;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<AccessCode> */
class AccessCodeFactory extends Factory
{
    protected $model = AccessCode::class;

    public function definition(): array
    {
        $plainCode = Str::upper(Str::random(12));

        return [
            'code_hash' => hash('sha256', $plainCode),
            'code_hint' => substr($plainCode, -4),
            'type' => CodeType::EnrollmentCode,
            'program_id' => Program::factory(),
            'max_redemptions' => 10,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
            'is_active' => true,
        ];
    }
}
