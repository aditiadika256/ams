<?php

use App\Actions\Programs\TransitionProgram;
use App\Enums\ProgramStatus;
use App\Exceptions\ProgramCompositionException;
use App\Models\AccessEvent;
use App\Models\ComponentDefinition;
use App\Models\ExamAnswer;
use App\Models\ExamAttempt;
use App\Models\ExamPackage;
use App\Models\ExamSession;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramAccessActivity;
use App\Models\ProgramCertificate;
use App\Models\ProgramLesson;
use App\Models\ProgramModule;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\User;
use App\Support\Components\CompletionRuleValidator;
use Database\Seeders\ComponentDefinitionSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(ComponentDefinitionSeeder::class);
});

it('rejects unknown and malformed completion requirements', function () {
    $validator = app(CompletionRuleValidator::class);

    expect(fn () => $validator->validate([
        'version' => 1,
        'all' => [[
            'component' => 'shipping',
            'metric' => 'completed_percent',
            'operator' => '>=',
            'value' => 100,
        ]],
    ]))->toThrow(ProgramCompositionException::class, 'Completion rule tidak didukung');

    expect(fn () => $validator->validate(['version' => 1, 'all' => []]))
        ->toThrow(ProgramCompositionException::class, 'Completion rule harus memiliki requirement');

    expect(fn () => $validator->validate([
        'version' => 1,
        'all' => [[
            'component' => 'material',
            'metric' => 'completed_percent',
            'operator' => '>=',
            'value' => 100,
            'unexpected' => true,
        ]],
    ]))->toThrow(ProgramCompositionException::class, 'field yang tidak didukung');
});

it('blocks publication when a completion component is not enabled and available', function () {
    $actor = User::factory()->create();
    $program = Program::factory()->create([
        'completion_rule' => [
            'version' => 1,
            'all' => [[
                'component' => 'material',
                'metric' => 'completed_percent',
                'operator' => '>=',
                'value' => 100,
            ]],
        ],
    ]);

    expect(fn () => app(TransitionProgram::class)->handle(
        $program,
        ProgramStatus::Published,
        $actor,
        'Menerbitkan program.',
    ))->toThrow(ProgramCompositionException::class, 'harus aktif dan tersedia');
});

it('records lesson progress idempotently and completes access with one certificate', function () {
    $user = User::factory()->create();
    $program = Program::factory()->create([
        'completion_rule' => [
            'version' => 1,
            'all' => [[
                'component' => 'material',
                'metric' => 'completed_percent',
                'operator' => '>=',
                'value' => 100,
            ]],
        ],
    ]);
    $material = ComponentDefinition::query()->where('code', 'material')->firstOrFail();
    $certificate = ComponentDefinition::query()->where('code', 'certificate')->firstOrFail();
    $certificate->update(['is_available' => true]);
    $program->components()->createMany([
        ['component_definition_id' => $material->id, 'is_enabled' => true, 'sort_order' => 1],
        ['component_definition_id' => $certificate->id, 'is_enabled' => true, 'sort_order' => 2],
    ]);
    $module = ProgramModule::query()->create([
        'program_id' => $program->id,
        'title' => 'Fondasi',
        'is_published' => true,
    ]);
    $firstLesson = ProgramLesson::query()->create([
        'module_id' => $module->id,
        'title' => 'Lesson pertama',
        'is_published' => true,
    ]);
    $secondLesson = ProgramLesson::query()->create([
        'module_id' => $module->id,
        'title' => 'Lesson kedua',
        'is_published' => true,
    ]);
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create();
    Sanctum::actingAs($user);

    $this->postJson("/api/v1/workspace/accesses/{$access->id}/lessons/{$firstLesson->id}/complete", [
        'idempotency_key' => 'lesson-first',
    ])->assertOk()
        ->assertJsonPath('data.progress.percent', 50)
        ->assertJsonPath('data.status', 'ACTIVE');

    $this->postJson("/api/v1/workspace/accesses/{$access->id}/lessons/{$firstLesson->id}/complete", [
        'idempotency_key' => 'lesson-first-retry',
    ])->assertOk()->assertJsonPath('data.progress.percent', 50);

    $this->postJson("/api/v1/workspace/accesses/{$access->id}/lessons/{$secondLesson->id}/complete", [
        'idempotency_key' => 'lesson-second',
    ])->assertOk()
        ->assertJsonPath('data.progress.percent', 100)
        ->assertJsonPath('data.status', 'COMPLETED')
        ->assertJsonPath('data.certificate.certificate_number', fn ($value) => is_string($value) && $value !== '');

    $this->getJson("/api/v1/workspace/accesses/{$access->id}/curriculum")->assertOk();

    expect(ProgramAccessActivity::query()->where('program_access_id', $access->id)->count())->toBe(2)
        ->and(ProgramCertificate::query()->where('program_access_id', $access->id)->count())->toBe(1)
        ->and(AccessEvent::query()->where('program_access_id', $access->id)->where('action', 'access.completed')->count())->toBe(1)
        ->and($access->fresh()->progress_percent)->toBe('100.00');
});

