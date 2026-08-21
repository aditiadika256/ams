<?php

use App\Enums\ComponentHandlerTemplate;
use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->program = Program::factory()->create();
    $this->user = User::factory()->create();
    foreach (['program-content.view', 'program-content.manage', 'program-content.publish', 'program-component.manage'] as $permission) {
        $this->user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
    }
    Sanctum::actingAs($this->user);
});

it('soft deletes omitted installations and restores the same row with its contents when selected again', function (): void {
    $definition = ComponentDefinition::query()->create([
        'code' => 'program_info',
        'name' => 'Program Info',
        'handler_template' => ComponentHandlerTemplate::Information,
    ]);
    $component = ProgramComponent::query()->create([
        'program_id' => $this->program->id,
        'component_definition_id' => $definition->id,
    ]);
    $content = ProgramComponentContent::query()->create([
        'program_component_id' => $component->id,
        'title' => 'Welcome',
        'slug' => 'welcome',
    ]);

    $this->putJson("/api/v1/admin/programs/{$this->program->id}/components", [
        'components' => [],
        'reason' => 'Temporarily remove the component.',
    ])->assertOk();
    expect($component->refresh()->trashed())->toBeTrue();

    $this->putJson("/api/v1/admin/programs/{$this->program->id}/components", [
        'components' => [[
            'component_definition_id' => $definition->id,
            'is_enabled' => true,
        ]],
        'reason' => 'Restore the component to this Program.',
    ])->assertOk();

    expect($component->refresh()->trashed())->toBeFalse()
        ->and($content->refresh()->program_component_id)->toBe($component->id)
        ->and(ProgramComponent::query()->where('program_id', $this->program->id)->count())->toBe(1);
});

it('allows incomplete drafts for every generic handler', function (ComponentHandlerTemplate $template): void {
    $component = componentFor($this->program, $template);

    $this->postJson(contentUrl($this->program, $component), [
        'title' => "Draft {$template->value}",
        'status' => 'DRAFT',
        'reason' => 'Create an incomplete working draft.',
    ])->assertCreated()
        ->assertJsonPath('data.status', 'DRAFT')
        ->assertJsonPath('data.published_at', null);
})->with([
    ComponentHandlerTemplate::Information,
    ComponentHandlerTemplate::ExternalLink,
    ComponentHandlerTemplate::FileDownload,
    ComponentHandlerTemplate::EmbeddedPage,
    ComponentHandlerTemplate::Video,
    ComponentHandlerTemplate::Form,
    ComponentHandlerTemplate::Iframe,
]);

it('rejects generic content for native handlers', function (): void {
    $component = componentFor($this->program, ComponentHandlerTemplate::Native, 'material');

    $this->postJson(contentUrl($this->program, $component), [
        'title' => 'Invalid generic material',
        'status' => 'DRAFT',
        'reason' => 'Prove native handlers use their own domain.',
    ])->assertUnprocessable()
        ->assertJsonPath('code', 'NATIVE_COMPONENT_CONTENT_UNSUPPORTED');
});

it('enforces handler requirements only when publishing', function (ComponentHandlerTemplate $template): void {
    $component = componentFor($this->program, $template);

    $this->postJson(contentUrl($this->program, $component), [
        'title' => "Invalid {$template->value}",
        'status' => 'PUBLISHED',
        'reason' => 'Attempt to publish incomplete content.',
    ])->assertUnprocessable()
        ->assertJsonPath('code', 'COMPONENT_CONTENT_INVALID');
})->with([
    ComponentHandlerTemplate::Information,
    ComponentHandlerTemplate::ExternalLink,
    ComponentHandlerTemplate::FileDownload,
    ComponentHandlerTemplate::EmbeddedPage,
    ComponentHandlerTemplate::Video,
    ComponentHandlerTemplate::Form,
    ComponentHandlerTemplate::Iframe,
]);

it('manages, scopes, publishes, archives and restores generic content', function (): void {
    $component = componentFor($this->program, ComponentHandlerTemplate::Information);
    $otherProgram = Program::factory()->create();

    $id = $this->postJson(contentUrl($this->program, $component), [
        'title' => 'Getting Started',
        'body' => 'Read this guide before beginning.',
        'status' => 'PUBLISHED',
        'reason' => 'Publish the onboarding information.',
    ])->assertCreated()
        ->assertJsonPath('data.slug', 'getting-started')
        ->assertJsonPath('data.status', 'PUBLISHED')
        ->assertJsonPath('data.published_at', fn ($value): bool => is_string($value))
        ->json('data.id');

    $this->getJson(contentUrl($this->program, $component))->assertOk()->assertJsonCount(1, 'data');
    $this->getJson(contentUrl($otherProgram, $component))->assertNotFound();

    $this->putJson(contentUrl($this->program, $component)."/{$id}", [
        'summary' => 'A short introduction.',
        'reason' => 'Improve the summary.',
    ])->assertOk()->assertJsonPath('data.summary', 'A short introduction.');

    $this->deleteJson(contentUrl($this->program, $component)."/{$id}", [
        'reason' => 'Archive outdated onboarding content.',
    ])->assertNoContent();

    $this->getJson(contentUrl($this->program, $component))->assertJsonCount(0, 'data');
    $this->postJson(contentUrl($this->program, $component)."/{$id}/restore", [
        'reason' => 'Restore the onboarding content.',
    ])->assertOk()->assertJsonPath('data.deleted_at', null);

    $this->assertDatabaseHas('audit_logs', [
        'entity_id' => $id,
        'action' => 'program_component_content.published',
    ]);
});

function componentFor(
    Program $program,
    ComponentHandlerTemplate $template,
    ?string $handlerKey = null,
): ProgramComponent {
    $definition = ComponentDefinition::query()->create([
        'code' => strtolower($template->value).'-'.str()->random(8),
        'name' => $template->value,
        'handler_template' => $template,
        'handler_key' => $handlerKey,
        'is_available' => true,
    ]);

    return ProgramComponent::query()->create([
        'program_id' => $program->id,
        'component_definition_id' => $definition->id,
    ]);
}

function contentUrl(Program $program, ProgramComponent $component): string
{
    return "/api/v1/admin/programs/{$program->id}/components/{$component->id}/contents";
}
