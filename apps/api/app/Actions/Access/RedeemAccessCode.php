<?php

namespace App\Actions\Access;

use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Enums\BatchStatus;
use App\Enums\CodeType;
use App\Enums\ProgramStatus;
use App\Exceptions\DomainConflictException;
use App\Exceptions\DomainValidationException;
use App\Models\AccessCode;
use App\Models\AccessCodeRedemption;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RedeemAccessCode
{
    public function __construct(
        private readonly GrantProgramAccess $grant,
        private readonly GrantCollectionAccesses $grantCollection,
    ) {}

    public function handle(
        User $user,
        string $plainCode,
        string $idempotencyKey,
        CodeType $expectedType,
    ): array {
        return DB::transaction(function () use ($user, $plainCode, $idempotencyKey, $expectedType): array {
            $code = AccessCode::query()
                ->where('code_hash', hash('sha256', $plainCode))
                ->lockForUpdate()
                ->first();

            if ($code === null) {
                throw new DomainValidationException('ACCESS_CODE_INVALID', 'Kode tidak valid atau sudah kedaluwarsa.');
            }

            $existing = AccessCodeRedemption::query()
                ->where('access_code_id', $code->id)
                ->where('user_id', $user->id)
                ->first();
            if ($existing !== null) {
                if ($existing->idempotency_key !== $idempotencyKey) {
                    throw new DomainConflictException('ACCESS_CODE_ALREADY_REDEEMED', 'Kode sudah pernah digunakan user ini.');
                }

                return [$existing->access()->firstOrFail(), true];
            }

            if (! $code->is_active || $code->type !== $expectedType
                || ($code->starts_at !== null && $code->starts_at->isFuture())
                || ($code->ends_at !== null && ! $code->ends_at->isFuture())) {
                throw new DomainValidationException('ACCESS_CODE_INVALID', 'Kode tidak valid atau sudah kedaluwarsa.');
            }

            $program = $code->program()->lockForUpdate()->firstOrFail();
            if ($program->status !== ProgramStatus::Published || $program->archived_at !== null) {
                throw new DomainValidationException(
                    'PROGRAM_NOT_AVAILABLE',
                    'Program tidak tersedia untuk akuisisi baru.',
                );
            }

            if ($code->program_batch_id !== null) {
                $batch = $code->batch()->lockForUpdate()->firstOrFail();
                if ($batch->program_id !== $program->id || $batch->status !== BatchStatus::Open) {
                    throw new DomainValidationException(
                        'PROGRAM_BATCH_NOT_AVAILABLE',
                        'Batch tidak tersedia untuk akuisisi baru.',
                    );
                }
            }

            if ($code->max_redemptions !== null && $code->redemptions_count >= $code->max_redemptions) {
                throw new DomainConflictException(
                    'ACCESS_CODE_QUOTA_EXHAUSTED',
                    'Kuota penggunaan kode sudah habis.',
                );
            }

            $this->validateEligibility($code, $user);
            $correlationId = (string) Str::uuid();
            $access = $this->grant->handle(new AccessGrantData(
                userId: $user->id,
                programId: $code->program_id,
                batchId: $code->program_batch_id,
                source: $code->type === CodeType::Voucher ? AccessSource::Voucher : AccessSource::EnrollmentCode,
                sourceId: (string) $code->id,
                grantKey: "code:{$code->id}:user:{$user->id}",
                correlationId: $correlationId,
            ), $user, 'Redeem access code.');

            AccessCodeRedemption::query()->create([
                'access_code_id' => $code->id,
                'user_id' => $user->id,
                'program_access_id' => $access->id,
                'idempotency_key' => $idempotencyKey,
                'correlation_id' => $correlationId,
                'redeemed_at' => now(),
            ]);
            $code->increment('redemptions_count');

            if ($code->program()->whereHas('outgoingRelations')->exists()) {
                $this->grantCollection->handle($access, $user, 'Grant child dari access code.');
            }

            return [$access, false];
        });
    }

    private function validateEligibility(AccessCode $code, User $user): void
    {
        $eligibility = $code->eligibility ?? [];
        $allowedUsers = $eligibility['allowed_user_ids'] ?? [];

        if ($allowedUsers !== [] && ! in_array($user->id, $allowedUsers, true)) {
            throw new DomainValidationException('ACCESS_CODE_NOT_ELIGIBLE', 'User tidak memenuhi syarat kode.');
        }
    }
}
