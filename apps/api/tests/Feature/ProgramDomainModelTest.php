<?php

use App\Enums\AccessStatus;
use App\Enums\ProgramStatus;
use App\Enums\ProgramVisibility;
use App\Models\ComponentDefinition;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\ComponentDefinitionSeeder;
use Database\Seeders\MenuSeeder;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

it('casts program lifecycle money and metadata without level or type', function () {
    $program = Program::factory()->published()->create([
        'base_price' => '125000.50',
        'completion_rule' => ['required_lessons_percent' => 100],
    ]);

    expect($program->status)->toBe(ProgramStatus::Published)
        ->and($program->visibility)->toBe(ProgramVisibility::Public)
        ->and($program->base_price)->toBe('125000.50')
        ->and($program->completion_rule)->toBe(['required_lessons_percent' => 100])
        ->and($program->getAttributes())->not->toHaveKeys([
            'level',
            'type',
            'program_level_id',
            'program_type_id',
        ]);
});

it('exposes typed program composition delivery and access relations', function () {
    $program = Program::factory()->create();
    $tag = Tag::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create();
    $user = User::factory()->create();
    $access = ProgramAccess::factory()
        ->for($program)
        ->for($batch, 'batch')
        ->for($user)
        ->active()
        ->create();

    $program->tags()->attach($tag);

    expect($program->refresh()->tags->modelKeys())->toBe([$tag->id])
        ->and($program->batches->modelKeys())->toBe([$batch->id])
        ->and($program->accesses->modelKeys())->toBe([$access->id])
        ->and($user->programAccesses->modelKeys())->toBe([$access->id])
        ->and($access->status)->toBe(AccessStatus::Active)
        ->and($access->batch->is($batch))->toBeTrue();
});

it('seeds the immutable component registry idempotently', function () {
    $this->seed(ComponentDefinitionSeeder::class);
    $this->seed(ComponentDefinitionSeeder::class);

    expect(ComponentDefinition::query()->count())->toBe(14)
        ->and(ComponentDefinition::query()->orderBy('sort_order')->pluck('code')->all())
        ->toBe([
            'material',
            'video',
            'meeting',
            'attendance',
            'qr_attendance',
            'assessment',
            'assignment',
            'certificate',
            'discussion',
            'download',
            'shipping',
            'consultation',
            'ai_tutor',
            'live_chat',
        ]);
});

it('seeds granular permissions and workspace menus without legacy masters', function () {
    $this->seed(RolesSeeder::class);
    $this->seed(MenuSeeder::class);

    foreach (['web', 'sanctum'] as $guard) {
        foreach ([
            'program.view',
            'program.create',
            'program.update',
            'program.publish',
            'program.archive',
            'program.clone',
            'program-tag.manage',
            'program-component.manage',
            'program-batch.manage',
            'program-session.manage',
            'mentor-assignment.manage',
            'program-access.view',
            'program-access.grant',
            'program-access.suspend',
            'program-access.revoke',
            'program-access.extend',
        ] as $permission) {
            expect(Permission::findByName($permission, $guard))->not->toBeNull();
        }
    }

    $this->assertDatabaseHas('menus', [
        'seed_key' => 'users.bottom.workspace',
        'url' => '/workspace',
    ]);
    $this->assertDatabaseHas('menus', [
        'seed_key' => 'admin.sidebar.education.tags',
        'url' => 'admin://view/tags',
    ]);
    $this->assertDatabaseMissing('menus', ['url' => 'admin://view/program-levels']);
    $this->assertDatabaseMissing('menus', ['url' => 'admin://view/program-types']);
});
