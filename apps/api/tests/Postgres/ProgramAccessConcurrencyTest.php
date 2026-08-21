<?php

use App\Enums\CodeType;
use App\Models\AccessCode;
use App\Models\AccessCodeRedemption;
use App\Models\AccessEvent;
use App\Models\Mentor;
use App\Models\Order;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use App\Models\SessionMentorReservation;
use App\Models\User;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\ProgramAccessConcurrencyProbe;

beforeEach(function (): void {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Concurrency suite requires PostgreSQL.');
    }

    if (! str_ends_with((string) config('database.connections.pgsql.database'), '_test')) {
        throw new RuntimeException('PostgreSQL concurrency suite requires a database name ending in _test.');
    }

    $this->marker = 'pg-concurrency-'.Str::lower((string) Str::ulid());
});

afterEach(function (): void {
    if (! isset($this->marker) || DB::getDriverName() !== 'pgsql') {
        return;
    }

    $userIds = User::query()->where('email', 'like', "{$this->marker}%")->pluck('id');
    $accessIds = ProgramAccess::query()
        ->where(fn ($query) => $query
            ->whereIn('user_id', $userIds)
            ->orWhere('grant_key', 'like', "{$this->marker}%"))
        ->pluck('id');
    AccessCodeRedemption::query()->whereIn('program_access_id', $accessIds)->delete();
    SessionMentorReservation::query()->whereIn('program_access_id', $accessIds)->delete();
    AccessEvent::query()->whereIn('program_access_id', $accessIds)->delete();
    ProgramAccess::query()->whereIn('id', $accessIds)->delete();
    Order::query()->whereIn('user_id', $userIds)->delete();
    AccessCode::query()->when(
        isset($this->codeHint),
        fn ($query) => $query->where('code_hint', $this->codeHint),
        fn ($query) => $query->whereRaw('1 = 0'),
    )->delete();
    $programIds = Program::query()->where('slug', 'like', "{$this->marker}%")->pluck('id');
    $batchIds = ProgramBatch::query()->whereIn('program_id', $programIds)->pluck('id');
    $sessionIds = ProgramSession::query()->whereIn('program_batch_id', $batchIds)->pluck('id');
    SessionMentorAssignment::query()->whereIn('program_session_id', $sessionIds)->delete();
    ProgramSession::query()->whereIn('id', $sessionIds)->delete();
    ProgramBatch::query()->whereIn('id', $batchIds)->delete();
    Mentor::query()->whereIn('user_id', $userIds)->delete();
    Program::query()->where('slug', 'like', "{$this->marker}%")->delete();
    User::query()->where('email', 'like', "{$this->marker}%")->delete();
});

it('processes two simultaneous signed payment callbacks exactly once', function () {
    $program = Program::factory()->published()->create(['slug' => "{$this->marker}-payment-program"]);
    $user = User::factory()->create(['email' => "{$this->marker}-payment@example.test"]);
    $order = Order::query()->create([
        'user_id' => $user->id,
        'status' => 'pending',
        'total' => '125000.00',
        'currency' => 'IDR',
        'payment_reference' => "{$this->marker}-payment",
    ]);
    $item = $order->items()->create([
        'program_id' => $program->id,
        'program_name' => $program->name,
        'program_slug' => $program->slug,
        'unit_price' => '125000.00',
        'currency' => 'IDR',
        'quantity' => 1,
    ]);
    $connection = config('database.connections.pgsql');
    $task = ProgramAccessConcurrencyProbe::signedPaymentCallback(
        $order->payment_reference,
        $order->total,
        'concurrency-webhook-secret',
        $connection,
    );

    $results = Concurrency::driver('process')->run([$task, $task]);

    if (collect($results)->where('status', 200)->count() !== 2) {
        throw new RuntimeException(json_encode($results, JSON_THROW_ON_ERROR));
    }

    expect(collect($results)->where('status', 200))->toHaveCount(2)
        ->and($order->fresh()->status)->toBe('paid')
        ->and($order->fresh()->paid_at)->not->toBeNull();
    $access = ProgramAccess::query()
        ->where('grant_key', "payment:order:{$order->id}:item:{$item->id}")
        ->firstOrFail();
    expect(ProgramAccess::query()->where('grant_key', $access->grant_key)->count())->toBe(1)
        ->and(AccessEvent::query()->where('program_access_id', $access->id)->count())->toBe(1);
});

it('allows only one PostgreSQL grant to take the final Batch seat', function () {
    $program = Program::factory()->create(['slug' => "{$this->marker}-batch-program"]);
    $batch = ProgramBatch::factory()->for($program)->create(['capacity' => 1, 'enrolled_count' => 0]);
    $first = User::factory()->create(['email' => "{$this->marker}-batch-first@example.test"]);
    $second = User::factory()->create(['email' => "{$this->marker}-batch-second@example.test"]);
    $connection = config('database.connections.pgsql');

    $results = Concurrency::driver('process')->run([
        ProgramAccessConcurrencyProbe::grantBatchSeat($first->id, $program->id, $batch->id, "{$this->marker}:batch-first", $connection),
        ProgramAccessConcurrencyProbe::grantBatchSeat($second->id, $program->id, $batch->id, "{$this->marker}:batch-second", $connection),
    ]);

    if (collect($results)->where('ok', true)->count() !== 1) {
        throw new RuntimeException(json_encode($results, JSON_THROW_ON_ERROR));
    }

    expect(collect($results)->where('ok', true))->toHaveCount(1)
        ->and(collect($results)->where('code', 'BATCH_FULL'))->toHaveCount(1)
        ->and($batch->fresh()->enrolled_count)->toBe(1);
});

