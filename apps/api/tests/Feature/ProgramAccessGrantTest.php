<?php

use App\Actions\Access\GrantCollectionAccesses;
use App\Actions\Access\GrantProgramAccess;
use App\Actions\Access\TransitionProgramAccess;
use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Enums\AccessStatus;
use App\Exceptions\DomainConflictException;
use App\Exceptions\InvalidStateTransitionException;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\ProgramRelation;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

it('grants one active access and records an append only event', function () {
    $user = User::factory()->create();
    $actor = User::factory()->create();
    $program = Program::factory()->create();

    $access = app(GrantProgramAccess::class)->handle(new AccessGrantData(
        userId: $user->id,
        programId: $program->id,
        source: AccessSource::AdminGrant,
        sourceId: 'manual-100',
        grantKey: 'admin:manual-100',
        metadata: ['note' => 'Initial grant'],
    ), $actor, 'Memberikan akses manual.');

    expect($access->status)->toBe(AccessStatus::Active)
        ->and($access->activated_at)->not->toBeNull()
        ->and($access->events)->toHaveCount(1)
        ->and($access->events->first()->action)->toBe('access.granted');

    expect(fn () => $access->events->first()->update(['reason' => 'changed']))
        ->toThrow(LogicException::class);
    expect(fn () => $access->events->first()->delete())
        ->toThrow(LogicException::class);
});

it('returns the same access for a matching grant retry and rejects conflicting semantics', function () {
    $user = User::factory()->create();
    $actor = User::factory()->create();
    $program = Program::factory()->create();
    $otherProgram = Program::factory()->create();
    $action = app(GrantProgramAccess::class);
    $data = new AccessGrantData(
        userId: $user->id,
        programId: $program->id,
        source: AccessSource::Payment,
        sourceId: 'order-42',
        grantKey: 'payment:order-42:item-1',
    );

    $first = $action->handle($data, $actor, 'Pembayaran terkonfirmasi.');
    $retry = $action->handle($data, $actor, 'Retry callback pembayaran.');

    expect($retry->id)->toBe($first->id);
    $this->assertDatabaseCount('program_accesses', 1);
    $this->assertDatabaseCount('access_events', 1);

    try {
        $action->handle(new AccessGrantData(
            userId: $user->id,
            programId: $otherProgram->id,
            source: AccessSource::Payment,
            sourceId: 'order-42',
            grantKey: 'payment:order-42:item-1',
        ), $actor, 'Payload callback berbeda.');
        $this->fail('A conflicting grant key should throw.');
    } catch (DomainConflictException $exception) {
        expect($exception->errorCode)->toBe('GRANT_KEY_CONFLICT');
    }
});

it('allows the same program in different batches but rejects a duplicate active enrollment', function () {
    $user = User::factory()->create();
    $program = Program::factory()->create();
    $batchA = ProgramBatch::factory()->for($program)->create([
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addMonth(),
    ]);
    $batchB = ProgramBatch::factory()->for($program)->create([
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addMonths(2),
    ]);
    $action = app(GrantProgramAccess::class);

    $action->handle(new AccessGrantData(
        userId: $user->id,
        programId: $program->id,
        batchId: $batchA->id,
        source: AccessSource::AdminGrant,
        sourceId: 'batch-a-1',
        grantKey: 'admin:batch-a-1',
    ), null, 'Grant Batch A.');

    $batchBAccess = $action->handle(new AccessGrantData(
        userId: $user->id,
        programId: $program->id,
        batchId: $batchB->id,
        source: AccessSource::AdminGrant,
        sourceId: 'batch-b-1',
        grantKey: 'admin:batch-b-1',
    ), null, 'Grant Batch B.');

    expect($batchBAccess->program_batch_id)->toBe($batchB->id);

    try {
        $action->handle(new AccessGrantData(
            userId: $user->id,
            programId: $program->id,
            batchId: $batchA->id,
            source: AccessSource::AdminGrant,
            sourceId: 'batch-a-duplicate',
            grantKey: 'admin:batch-a-duplicate',
        ), null, 'Duplicate Batch A.');
        $this->fail('A duplicate active enrollment should throw.');
    } catch (DomainConflictException $exception) {
        expect($exception->errorCode)->toBe('ACCESS_ALREADY_EXISTS');
    }
});

it('requires retake permission after a terminal enrollment', function () {
    $user = User::factory()->create();
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create(['allow_retakes' => false]);
    ProgramAccess::factory()->for($user)->for($program)->create([
        'program_batch_id' => $batch->id,
        'status' => AccessStatus::Completed,
        'completed_at' => now(),
    ]);
    $action = app(GrantProgramAccess::class);

    try {
        $action->handle(new AccessGrantData(
            userId: $user->id,
            programId: $program->id,
            batchId: $batch->id,
            source: AccessSource::AdminGrant,
            sourceId: 'retake-blocked',
            grantKey: 'admin:retake-blocked',
        ), null, 'Retake belum diizinkan.');
        $this->fail('A terminal enrollment without retake permission should throw.');
    } catch (DomainConflictException $exception) {
        expect($exception->errorCode)->toBe('RETAKE_NOT_ALLOWED');
    }

    $batch->update(['allow_retakes' => true]);
    $retake = $action->handle(new AccessGrantData(
        userId: $user->id,
        programId: $program->id,
        batchId: $batch->id,
        source: AccessSource::AdminGrant,
        sourceId: 'retake-allowed',
        grantKey: 'admin:retake-allowed',
    ), null, 'Retake sudah diizinkan.');

    expect($retake->program_batch_id)->toBe($batch->id);
});

