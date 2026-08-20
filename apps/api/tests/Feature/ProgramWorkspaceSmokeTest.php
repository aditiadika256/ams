<?php

use App\Enums\AccessStatus;
use App\Models\ComponentDefinition;
use App\Models\ExamPackage;
use App\Models\Order;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(LazilyRefreshDatabase::class);

it('does not treat a paid order without ProgramAccess as entitlement', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $program = Program::factory()->published()->create();
    $order = Order::query()->create([
        'user_id' => $user->id,
        'status' => 'paid',
        'total' => '100000.00',
        'payment_reference' => 'PAID-WITHOUT-GRANT',
        'paid_at' => now(),
    ]);
    $order->items()->create([
        'program_id' => $program->id,
        'program_name' => $program->name,
        'program_slug' => $program->slug,
        'unit_price' => '100000.00',
        'currency' => 'IDR',
        'quantity' => 1,
    ]);

    $this->getJson('/api/v1/workspace')
        ->assertOk()
        ->assertJsonCount(0, 'data.data');
});

it('requires an owned usable material access for curriculum direct URLs', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $program = Program::factory()->published()->create();
    $module = $program->modules()->create([
        'title' => 'Modul Terbit', 'order' => 1, 'is_published' => true,
    ]);
    $module->lessons()->create([
        'title' => 'Pelajaran Terbit', 'slug' => 'pelajaran-terbit',
        'content_type' => 'text', 'order' => 1, 'is_published' => true,
    ]);
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create();

    $this->getJson("/api/v1/workspace/accesses/{$access->id}/curriculum")->assertForbidden();

    $material = ComponentDefinition::query()->create([
        'code' => 'material', 'name' => 'Materi', 'is_available' => true,
    ]);
    $program->components()->create([
        'component_definition_id' => $material->id, 'is_enabled' => true,
    ]);

    $this->getJson("/api/v1/workspace/accesses/{$access->id}/curriculum")
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Modul Terbit')
        ->assertJsonPath('data.0.lessons.0.title', 'Pelajaran Terbit');

    $access->update(['status' => AccessStatus::Suspended]);
    $this->getJson("/api/v1/workspace/accesses/{$access->id}/curriculum")->assertForbidden();

    $other = ProgramAccess::factory()->active()->for($program)->create();
    $this->getJson("/api/v1/workspace/accesses/{$other->id}/curriculum")->assertNotFound();
});

it('requires an assessment entitlement and configured package before starting an exam', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $program = Program::factory()->published()->create();
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create();
    $package = ExamPackage::query()->create([
        'name' => 'Tryout TKA',
        'level' => 'umum',
        'duration_minutes' => 90,
        'randomize' => false,
        'show_result_mode' => 'after',
    ]);

    $this->postJson('/api/v1/exams/start', ['package_id' => $package->id])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('program_access_id');

    $assessment = ComponentDefinition::query()->create([
        'code' => 'assessment', 'name' => 'Tryout', 'is_available' => true,
    ]);
    $program->components()->create([
        'component_definition_id' => $assessment->id,
        'is_enabled' => true,
        'configuration' => ['exam_package_ids' => [$package->id]],
    ]);

    $this->getJson('/api/v1/exams/packages')->assertUnprocessable();
    $this->getJson("/api/v1/exams/packages?program_access_id={$access->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $package->id);

    $attemptId = $this->postJson('/api/v1/exams/start', [
        'package_id' => $package->id,
        'program_access_id' => $access->id,
    ])->assertOk()->json('data.attempt_id');

    $this->assertDatabaseHas('exam_sessions', [
        'user_id' => $user->id,
        'package_id' => $package->id,
        'program_access_id' => $access->id,
    ]);

    $unconfigured = ExamPackage::query()->create([
        'name' => 'Paket Tidak Terhubung',
        'level' => 'umum',
        'duration_minutes' => 60,
    ]);
    $this->postJson('/api/v1/exams/start', [
        'package_id' => $unconfigured->id,
        'program_access_id' => $access->id,
    ])->assertForbidden();

    $access->update(['status' => AccessStatus::Suspended]);
    $this->getJson("/api/v1/exams/{$attemptId}/questions")->assertForbidden();
});
