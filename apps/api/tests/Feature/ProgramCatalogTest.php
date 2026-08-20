<?php

use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramComponent;
use App\Models\Tag;
use Database\Seeders\ComponentDefinitionSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(ComponentDefinitionSeeder::class);
});

it('lists only published public programs using a safe projection', function () {
    $tag = Tag::factory()->create(['code' => 'utbk', 'name' => 'UTBK']);
    $assessment = ComponentDefinition::query()->where('code', 'assessment')->firstOrFail();
    $published = Program::factory()->published()->create([
        'name' => 'Tryout UTBK',
        'slug' => 'tryout-utbk',
        'base_price' => '75000.00',
    ]);
    $published->tags()->attach($tag);
    ProgramComponent::query()->create([
        'program_id' => $published->id,
        'component_definition_id' => $assessment->id,
        'configuration' => ['private_bank_id' => 99],
    ]);

    Program::factory()->create(['slug' => 'draft-program']);
    Program::factory()->published()->private()->create(['slug' => 'private-program']);

    $response = $this->getJson('/api/v1/programs')->assertOk();

    $response
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.slug', 'tryout-utbk')
        ->assertJsonPath('data.data.0.base_price', '75000.00')
        ->assertJsonPath('data.data.0.tags.0.code', 'utbk')
        ->assertJsonPath('data.data.0.components.0.code', 'assessment')
        ->assertJsonMissingPath('data.data.0.components.0.configuration')
        ->assertJsonMissingPath('data.data.0.level')
        ->assertJsonMissingPath('data.data.0.type')
        ->assertJsonMissingPath('data.data.0.completion_rule');
});

it('filters the catalog by search tag component and price with server pagination', function () {
    $utbk = Tag::factory()->create(['code' => 'utbk']);
    $cpns = Tag::factory()->create(['code' => 'cpns']);
    $assessment = ComponentDefinition::query()->where('code', 'assessment')->firstOrFail();

    $expected = Program::factory()->published()->create([
        'name' => 'Tryout Nasional UTBK',
        'slug' => 'tryout-nasional-utbk',
        'base_price' => '75000.00',
    ]);
    $expected->tags()->attach($utbk);
    $expected->components()->create([
        'component_definition_id' => $assessment->id,
        'is_enabled' => true,
    ]);

    $other = Program::factory()->published()->create([
        'name' => 'Tryout CPNS',
        'slug' => 'tryout-cpns',
        'base_price' => '45000.00',
    ]);
    $other->tags()->attach($cpns);

    $this->getJson('/api/v1/programs?search=nasional&tag=utbk&component=assessment&min_price=50000&max_price=100000&per_page=1')
        ->assertOk()
        ->assertJsonPath('data.data.0.id', $expected->id)
        ->assertJsonPath('data.meta.total', 1)
        ->assertJsonPath('data.meta.per_page', 1);
});

it('resolves published public and unlisted detail by slug but hides private programs', function () {
    $public = Program::factory()->published()->create(['slug' => 'public-detail']);
    $unlisted = Program::factory()->published()->create([
        'slug' => 'unlisted-detail',
        'visibility' => 'UNLISTED',
    ]);
    $private = Program::factory()->published()->private()->create(['slug' => 'private-detail']);

    $this->getJson("/api/v1/programs/{$public->slug}")
        ->assertOk()
        ->assertJsonPath('data.id', $public->id);
    $this->getJson("/api/v1/programs/{$unlisted->slug}")
        ->assertOk()
        ->assertJsonPath('data.id', $unlisted->id);
    $this->getJson("/api/v1/programs/{$private->slug}")->assertNotFound();
});

it('rejects invalid catalog filters with machine-readable validation errors', function () {
    $this->getJson('/api/v1/programs?min_price=-1&max_price=abc&sort_by=private_config&per_page=101')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['min_price', 'max_price', 'sort_by', 'per_page']);
});
