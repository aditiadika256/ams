<?php

use App\Enums\ComponentHandlerTemplate;
use App\Models\ComponentDefinition;
use Database\Seeders\ComponentDefinitionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('seeds canonical handlers without overwriting custom catalog records or editable labels', function (): void {
    $this->seed(ComponentDefinitionSeeder::class);

    $material = ComponentDefinition::query()->where('code', 'material')->firstOrFail();
    $material->update(['name' => 'Materi Pembelajaran']);
    $custom = ComponentDefinition::query()->create([
        'code' => 'custom_information',
        'name' => 'Custom Information',
        'handler_template' => ComponentHandlerTemplate::Information,
    ]);

    $this->seed(ComponentDefinitionSeeder::class);

    expect($material->refresh()->name)->toBe('Materi Pembelajaran')
        ->and($material->handler_template)->toBe(ComponentHandlerTemplate::Native)
        ->and($material->handler_key)->toBe('material')
        ->and($material->is_system)->toBeTrue()
        ->and($custom->refresh()->name)->toBe('Custom Information')
        ->and(ComponentDefinition::query()->where('code', 'custom_information')->count())->toBe(1);
});

it('marks only implemented native and generic handlers as available', function (): void {
    $this->seed(ComponentDefinitionSeeder::class);

    expect(ComponentDefinition::query()->where('code', 'video')->firstOrFail()->handler_template)
        ->toBe(ComponentHandlerTemplate::Video)
        ->and(ComponentDefinition::query()->where('code', 'video')->firstOrFail()->is_available)->toBeTrue()
        ->and(ComponentDefinition::query()->where('code', 'download')->firstOrFail()->handler_template)
        ->toBe(ComponentHandlerTemplate::FileDownload)
        ->and(ComponentDefinition::query()->where('code', 'download')->firstOrFail()->is_available)->toBeTrue()
        ->and(ComponentDefinition::query()->where('code', 'discussion')->firstOrFail()->is_available)->toBeFalse();
});