it('does not allow a user to complete another programs lesson or another users access', function () {
    $user = User::factory()->create();
    $program = Program::factory()->create();
    $otherProgram = Program::factory()->create();
    $module = ProgramModule::query()->create([
        'program_id' => $otherProgram->id,
        'title' => 'Program lain',
        'is_published' => true,
    ]);
    $lesson = ProgramLesson::query()->create([
        'module_id' => $module->id,
        'title' => 'Lesson lain',
        'is_published' => true,
    ]);
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create();
    $otherAccess = ProgramAccess::factory()->active()->for($program)->create();
    Sanctum::actingAs($user);

    $this->postJson("/api/v1/workspace/accesses/{$access->id}/lessons/{$lesson->id}/complete", [
        'idempotency_key' => 'wrong-program',
    ])->assertNotFound();

    $this->postJson("/api/v1/workspace/accesses/{$otherAccess->id}/lessons/{$lesson->id}/complete", [
        'idempotency_key' => 'wrong-user',
    ])->assertNotFound();
});

it('records assessment progress only after a configured exam is submitted', function () {
    $user = User::factory()->create();
    $package = ExamPackage::query()->create([
        'name' => 'Assessment akhir',
        'level' => 'umum',
        'duration_minutes' => 60,
    ]);
    $program = Program::factory()->create([
        'completion_rule' => [
            'version' => 1,
            'all' => [[
                'component' => 'assessment',
                'metric' => 'submitted_count',
                'operator' => '>=',
                'value' => 1,
            ]],
        ],
    ]);
    $assessment = ComponentDefinition::query()->where('code', 'assessment')->firstOrFail();
    $program->components()->create([
        'component_definition_id' => $assessment->id,
        'is_enabled' => true,
        'configuration' => ['exam_package_ids' => [$package->id]],
    ]);
    $access = ProgramAccess::factory()->active()->for($user)->for($program)->create();
    $session = ExamSession::query()->create([
        'package_id' => $package->id,
        'user_id' => $user->id,
        'program_access_id' => $access->id,
        'status' => 'ongoing',
        'start_at' => now(),
    ]);
    $attempt = ExamAttempt::query()->create([
        'session_id' => $session->id,
        'started_at' => now(),
        'score_total' => 0,
    ]);
    $bank = QuestionBank::query()->create([
        'name' => 'Bank assessment',
        'level' => 'umum',
        'subject' => 'Umum',
    ]);
    $question = Question::query()->create([
        'bank_id' => $bank->id,
        'type' => 'mcq',
        'stem' => 'Jawaban benar?',
        'options' => ['A', 'B'],
        'answer_key' => ['A'],
    ]);
    ExamAnswer::query()->create([
        'attempt_id' => $attempt->id,
        'question_id' => $question->id,
        'answer' => ['A'],
    ]);
    Sanctum::actingAs($user);

    $this->postJson("/api/v1/exams/{$attempt->id}/submit")
        ->assertOk()
        ->assertJsonPath('data.submitted_at', fn ($value) => is_string($value) && $value !== '');
    $this->getJson("/api/v1/exams/{$attempt->id}/result")->assertOk();

    expect(ProgramAccessActivity::query()
        ->where('program_access_id', $access->id)
        ->where('activity_key', "exam-attempt:{$attempt->id}")
        ->count())->toBe(1)
        ->and($access->fresh()->status->value)->toBe('COMPLETED')
        ->and($access->fresh()->progress_percent)->toBe('100.00');
});
