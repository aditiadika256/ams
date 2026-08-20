<?php

namespace Tests\Support;

use App\Actions\Access\GrantProgramAccess;
use App\Actions\Access\RedeemAccessCode;
use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Enums\CodeType;
use App\Exceptions\DomainConflictException;
use App\Models\User;
use Closure;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProgramAccessConcurrencyProbe
{
    public static function grant(
        int $userId,
        int $programId,
        string $sourceId,
        string $grantKey,
        array $connection,
    ): Closure {
        return static function () use ($userId, $programId, $sourceId, $grantKey, $connection): array {
            try {
                self::connect($connection);
                $access = app(GrantProgramAccess::class)->handle(
                    new AccessGrantData(
                        userId: $userId,
                        programId: $programId,
                        source: AccessSource::AdminGrant,
                        sourceId: $sourceId,
                        grantKey: $grantKey,
                    ),
                    null,
                    'PostgreSQL concurrency test.',
                );

                return ['ok' => true, 'access_id' => $access->id];
            } catch (Throwable $exception) {
                return ['ok' => false, 'exception' => $exception::class, 'message' => $exception->getMessage()];
            }
        };
    }

    public static function redeem(
        int $userId,
        string $plainCode,
        string $idempotencyKey,
        array $connection,
    ): Closure {
        return static function () use ($userId, $plainCode, $idempotencyKey, $connection): array {
            try {
                self::connect($connection);
                [$access] = app(RedeemAccessCode::class)->handle(
                    User::query()->findOrFail($userId),
                    $plainCode,
                    $idempotencyKey,
                    CodeType::EnrollmentCode,
                );

                return ['ok' => true, 'access_id' => $access->id];
            } catch (DomainConflictException $exception) {
                return ['ok' => false, 'code' => $exception->errorCode];
            } catch (Throwable $exception) {
                return ['ok' => false, 'exception' => $exception::class, 'message' => $exception->getMessage()];
            }
        };
    }

    private static function connect(array $connection): void
    {
        config([
            'database.default' => 'pgsql',
            'database.connections.pgsql' => $connection,
        ]);
        DB::purge('pgsql');
        DB::setDefaultConnection('pgsql');
    }
}
