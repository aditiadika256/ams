<?php

use App\Enums\AccessStatus;
use App\Enums\ComponentContentStatus;
use App\Enums\ComponentHandlerTemplate;
use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use App\Models\ProgramComponentSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->program = Program::factory()->create();
    $this->access = ProgramAccess::factory()->active()->for($this->user)->for($this->program)->create();
    Sanctum::actingAs($this->user);
});

it('returns only published content for an enabled owned component with renderer metadata', function (): void {
    $component = workspaceGenericComponent($this->program, ComponentHandlerTemplate::Information);
    workspaceContent($component, 'Published', ComponentContentStatus::Published, ['body' => 'Member information.']);
    workspaceContent($component, 'Draft', ComponentContentStatus::Draft);

    $this->getJson(workspaceContentUrl($this->access, $component))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Published')
        ->assertJsonPath('meta.component.handler_template', 'INFORMATION');

    $this->getJson("/api/v1/workspace/accesses/{$this->access->id}")
        ->assertOk()
        ->assertJsonPath('data.components.0.id', $component->id)
        ->assertJsonPath('data.components.0.handler_template', 'INFORMATION');
});

it('denies foreign, disabled, unavailable and revoked-parent component content', function (): void {
    $component = workspaceGenericComponent($this->program, ComponentHandlerTemplate::Information);
    workspaceContent($component, 'Protected', ComponentContentStatus::Published, ['body' => 'Protected.']);

    $otherUser = User::factory()->create();
    Sanctum::actingAs($otherUser);
    $this->getJson(workspaceContentUrl($this->access, $component))->assertNotFound();

    Sanctum::actingAs($this->user);
    $component->update(['is_enabled' => false]);
    $this->getJson(workspaceContentUrl($this->access, $component))->assertForbidden();
    $component->update(['is_enabled' => true]);
    $component->definition->update(['is_available' => false]);
    $this->getJson(workspaceContentUrl($this->access, $component))->assertForbidden();

    $component->definition->update(['is_available' => true]);
    $parent = ProgramAccess::factory()->for($this->user)->create(['status' => AccessStatus::Revoked]);
    $this->access->update(['parent_program_access_id' => $parent->id]);
    $this->getJson(workspaceContentUrl($this->access->refresh(), $component))->assertForbidden();
});

it('allows completed users to read content but not submit forms', function (): void {
    $component = workspaceGenericComponent($this->program, ComponentHandlerTemplate::Form);
    $content = workspaceContent($component, 'Feedback', ComponentContentStatus::Published, [
        'payload' => ['fields' => [[
            'key' => 'message', 'label' => 'Message', 'type' => 'text', 'required' => true,
        ]]],
    ]);
    $this->access->update(['status' => AccessStatus::Completed]);

    $this->getJson(workspaceContentUrl($this->access, $component))->assertOk();
    $this->postJson(workspaceContentUrl($this->access, $component)."/{$content->id}/submissions", [
        'answers' => ['message' => 'Done'],
    ])->assertForbidden()->assertJsonPath('code', 'COMPONENT_ACCESS_DENIED');
});

it('validates form answers and stores one authoritative submission per enrollment', function (): void {
    $component = workspaceGenericComponent($this->program, ComponentHandlerTemplate::Form);
    $content = workspaceContent($component, 'Registration', ComponentContentStatus::Published, [
        'payload' => ['fields' => [
            ['key' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
            ['key' => 'track', 'label' => 'Track', 'type' => 'select', 'required' => true, 'options' => ['science', 'social']],
        ]],
    ]);
    $url = workspaceContentUrl($this->access, $component)."/{$content->id}/submissions";

    $this->postJson($url, ['answers' => ['email' => 'invalid', 'track' => 'unknown', 'extra' => true]])
        ->assertUnprocessable()->assertJsonPath('code', 'FORM_SUBMISSION_INVALID');

    $payload = ['answers' => ['email' => 'member@example.com', 'track' => 'science']];
    $firstId = $this->postJson($url, $payload)
        ->assertCreated()
        ->assertJsonPath('data.answers.email', 'member@example.com')
        ->json('data.id');
    $this->postJson($url, $payload)->assertOk()->assertJsonPath('data.id', $firstId);
    $this->postJson($url, ['answers' => ['email' => 'changed@example.com', 'track' => 'social']])
        ->assertConflict()->assertJsonPath('code', 'FORM_ALREADY_SUBMITTED');

    expect(ProgramComponentSubmission::query()->count())->toBe(1);
});

function workspaceGenericComponent(Program $program, ComponentHandlerTemplate $template): ProgramComponent
{
    $definition = ComponentDefinition::query()->create([
        'code' => strtolower($template->value).'-'.str()->random(8),
        'name' => $template->value,
        'handler_template' => $template,
        'is_available' => true,
    ]);

    return ProgramComponent::query()->create([
        'program_id' => $program->id,
        'component_definition_id' => $definition->id,
        'is_enabled' => true,
    ])->load('definition');
}

function workspaceContent(
    ProgramComponent $component,
    string $title,
    ComponentContentStatus $status,
    array $attributes = [],
): ProgramComponentContent {
    return ProgramComponentContent::query()->create([
        'program_component_id' => $component->id,
        'title' => $title,
        'slug' => str($title)->slug().'-'.str()->random(6),
        'status' => $status,
        'published_at' => $status === ComponentContentStatus::Published ? now() : null,
        ...$attributes,
    ]);
}

function workspaceContentUrl(ProgramAccess $access, ProgramComponent $component): string
{
    return "/api/v1/workspace/accesses/{$access->id}/components/{$component->id}/contents";
}
