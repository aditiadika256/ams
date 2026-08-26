<?php

namespace App\Actions\Access;

use App\Data\AccessGrantData;
use App\Enums\AccessStatus;
use App\Exceptions\DomainConflictException;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GrantProgramAccess
{
    public function __construct(private readonly RecordAccessEvent $events) {}

    public function handle(AccessGrantData $data, ?User $actor, string $reason): ProgramAccess
    {
        try {
            return DB::transaction(fn (): ProgramAccess => $this->grant($data, $actor, $reason));
        } catch (QueryException $exception) {
            $existing = ProgramAccess::query()->where('grant_key', $data->grantKey)->first();

            if ($existing !== null) {
                return $this->resolveRetry($existing, $data);
            }

            throw $exception;
        }
    }

    private function grant(AccessGrantData $data, ?User $actor, string $reason): ProgramAccess
    {
        User::query()->lockForUpdate()->findOrFail($data->userId);
        Program::query()->findOrFail($data->programId);

        $existing = ProgramAccess::query()->where('grant_key', $data->grantKey)->first();
        if ($existing !== null) {
            return $this->resolveRetry($existing, $data);
        }

        $batch = $this->lockBatch($data);
        [$startsAt, $endsAt] = $this->resolvePeriod($data, $batch);
        $this->validatePeriod($startsAt, $endsAt);
        $this->guardParentAccess($data);
        $this->guardDuplicateEnrollment($data, $batch);

        if ($batch !== null && $batch->capacity !== null) {
            if ($batch->enrolled_count >= $batch->capacity) {
                throw new DomainConflictException(
                    'BATCH_FULL',
                    'Kapasitas Batch sudah penuh.',
                    ['program_batch_id' => $batch->id],
                );
            }

            $batch->increment('enrolled_count');
        }

        $status = $startsAt !== null && $startsAt->isFuture()
            ? AccessStatus::Waiting
            : AccessStatus::Active;
        $correlationId = $data->correlationId ?? (string) Str::uuid();
        $access = ProgramAccess::query()->create([
            'user_id' => $data->userId,
            'program_id' => $data->programId,
            'program_batch_id' => $data->batchId,
            'parent_program_access_id' => $data->parentAccessId,
            'source_type' => $data->source,
            'source_id' => $data->sourceId,
            'grant_key' => $data->grantKey,
            'status' => $status,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'activated_at' => $status === AccessStatus::Active ? now() : null,
            'metadata' => $data->metadata,
        ]);

        $this->events->handle(
            $access,
            'access.granted',
            $actor,
            $reason,
            after: $access->getAttributes(),
            metadata: ['source_type' => $data->source->value, 'source_id' => $data->sourceId],
            correlationId: $correlationId,
        );

        return $access->load('events');
    }

    private function lockBatch(AccessGrantData $data): ?ProgramBatch
    {
        if ($data->batchId === null) {
            return null;
        }

        $batch = ProgramBatch::query()->lockForUpdate()->findOrFail($data->batchId);

        if ($batch->program_id !== $data->programId) {
            throw new DomainConflictException(
                'BATCH_PROGRAM_MISMATCH',
                'Batch bukan milik Program yang dipilih.',
                ['program_id' => $data->programId, 'program_batch_id' => $batch->id],
            );
        }

        return $batch;
    }

    private function resolvePeriod(AccessGrantData $data, ?ProgramBatch $batch): array
    {
        return [
            $data->startsAt ?? $batch?->starts_at,
            $data->endsAt ?? $batch?->ends_at,
        ];
    }

    private function validatePeriod(?CarbonInterface $startsAt, ?CarbonInterface $endsAt): void
    {
        if (($startsAt !== null && $endsAt !== null && $startsAt->greaterThanOrEqualTo($endsAt))
            || ($endsAt !== null && $endsAt->isPast())) {
            throw new DomainConflictException('ACCESS_PERIOD_INVALID', 'Periode akses tidak valid.');
        }
    }

    private function guardParentAccess(AccessGrantData $data): void
    {
        if ($data->parentAccessId === null) {
            return;
        }

        $parent = ProgramAccess::query()->lockForUpdate()->findOrFail($data->parentAccessId);

        if ($parent->user_id !== $data->userId) {
            throw new DomainConflictException(
                'ACCESS_PARENT_INVALID',
                'Parent access harus dimiliki user yang sama.',
                ['parent_program_access_id' => $parent->id],
            );
        }
    }

    private function guardDuplicateEnrollment(AccessGrantData $data, ?ProgramBatch $batch): void
    {
        if ($data->allowDuplicate) {
            return;
        }

        $exists = ProgramAccess::query()
            ->where('user_id', $data->userId)
            ->where('program_id', $data->programId)
            ->when(
                $data->batchId === null,
                fn ($query) => $query->whereNull('program_batch_id'),
                fn ($query) => $query->where('program_batch_id', $data->batchId),
            )
            ->whereIn('status', [
                AccessStatus::Waiting->value,
                AccessStatus::Active->value,
                AccessStatus::Suspended->value,
            ])
            ->exists();

        if ($exists) {
            throw new DomainConflictException(
                'ACCESS_ALREADY_EXISTS',
                'User sudah memiliki enrollment aktif untuk Program dan Batch tersebut.',
            );
        }

        $hasTerminalEnrollment = ProgramAccess::query()
            ->where('user_id', $data->userId)
            ->where('program_id', $data->programId)
            ->when(
                $data->batchId === null,
                fn ($query) => $query->whereNull('program_batch_id'),
                fn ($query) => $query->where('program_batch_id', $data->batchId),
            )
            ->whereIn('status', [AccessStatus::Completed->value, AccessStatus::Expired->value])
            ->exists();

        if ($hasTerminalEnrollment && ! ($batch?->allow_retakes ?? false)) {
            throw new DomainConflictException(
                'RETAKE_NOT_ALLOWED',
                'Batch tidak mengizinkan repeat enrollment.',
            );
        }
    }

    private function resolveRetry(ProgramAccess $existing, AccessGrantData $data): ProgramAccess
    {
        $matches = $existing->user_id === $data->userId
            && $existing->program_id === $data->programId
            && $existing->program_batch_id === $data->batchId
            && $existing->parent_program_access_id === $data->parentAccessId
            && $existing->source_type === $data->source
            && $existing->source_id === $data->sourceId;

        if (! $matches) {
            throw new DomainConflictException(
                'GRANT_KEY_CONFLICT',
                'Grant key sudah digunakan untuk semantic source yang berbeda.',
                ['grant_key' => $data->grantKey],
            );
        }

        return $existing->loadMissing('events');
    }
}
