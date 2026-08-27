<?php

use App\Enums\ComponentContentStatus;
use App\Enums\ComponentHandlerTemplate;
use App\Models\ComponentDefinition;
use App\Models\MediaAsset;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    Storage::fake('component-media');
    config(['components.media.disk' => 'component-media']);
    $this->program = Program::factory()->create();
    $this->admin = User::factory()->create();
    foreach (['media-asset.upload', 'media-asset.delete'] as $permission) {
        $this->admin->givePermissionTo(Permission::findOrCreate($permission, 'web'));
    }
    Sanctum::actingAs($this->admin);
});

it('stores private media with generated keys and safe metadata only', function (): void {
    $response = $this->post("/api/v1/admin/programs/{$this->program->id}/media-assets", [
        'file' => UploadedFile::fake()->createWithContent('Panduan Belajar.pdf', '%PDF-1.4 safe content'),
        'reason' => 'Upload a private learning guide.',
    ], ['Accept' => 'application/json'])->assertCreated();

    $asset = MediaAsset::query()->findOrFail($response->json('data.id'));

    Storage::disk('component-media')->assertExists($asset->object_key);
    expect($asset->disk)->toBe('component-media')
        ->and($asset->object_key)->toStartWith("programs/{$this->program->id}/")
        ->and($asset->object_key)->not->toContain('Panduan')
        ->and($asset->checksum_sha256)->toBe(hash('sha256', '%PDF-1.4 safe content'));

    $response->assertJsonMissingPath('data.disk')
        ->assertJsonMissingPath('data.object_key')
        ->assertJsonPath('data.original_name', 'Panduan Belajar.pdf');
});

it('rejects disallowed extensions and oversized files', function (): void {
    $this->post("/api/v1/admin/programs/{$this->program->id}/media-assets", [
        'file' => UploadedFile::fake()->create('payload.php', 2, 'application/x-php'),
        'reason' => 'Reject unsafe executable content.',
    ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');

    config(['components.media.max_kilobytes' => 1]);
    $this->post("/api/v1/admin/programs/{$this->program->id}/media-assets", [
        'file' => UploadedFile::fake()->create('large.pdf', 4, 'application/pdf'),
        'reason' => 'Reject a file above the configured limit.',
    ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');
});

it('prevents deleting referenced media and archives unused media without losing the object', function (): void {
    $used = uploadMedia($this, $this->program, 'used.pdf');
    $unused = uploadMedia($this, $this->program, 'unused.pdf');
    $component = mediaComponent($this->program);
    ProgramComponentContent::query()->create([
        'program_component_id' => $component->id,
        'media_asset_id' => $used->id,
        'title' => 'Private guide',
        'slug' => 'private-guide',
    ]);

    $this->deleteJson("/api/v1/admin/programs/{$this->program->id}/media-assets/{$used->id}", [
        'reason' => 'Referenced files cannot be removed.',
    ])->assertConflict()->assertJsonPath('code', 'MEDIA_ASSET_REFERENCED');

    $this->deleteJson("/api/v1/admin/programs/{$this->program->id}/media-assets/{$unused->id}", [
        'reason' => 'Archive an unused upload.',
    ])->assertNoContent();

    expect($unused->refresh()->trashed())->toBeTrue();
    Storage::disk('component-media')->assertExists($unused->object_key);
});

it('streams only media referenced by published enabled content to the owning active access', function (): void {
    $asset = uploadMedia($this, $this->program, 'member-guide.pdf');
    $component = mediaComponent($this->program);
    ProgramComponentContent::query()->create([
        'program_component_id' => $component->id,
        'media_asset_id' => $asset->id,
        'title' => 'Member guide',
        'slug' => 'member-guide',
        'status' => ComponentContentStatus::Published,
        'published_at' => now(),
    ]);
    $member = User::factory()->create();
    $access = ProgramAccess::factory()->active()->for($member)->for($this->program)->create();

    Sanctum::actingAs($member);
    $download = $this->get("/api/v1/workspace/accesses/{$access->id}/media-assets/{$asset->id}")
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff');
    expect($download->headers->get('Cache-Control'))->toContain('private')->toContain('no-store');

    $otherUser = User::factory()->create();
    Sanctum::actingAs($otherUser);
    $this->get("/api/v1/workspace/accesses/{$access->id}/media-assets/{$asset->id}")->assertNotFound();

    $unreferenced = uploadMedia($this, $this->program, 'hidden.pdf');
    Sanctum::actingAs($member);
    $this->get("/api/v1/workspace/accesses/{$access->id}/media-assets/{$unreferenced->id}")->assertNotFound();
});

function uploadMedia(object $test, Program $program, string $filename): MediaAsset
{
    Sanctum::actingAs($test->admin);
    $id = $test->post("/api/v1/admin/programs/{$program->id}/media-assets", [
        'file' => UploadedFile::fake()->createWithContent($filename, '%PDF-1.4 '.$filename),
        'reason' => 'Upload a test media asset.',
    ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

    return MediaAsset::query()->findOrFail($id);
}

function mediaComponent(Program $program): ProgramComponent
{
    $definition = ComponentDefinition::query()->create([
        'code' => 'downloads-'.str()->random(8),
        'name' => 'Downloads',
        'handler_template' => ComponentHandlerTemplate::FileDownload,
        'is_available' => true,
    ]);

    return ProgramComponent::query()->create([
        'program_id' => $program->id,
        'component_definition_id' => $definition->id,
        'is_enabled' => true,
    ]);
}
