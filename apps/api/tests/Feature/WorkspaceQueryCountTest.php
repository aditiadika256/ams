<?php

use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

uses(LazilyRefreshDatabase::class);

it('keeps workspace list queries bounded as access cards grow', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $definition = ComponentDefinition::query()->create([
        'code' => 'material', 'name' => 'Materi', 'is_available' => true,
    ]);
    $tag = Tag::factory()->create();

    $createAccesses = function (int $count) use ($user, $definition, $tag): void {
        for ($index = 0; $index < $count; $index++) {
            $program = Program::factory()->published()->create();
            $program->tags()->attach($tag);
            $program->components()->create([
                'component_definition_id' => $definition->id,
                'is_enabled' => true,
            ]);
            $batch = ProgramBatch::factory()->for($program)->create();
            ProgramSession::factory()->for($batch, 'batch')->create();
            ProgramAccess::factory()->active()->for($user)->for($program)->create([
                'program_batch_id' => $batch->id,
            ]);
        }
    };

    $createAccesses(1);
    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->getJson('/api/v1/workspace')->assertOk();
    $singleCardQueries = count(DB::getQueryLog());

    DB::disableQueryLog();
    $createAccesses(10);
    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->getJson('/api/v1/workspace')->assertOk();
    $manyCardQueries = count(DB::getQueryLog());

    expect($manyCardQueries)->toBeLessThanOrEqual(10)
        ->and($manyCardQueries - $singleCardQueries)->toBeLessThanOrEqual(1);
});
