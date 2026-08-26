<?php

namespace App\Actions\Access;

use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Enums\BatchStatus;
use App\Enums\ProgramStatus;
use App\Enums\ProgramVisibility;
use App\Exceptions\DomainValidationException;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EnrollFreeProgram
{
    public function __construct(
        private readonly GrantProgramAccess $grant,
        private readonly GrantCollectionAccesses $grantCollection,
    ) {}

    public function handle(User $user, int $programId, ?int $batchId): array
    {
        return DB::transaction(function () use ($user, $programId, $batchId): array {
            $program = Program::query()->lockForUpdate()->findOrFail($programId);
            $batch = $batchId === null
                ? null
                : ProgramBatch::query()->lockForUpdate()->findOrFail($batchId);

            if ($program->status !== ProgramStatus::Published
                || $program->visibility === ProgramVisibility::Private
                || $program->archived_at !== null
                || ($batch !== null && ($batch->program_id !== $program->id || $batch->status !== BatchStatus::Open))) {
                throw new DomainValidationException(
                    'PROGRAM_NOT_ACQUIRABLE',
                    'Program atau Batch tidak tersedia untuk enrollment.',
                );
            }

            $price = $batch?->price_override ?? $program->base_price;
            if ($price !== '0.00') {
                throw new DomainValidationException('PROGRAM_NOT_FREE', 'Program ini bukan Program gratis.');
            }

            $grantKey = "free:user:{$user->id}:program:{$program->id}:batch:".($batch?->id ?? 'none');
            $wasExisting = ProgramAccess::query()->where('grant_key', $grantKey)->exists();
            $access = $this->grant->handle(new AccessGrantData(
                userId: $user->id,
                programId: $program->id,
                batchId: $batch?->id,
                source: AccessSource::FreeEnrollment,
                sourceId: (string) $program->id,
                grantKey: $grantKey,
            ), $user, 'Enrollment Program gratis.');

            if (! $wasExisting && $program->outgoingRelations()->exists()) {
                $this->grantCollection->handle($access, $user, 'Grant child Program gratis collection.');
            }

            return [$access, $wasExisting];
        });
    }
}
