<?php

use App\Enums\ComponentHandlerTemplate;
use App\Models\ComponentDefinition;
use App\Models\MediaAsset;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    Storage::fake('component-media');
    $this->program = Program::factory()->create();
    $this->admin = User::factory()->create();
    foreach (['program-content.view', 'program-content.manage', 'program-content.publish'] as $permission) {
        $this->admin->givePermissionTo(Permission::findOrCreate($permission, 'web'));
    }
    $this->material = ComponentDefinition::query()->create([
        'code' => 'material',
        'name' => 'Material',
        'handler_template' => ComponentHandlerTemplate::Native,
        'handler_key' => 'material',
        'is_available' => true,
    ]);
    $this->program->components()->create([
        'component_definition_id' => $this->material->id,
        'is_enabled' => true,
    ]);
    Sanctum::actingAs($this->admin);
});

it('creates and updates modules using validated data and immutable Program ownership', function (): void {
    $other = Program::factory()->create();
    $id = $this->postJson("/api/v1/learning/programs/{$this->program->id}/modules", [
        'program_id' => $other->id,
        'title' => 'Foundations',
        'description' => 'Start here.',
        'is_published' => false,
        'reason' => 'Create the first material module.',
    ])->assertCreated()->assertJsonPath('data.title', 'Foundations')->json('data.id');

    $this->assertDatabaseHas('program_modules', ['id' => $id, 'program_id' => $this->program->id]);
    $this->putJson("/api/v1/learning/modules/{$id}", [
        'title' => 'Updated Foundations',
        'reason' => 'Clarify the module title.',
    ])->assertOk()->assertJsonPath('data.title', 'Updated Foundations');
    $this->assertDatabaseHas('audit_logs', ['entity_id' => $id, 'action' => 'program_module.updated']);
});

it('allows incomplete lesson drafts but validates the selected kind at publication', function (): void {
    $module = $this->program->modules()->create(['title' => 'Draft Module']);

    $id = $this->postJson("/api/v1/learning/modules/{$module->id}/lessons", [
        'title' => 'Draft Download',
        'content_kind' => 'FILE_DOWNLOAD',
        'is_published' => false,
        'reason' => 'Create a working lesson draft.',
    ])->assertCreated()->assertJsonPath('data.content_kind', 'FILE_DOWNLOAD')->json('data.id');

    $this->putJson("/api/v1/learning/lessons/{$id}", [
        'is_published' => true,
        'reason' => 'Attempt publishing without a file.',
    ])->assertUnprocessable()->assertJsonPath('code', 'MATERIAL_CONTENT_INVALID');

    $this->postJson("/api/v1/learning/modules/{$module->id}/lessons", [
        'title' => 'Unsafe legacy path',
        'content_kind' => 'FILE_DOWNLOAD',
        'content_url' => '/storage/private/secret.pdf',
        'reason' => 'Raw storage paths must never be accepted.',
    ])->assertUnprocessable()->assertJsonValidationErrors('content_url');
});

it('rejects media from another Program and publishes a valid private file lesson', function (): void {
    $module = $this->program->modules()->create(['title' => 'Files']);
    $otherAsset = materialAsset(Program::factory()->create(), 'foreign.pdf');

    $this->postJson("/api/v1/learning/modules/{$module->id}/lessons", [
        'title' => 'Foreign file',
        'content_kind' => 'FILE_DOWNLOAD',
        'media_asset_id' => $otherAsset->id,
        'is_published' => true,
        'reason' => 'A foreign file must be rejected.',
    ])->assertUnprocessable()->assertJsonPath('code', 'MATERIAL_CONTENT_INVALID');

    $asset = materialAsset($this->program, 'guide.pdf');
    $this->postJson("/api/v1/learning/modules/{$module->id}/lessons", [
        'title' => 'Private Guide',
        'content_kind' => 'FILE_DOWNLOAD',
        'media_asset_id' => $asset->id,
        'is_published' => true,
        'reason' => 'Publish the private guide.',
    ])->assertCreated()->assertJsonPath('data.media_asset.id', $asset->id);
});

it('returns only published material through a safe Workspace resource', function (): void {
    $module = $this->program->modules()->create([
        'title' => 'Published Module', 'is_published' => true,
    ]);
    $asset = materialAsset($this->program, 'member.pdf');
    $lesson = $module->lessons()->create([
        'title' => 'Member File',
        'slug' => 'member-file',
        'content_kind' => ComponentHandlerTemplate::FileDownload->value,
        'content_type' => 'text',
        'content_url' => '/legacy/private/path.pdf',
        'media_asset_id' => $asset->id,
        'is_published' => true,
    ]);
    $member = User::factory()->create();
    $access = ProgramAccess::factory()->active()->for($member)->for($this->program)->create();
    Sanctum::actingAs($member);

    $this->getJson("/api/v1/workspace/accesses/{$access->id}/curriculum")
        ->assertOk()
        ->assertJsonPath('data.0.lessons.0.id', $lesson->id)
        ->assertJsonPath('data.0.lessons.0.media_asset.download_url', "/api/v1/workspace/accesses/{$access->id}/media-assets/{$asset->id}")
        ->assertJsonMissingPath('data.0.lessons.0.content_url')
        ->assertJsonMissingPath('data.0.lessons.0.media_asset_id')
        ->assertJsonMissingPath('data.0.lessons.0.media_asset.object_key');
});

function materialAsset(Program $program, string $name): MediaAsset
{
    $key = "programs/{$program->id}/tests/{$name}";
    Storage::disk('component-media')->put($key, 'test');

    return MediaAsset::query()->create([
        'program_id' => $program->id,
        'disk' => 'component-media',
        'object_key' => $key,
        'original_name' => $name,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'size_bytes' => 4,
        'checksum_sha256' => hash('sha256', 'test'),
    ]);
}