it('rejects a collection parent owned by another user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $parent = ProgramAccess::factory()->active()->for($otherUser)->create();
    $program = Program::factory()->create();

    try {
        app(GrantProgramAccess::class)->handle(new AccessGrantData(
            userId: $user->id,
            programId: $program->id,
            source: AccessSource::Collection,
            sourceId: (string) $parent->id,
            grantKey: "collection:{$parent->id}:program:{$program->id}",
            parentAccessId: $parent->id,
            allowDuplicate: true,
        ), null, 'Parent berbeda pemilik.');
        $this->fail('A parent access owned by another user should throw.');
    } catch (DomainConflictException $exception) {
        expect($exception->errorCode)->toBe('ACCESS_PARENT_INVALID');
    }
});

it('uses batch periods and capacity while granting access', function () {
    $program = Program::factory()->create();
    $batch = ProgramBatch::factory()->for($program)->create([
        'starts_at' => now()->addWeek(),
        'ends_at' => now()->addMonth(),
        'capacity' => 1,
        'enrolled_count' => 0,
    ]);
    $action = app(GrantProgramAccess::class);

    $waiting = $action->handle(new AccessGrantData(
        userId: User::factory()->create()->id,
        programId: $program->id,
        batchId: $batch->id,
        source: AccessSource::Payment,
        sourceId: 'future-batch-order',
        grantKey: 'payment:future-batch-order',
    ), null, 'Pembayaran Batch mendatang.');

    expect($waiting->status)->toBe(AccessStatus::Waiting)
        ->and($waiting->starts_at?->equalTo($batch->starts_at))->toBeTrue()
        ->and($batch->fresh()->enrolled_count)->toBe(1);

    try {
        $action->handle(new AccessGrantData(
            userId: User::factory()->create()->id,
            programId: $program->id,
            batchId: $batch->id,
            source: AccessSource::Payment,
            sourceId: 'full-batch-order',
            grantKey: 'payment:full-batch-order',
        ), null, 'Melebihi kapasitas Batch.');
        $this->fail('A full batch should reject a grant.');
    } catch (DomainConflictException $exception) {
        expect($exception->errorCode)->toBe('BATCH_FULL');
    }
});

it('creates deterministic collection child grants without duplicates', function () {
    $user = User::factory()->create();
    $actor = User::factory()->create();
    $parent = Program::factory()->create();
    $childA = Program::factory()->create();
    $childB = Program::factory()->create();
    ProgramRelation::query()->create([
        'parent_program_id' => $parent->id,
        'child_program_id' => $childA->id,
        'sort_order' => 1,
    ]);
    ProgramRelation::query()->create([
        'parent_program_id' => $parent->id,
        'child_program_id' => $childB->id,
        'sort_order' => 2,
    ]);
    $parentAccess = app(GrantProgramAccess::class)->handle(new AccessGrantData(
        userId: $user->id,
        programId: $parent->id,
        source: AccessSource::Payment,
        sourceId: 'collection-order',
        grantKey: 'payment:collection-order',
    ), $actor, 'Pembelian collection.');

    $action = app(GrantCollectionAccesses::class);
    $first = $action->handle($parentAccess, $actor, 'Menurunkan akses collection.');
    $retry = $action->handle($parentAccess, $actor, 'Retry akses collection.');

    expect($first)->toHaveCount(2)
        ->and($retry->pluck('id')->all())->toBe($first->pluck('id')->all());
    $this->assertDatabaseHas('program_accesses', [
        'parent_program_access_id' => $parentAccess->id,
        'program_id' => $childA->id,
        'grant_key' => "collection:{$parentAccess->id}:program:{$childA->id}",
    ]);
    $this->assertDatabaseCount('program_accesses', 3);
});

it('enforces lifecycle transitions and records their reasons', function () {
    $actor = User::factory()->create();
    $access = ProgramAccess::factory()->active()->create(['ends_at' => now()->addWeek()]);
    $action = app(TransitionProgramAccess::class);

    $suspended = $action->transition($access, AccessStatus::Suspended, $actor, 'Pelanggaran sementara.');
    expect($suspended->status)->toBe(AccessStatus::Suspended)
        ->and($suspended->suspended_at)->not->toBeNull();

    $restored = $action->transition($suspended, AccessStatus::Active, $actor, 'Banding diterima.');
    expect($restored->status)->toBe(AccessStatus::Active)
        ->and($restored->suspended_at)->toBeNull();

    $extended = $action->extend($restored, now()->addMonth(), $actor, 'Perpanjangan akses satu bulan.');
    expect($extended->events()->where('action', 'access.extended')->exists())->toBeTrue();

    $revoked = $action->transition($extended, AccessStatus::Revoked, $actor, 'Akses dicabut permanen.');
    expect($revoked->status)->toBe(AccessStatus::Revoked)
        ->and($revoked->revoked_at)->not->toBeNull();

    expect(fn () => $action->transition($revoked, AccessStatus::Active, $actor, 'Mencoba restore revoke.'))
        ->toThrow(InvalidStateTransitionException::class);
    $this->assertDatabaseHas('access_events', [
        'program_access_id' => $access->id,
        'action' => 'access.revoked',
        'reason' => 'Akses dicabut permanen.',
    ]);
});

it('does not activate an access before its period starts', function () {
    $actor = User::factory()->create();
    $access = ProgramAccess::factory()->create([
        'status' => AccessStatus::Waiting,
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addMonth(),
    ]);

    try {
        app(TransitionProgramAccess::class)->transition(
            $access,
            AccessStatus::Active,
            $actor,
            'Aktivasi terlalu awal.',
        );
        $this->fail('A future access should not activate.');
    } catch (DomainConflictException $exception) {
        expect($exception->errorCode)->toBe('ACCESS_PERIOD_INACTIVE');
    }

    expect($access->events()->count())->toBe(0);
});
