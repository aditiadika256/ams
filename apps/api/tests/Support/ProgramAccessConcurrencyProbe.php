<?php

namespace Tests\Support;

use App\Actions\Access\GrantProgramAccess;
use App\Actions\Access\RedeemAccessCode;
use App\Actions\Programs\ReserveSessionMentor;
use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Enums\CodeType;
use App\Exceptions\DomainConflictException;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProgramAccessConcurrencyProbe
{
    public static function signedPaymentCallback(
        string $paymentReference,
        string $grossAmount,
        string $secret,
        array $connection,
    ): Closure {
        return static function () use ($paymentReference, $grossAmount, $secret, $connection): array {
            try {
                self::connect($connection);
                config(['services.payment.webhook_secret' => $secret]);
                $statusCode = '200';
                $payload = [
                    'order_id' => $paymentReference,
                    'status_code' => $statusCode,
                    'gross_amount' => $grossAmount,
                    'transaction_status' => 'settlement',
                    'fraud_status' => 'accept',
                    'signature_key' => hash('sha512', $paymentReference.$statusCode.$grossAmount.$secret),
                ];
                $request = Request::create(
                    '/api/v1/payments/webhook',
                    'POST',
                    server: ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json'],
                    content: json_encode($payload, JSON_THROW_ON_ERROR),
                );
                $response = app(Kernel::class)->handle($request);

                return ['status' => $response->getStatusCode(), 'body' => $response->getContent()];
            } catch (Throwable $exception) {
                return ['status' => 500, 'exception' => $exception::class, 'message' => $exception->getMessage()];
            }
        };
    }

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

    public static function grantBatchSeat(
        int $userId,
        int $programId,
        int $batchId,
        string $grantKey,
        array $connection,
    ): Closure {
        return static function () use ($userId, $programId, $batchId, $grantKey, $connection): array {
            try {
                self::connect($connection);
                $access = app(GrantProgramAccess::class)->handle(
                    new AccessGrantData(
                        userId: $userId,
                        programId: $programId,
                        batchId: $batchId,
                        source: AccessSource::AdminGrant,
                        sourceId: $grantKey,
                        grantKey: $grantKey,
                    ),
                    null,
                    'PostgreSQL final Batch seat test.',
                );

                return ['ok' => true, 'access_id' => $access->id];
            } catch (DomainConflictException $exception) {
                return ['ok' => false, 'code' => $exception->errorCode];
            } catch (Throwable $exception) {
                return ['ok' => false, 'exception' => $exception::class, 'message' => $exception->getMessage()];
            }
        };
    }

    public static function reserveMentorSlot(
        int $accessId,
        int $sessionId,
        int $assignmentId,
        string $idempotencyKey,
        array $connection,
    ): Closure {
        return static function () use ($accessId, $sessionId, $assignmentId, $idempotencyKey, $connection): array {
            try {
                self::connect($connection);
                $reservation = app(ReserveSessionMentor::class)->handle(
                    \App\Models\ProgramAccess::query()->findOrFail($accessId),
                    \App\Models\ProgramSession::query()->findOrFail($sessionId),
                    $assignmentId,
                    $idempotencyKey,
                );

                return ['ok' => true, 'reservation_id' => $reservation->id];
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
