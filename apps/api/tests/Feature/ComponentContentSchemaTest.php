<?php

use App\Enums\ComponentContentStatus;
use App\Enums\ComponentHandlerTemplate;
use App\Models\ComponentDefinition;
use App\Models\MediaAsset;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use App\Models\ProgramComponentSubmission;
use App\Models\ProgramLesson;
use App\Models\ProgramModule;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(LazilyRefreshDatabase::class);

it('provides stable handler and publication enums', function (): void {
    expect(array_column(ComponentHandlerTemplate::cases(), 'value'))->toBe([
        'INFORMATION',
        'EXTERNAL_LINK',
        'FILE_DOWNLOAD',
        'EMBEDDED_PAGE',
        'VIDEO',
        'FORM',
        'IFRAME',
        'NATIVE',
    ])->and(array_column(ComponentContentStatus::cases(), 'value'))->toBe([
        'DRAFT',
        'PUBLISHED',
    ]);
});

it('extends catalog installations and lessons without losing existing fields', function (): void {
    expect(Schema::hasColumns('component_definitions', [
        'handler_template',
        'handler_key',
        'icon',
        'is_system',
        'created_by',
        'updated_by',
        'deleted_at',
    ]))->toBeTrue()
        ->and(Schema::hasColumn('program_components', 'deleted_at'))->toBeTrue()
        ->and(Schema::hasColumns('program_lessons', [
            'content_kind',
            'external_url',
            'media_asset_id',
        ]))->toBeTrue();
});

it('creates normalized content media and submission tables', function (): void {
    expect(Schema::hasColumns('media_assets', [
        'program_id',
        'uploaded_by',
        'disk',
        'object_key',
        'original_name',
        'mime_type',
        'extension',
        'size_bytes',
        'checksum_sha256',
        'deleted_at',
    ]))->toBeTrue()
        ->and(Schema::hasColumns('program_component_contents', [
            'program_component_id',
            'media_asset_id',
            'title',
            'slug',
            'summary',
            'body',
            'external_url',
            'payload',
            'status',
            'published_at',
            'sort_order',
            'deleted_at',
        ]))->toBeTrue()
        ->and(Schema::hasColumns('program_component_submissions', [
            'program_component_content_id',
            'program_access_id',
            'user_id',
            'payload',
            'submitted_at',
        ]))->toBeTrue();
});

it('casts and relates component content domain models', function (): void {
    $user = User::factory()->create();
    $program = Program::factory()->create();
    $definition = ComponentDefinition::query()->create([
        'code' => 'resources',
        'name' => 'Resources',
        'handler_template' => ComponentHandlerTemplate::FileDownload,
    ]);
    $installation = ProgramComponent::query()->create([
        'program_id' => $program->id,
        'component_definition_id' => $definition->id,
    ]);
    $asset = MediaAsset::query()->create([
        'program_id' => $program->id,
        'uploaded_by' => $user->id,
        'disk' => 'local',
        'object_key' => 'component-media/test/file.pdf',
        'original_name' => 'file.pdf',
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'size_bytes' => 128,
        'checksum_sha256' => str_repeat('a', 64),
    ]);
    $content = ProgramComponentContent::query()->create([
        'program_component_id' => $installation->id,
        'media_asset_id' => $asset->id,
        'title' => 'Reference',
        'slug' => 'reference',
        'payload' => ['audience' => 'student'],
        'status' => ComponentContentStatus::Draft,
    ]);
    $access = ProgramAccess::factory()->for($user)->for($program)->create();
    $submission = ProgramComponentSubmission::query()->create([
        'program_component_content_id' => $content->id,
        'program_access_id' => $access->id,
        'user_id' => $user->id,
        'payload' => ['answer' => 'value'],
        'submitted_at' => now(),
    ]);

    expect(class_uses_recursive(ComponentDefinition::class))->toContain(SoftDeletes::class)
        ->and(class_uses_recursive(ProgramComponent::class))->toContain(SoftDeletes::class)
        ->and($definition->handler_template)->toBe(ComponentHandlerTemplate::FileDownload)
        ->and($content->status)->toBe(ComponentContentStatus::Draft)
        ->and($content->payload)->toBe(['audience' => 'student'])
        ->and($content->programComponent->is($installation))->toBeTrue()
        ->and($content->mediaAsset->is($asset))->toBeTrue()
        ->and($submission->programAccess->is($access))->toBeTrue();
});

it('links material lessons to private media while retaining legacy content type', function (): void {
    $program = Program::factory()->create();
    $user = User::factory()->create();
    $module = ProgramModule::query()->create([
        'program_id' => $program->id,
        'title' => 'Module',
    ]);
    $asset = MediaAsset::query()->create([
        'program_id' => $program->id,
        'uploaded_by' => $user->id,
        'disk' => 'local',
        'object_key' => 'component-media/test/video.mp4',
        'original_name' => 'video.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 1024,
        'checksum_sha256' => str_repeat('b', 64),
    ]);
    $lesson = ProgramLesson::query()->create([
        'module_id' => $module->id,
        'title' => 'Video lesson',
        'content_type' => 'video',
        'content_kind' => ComponentHandlerTemplate::Video->value,
        'media_asset_id' => $asset->id,
    ]);

    expect($lesson->mediaAsset->is($asset))->toBeTrue()
        ->and($lesson->content_type)->toBe('video')
        ->and($lesson->content_kind)->toBe(ComponentHandlerTemplate::Video->value);
});
