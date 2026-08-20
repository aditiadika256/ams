<?php

namespace App\Actions\Access;

use App\Enums\AccessStatus;
use App\Exceptions\DomainConflictException;
use App\Exceptions\InvalidStateTransitionException;
use App\Models\ProgramAccess;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransitionProgramAccess
{
    private const TRANSITIONS = [
        'WAITING' => ['ACTIVE', 'EXPIRED', 'REVOKED'],
        'ACTIVE' => ['COMPLETED', 'EXPIRED', 'SUSPENDED', 'REVOKED'],
        'SUSPENDED' => ['ACTIVE', 'REVOKED'],
        'COMPLETED' => [],
        'EXPIRED' => [],
        'REVOKED' => [],
    ];

    public function __construct(private readonly RecordAccessEvent $events) {}

    public function transition(
        ProgramAccess $access,
        AccessStatus $target,
        ?User $actor,
        string $reason,
    ): ProgramAccess {
        return DB::transaction(function () use ($access, $target, $actor, $reason): ProgramAccess {
            $access = ProgramAccess::query()->lockForUpdate()->findOrFail($access->id);
            $from = $access->status;

            if (! in_array($target->value, self::TRANSITIONS[$from->value], true)) {
                throw new InvalidStateTransitionException('program_access', $from->value, $target->value);
            }

            if ($target === AccessStatus::Active
                && (($access->starts_at !== null && $access->starts_at->isFuture())
                    || ($access->ends_at !== null && ! $access->ends_at->isFuture()))) {
                throw new DomainConflictException(
                    'ACCESS_PERIOD_INACTIVE',
                    'Akses belum atau tidak lagi berada dalam periode aktif.',
                );
            }

            $before = $access->getAttributes();
            $changes = ['status' => $target];
            $action = 'access.'.strtolower($target->value);

            if ($target === AccessStatus::Active) {
                $changes['activated_at'] = $access->activated_at ?? now();
                $changes['suspended_at'] = null;
                $action = $from === AccessStatus::Suspended ? 'access.restored' : 'access.activated';
            } elseif ($target === AccessStatus::Completed) {
                $changes['completed_at'] = now();
            } elseif ($target === AccessStatus::Suspended) {
                $changes['suspended_at'] = now();
            } elseif ($target === AccessStatus::Revoked) {
                $changes['revoked_at'] = now();
            }

            $access->update($changes);
            $this->events->handle(
                $access,
                $action,
                $actor,
                $reason,
                $before,
                $access->getAttributes(),
                correlationId: (string) Str::uuid(),
            );

            return $access;
        });
    }

    public function extend(
        ProgramAccess $access,
        CarbonInterface $endsAt,
        ?User $actor,
        string $reason,
    ): ProgramAccess {
        return DB::transaction(function () use ($access, $endsAt, $actor, $reason): ProgramAccess {
            $access = ProgramAccess::query()->lockForUpdate()->findOrFail($access->id);

            if ($access->status === AccessStatus::Revoked
                || $endsAt->isPast()
                || ($access->starts_at !== null && $endsAt->lessThanOrEqualTo($access->starts_at))
                || ($access->ends_at !== null && $endsAt->lessThanOrEqualTo($access->ends_at))) {
                throw new DomainConflictException('ACCESS_EXTENSION_INVALID', 'Perpanjangan akses tidak valid.');
            }

            $before = $access->getAttributes();
            $access->update(['ends_at' => $endsAt]);
            $this->events->handle(
                $access,
                'access.extended',
                $actor,
                $reason,
                $before,
                $access->getAttributes(),
                correlationId: (string) Str::uuid(),
            );

            return $access;
        });
    }
}
