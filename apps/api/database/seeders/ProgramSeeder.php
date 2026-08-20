<?php

namespace Database\Seeders;

use App\Enums\BatchMode;
use App\Enums\BatchStatus;
use App\Enums\ProgramStatus;
use App\Enums\ProgramVisibility;
use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $tags = collect([
            ['code' => 'sd', 'name' => 'SD'],
            ['code' => 'smp', 'name' => 'SMP'],
            ['code' => 'sma', 'name' => 'SMA'],
            ['code' => 'tka', 'name' => 'TKA'],
            ['code' => 'utbk', 'name' => 'UTBK'],
            ['code' => 'cpns', 'name' => 'CPNS'],
            ['code' => 'online', 'name' => 'Online'],
            ['code' => 'premium', 'name' => 'Premium'],
        ])->mapWithKeys(function (array $tag, int $index): array {
            $model = Tag::query()->updateOrCreate(
                ['code' => $tag['code']],
                ['name' => $tag['name'], 'sort_order' => $index + 1, 'is_active' => true]
            );

            return [$tag['code'] => $model];
        });

        $ebook = $this->program(
            'ebook-tka',
            'Ebook TKA',
            'Panduan ringkas TKA yang dapat dipelajari mandiri.',
            '49000.00',
            ['tka', 'online'],
            ['material', 'download'],
            $tags
        );
        $tryout = $this->program(
            'tryout-nasional-tka',
            'Tryout Nasional TKA',
            'Simulasi ujian TKA dengan hasil terukur.',
            '75000.00',
            ['tka', 'online'],
            ['assessment'],
            $tags
        );
        $bimbel = $this->program(
            'bimbel-tka-premium',
            'Bimbel TKA Premium',
            'Program pendampingan TKA dengan kelas dan agenda terjadwal.',
            '799000.00',
            ['tka', 'online', 'premium'],
            ['material', 'video', 'meeting', 'attendance'],
            $tags
        );

        ProgramBatch::query()->updateOrCreate(
            ['program_id' => $bimbel->id, 'code' => 'TKA-2026-01'],
            [
                'name' => 'TKA Angkatan 1',
                'registration_starts_at' => now()->subWeek(),
                'registration_ends_at' => now()->addWeeks(2),
                'starts_at' => now()->addWeeks(3),
                'ends_at' => now()->addMonths(4),
                'capacity' => 40,
                'mode' => BatchMode::Online,
                'timezone' => 'Asia/Makassar',
                'status' => BatchStatus::Open,
            ]
        );

        $collection = $this->program(
            'paket-tka-premium',
            'Paket TKA Premium',
            'Paket lengkap belajar, tryout, dan pendampingan TKA.',
            '899000.00',
            ['tka', 'online', 'premium'],
            ['material'],
            $tags
        );

        $collection->children()->sync([
            $ebook->id => ['sort_order' => 1, 'is_required' => true],
            $tryout->id => ['sort_order' => 2, 'is_required' => true],
            $bimbel->id => ['sort_order' => 3, 'is_required' => true],
        ]);
    }

    private function program(
        string $slug,
        string $name,
        string $description,
        string $price,
        array $tagCodes,
        array $componentCodes,
        $tags
    ): Program {
        $program = Program::query()->updateOrCreate(
            ['slug' => $slug],
            [
                'name' => $name,
                'short_description' => $description,
                'description' => $description,
                'base_price' => $price,
                'currency' => 'IDR',
                'visibility' => ProgramVisibility::Public,
                'status' => ProgramStatus::Published,
                'published_at' => now(),
            ]
        );

        $program->tags()->sync($tags->only($tagCodes)->pluck('id')->all());
        $components = ComponentDefinition::query()->whereIn('code', $componentCodes)->get();
        $program->componentDefinitions()->sync(
            $components->mapWithKeys(fn (ComponentDefinition $component, int $index): array => [
                $component->id => ['is_enabled' => true, 'sort_order' => $index + 1],
            ])->all()
        );

        return $program;
    }
}
