<?php

use App\Enums\CodeType;
use App\Models\AccessCode;
use App\Models\AccessCodeRedemption;
use App\Models\AccessEvent;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\User;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\ProgramAccessConcurrencyProbe;

beforeEach(function (): void {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Concurrency suite requires PostgreSQL.');
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
    AccessEvent::query()->whereIn('program_access_id', $accessIds)->delete();
    ProgramAccess::query()->whereIn('id', $accessIds)->delete();
    AccessCode::query()->when(
        isset($this->codeHint),
        fn ($query) => $query->where('code_hint', $this->codeHint),
        fn ($query) => $query->whereRaw('1 = 0'),
    )->delete();
    Program::query()->where('slug', 'like', "{$this->marker}%")->delete();
    User::query()->where('email', 'like', "{$this->marker}%")->delete();
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