it('allows only one PostgreSQL reservation to take the final mentor slot', function () {
    $program = Program::factory()->create(['slug' => "{$this->marker}-mentor-program"]);
    $batch = ProgramBatch::factory()->for($program)->create(['capacity' => null]);
    $session = ProgramSession::factory()->for($batch, 'batch')->create([
        'mentor_assignment_mode' => 'STUDENT',
        'starts_at' => now()->addHour(),
        'ends_at' => now()->addDay(),
    ]);
    $mentorUser = User::factory()->create(['email' => "{$this->marker}-mentor@example.test"]);
    $mentor = Mentor::query()->create([
        'user_id' => $mentorUser->id,
        'specialization' => 'Concurrency testing',
        'is_active' => true,
    ]);
    $assignment = SessionMentorAssignment::query()->create([
        'program_session_id' => $session->id,
        'mentor_id' => $mentor->id,
        'capacity' => 1,
        'reserved_count' => 0,
        'status' => 'ACTIVE',
        'assigned_at' => now(),
    ]);
    $first = User::factory()->create(['email' => "{$this->marker}-slot-first@example.test"]);
    $second = User::factory()->create(['email' => "{$this->marker}-slot-second@example.test"]);
    $firstAccess = ProgramAccess::factory()->active()->for($first)->for($program)->for($batch, 'batch')->create();
    $secondAccess = ProgramAccess::factory()->active()->for($second)->for($program)->for($batch, 'batch')->create();
    $connection = config('database.connections.pgsql');

    $results = Concurrency::driver('process')->run([
        ProgramAccessConcurrencyProbe::reserveMentorSlot($firstAccess->id, $session->id, $assignment->id, "{$this->marker}:slot-first", $connection),
        ProgramAccessConcurrencyProbe::reserveMentorSlot($secondAccess->id, $session->id, $assignment->id, "{$this->marker}:slot-second", $connection),
    ]);

    if (collect($results)->where('ok', true)->count() !== 1) {
        throw new RuntimeException(json_encode($results, JSON_THROW_ON_ERROR));
    }

    expect(collect($results)->where('ok', true))->toHaveCount(1)
        ->and(collect($results)->where('code', 'MENTOR_SLOT_FULL'))->toHaveCount(1)
        ->and($assignment->fresh()->reserved_count)->toBe(1);
});

it('returns one grant when two PostgreSQL processes use the same grant key', function () {
    $user = User::factory()->create(['email' => "{$this->marker}-user@example.test"]);
    $program = Program::factory()->create(['slug' => "{$this->marker}-program"]);
    $grantKey = "{$this->marker}:same-grant";
    $userId = $user->id;
    $programId = $program->id;
    $sourceId = $this->marker;
    $connection = config('database.connections.pgsql');

    $task = ProgramAccessConcurrencyProbe::grant(
        $userId,
        $programId,
        $sourceId,
        $grantKey,
        $connection,
    );

    $results = Concurrency::driver('process')->run([$task, $task]);
    $ids = collect($results)->pluck('access_id')->filter()->all();

    if (collect($results)->where('ok', true)->count() !== 2) {
        throw new RuntimeException(json_encode($results, JSON_THROW_ON_ERROR));
    }

    expect(collect($results)->where('ok', true))->toHaveCount(2);
    expect(array_unique($ids))->toHaveCount(1);
    expect(ProgramAccess::query()->where('grant_key', $grantKey)->count())->toBe(1);
    $access = ProgramAccess::query()->where('grant_key', $grantKey)->firstOrFail();
    expect(AccessEvent::query()->where('program_access_id', $access->id)->count())->toBe(1);
});

it('allows only one user to redeem the final access-code quota', function () {
    $program = Program::factory()->published()->create(['slug' => "{$this->marker}-voucher-program"]);
    $firstUser = User::factory()->create(['email' => "{$this->marker}-first@example.test"]);
    $secondUser = User::factory()->create(['email' => "{$this->marker}-second@example.test"]);
    $plainCode = Str::upper("{$this->marker}-last-seat");
    $this->codeHint = substr(hash('sha256', $this->marker), 0, 16);
    $code = AccessCode::query()->create([
        'code_hash' => hash('sha256', $plainCode),
        'code_hint' => $this->codeHint,
        'type' => CodeType::EnrollmentCode,
        'program_id' => $program->id,
        'max_redemptions' => 1,
        'starts_at' => now()->subMinute(),
        'ends_at' => now()->addHour(),
        'is_active' => true,
    ]);

    $marker = $this->marker;
    $connection = config('database.connections.pgsql');
    $firstUserId = $firstUser->id;
    $secondUserId = $secondUser->id;
    $results = Concurrency::driver('process')->run([
        ProgramAccessConcurrencyProbe::redeem($firstUserId, $plainCode, "{$marker}:first", $connection),
        ProgramAccessConcurrencyProbe::redeem($secondUserId, $plainCode, "{$marker}:second", $connection),
    ]);

    if (collect($results)->where('ok', true)->count() !== 1) {
        throw new RuntimeException(json_encode($results, JSON_THROW_ON_ERROR));
    }

    expect(collect($results)->where('ok', true))->toHaveCount(1)
        ->and(collect($results)->where('code', 'ACCESS_CODE_QUOTA_EXHAUSTED'))->toHaveCount(1)
        ->and($code->fresh()->redemptions_count)->toBe(1);
    expect(AccessCodeRedemption::query()->where('access_code_id', $code->id)->count())->toBe(1);
});
