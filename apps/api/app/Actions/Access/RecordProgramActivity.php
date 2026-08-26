<?php

namespace App\Actions\Access;

use App\Enums\AccessStatus;
use App\Exceptions\DomainConflictException;
use App\Models\ProgramAccess;
use App\Models\ProgramAccessActivity;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RecordProgramActivity
{
    public function __construct(
        private readonly CalculateProgramProgress $progress,
        private readonly EvaluateProgramCompletion $completion,
    ) {}

    public function handle(
        ProgramAccess $access,
        string $componentCode,
        string $activityType,
        string $activityKey,
        ?User $actor = null,
        ?string $sourceType = null,
        ?string $sourceId = null,
        array $metadata = [],
    ): ProgramAccess {
        return DB::transaction(function () use (
            $access, $componentCode, $activityType, $activityKey, $actor, $sourceType, $sourceId, $metadata,
        ): ProgramAccess {
            $access = ProgramAccess::query()->lockForUpdate()->findOrFail($access->id);
            $existing = ProgramAccessActivity::query()
                ->where('program_access_id', $access->id)
                ->where('component_code', $componentCode)
                ->where('activity_key', $activityKey)
                ->first();

            if ($existing !== null) {
                return $access;
            }

            if ($access->status !== AccessStatus::Active) {
                throw new DomainConflictException('ACCESS_ACTIVITY_NOT_ALLOWED', 'Status akses tidak menerima aktivitas baru.');
            }

            $available = $access->program()->whereHas('components', fn ($query) => $query
                ->where('is_enabled', true)
                ->whereHas('definition', fn ($definition) => $definition
                    ->where('code', $componentCode)
                    ->where('is_available', true)))
                ->exists();

            if (! $available) {
                throw new DomainConflictException('COMPONENT_ACCESS_DENIED', 'Komponen tidak tersedia untuk akses ini.');
            }

            ProgramAccessActivity::query()->create([
                'program_access_id' => $access->id,
                'component_code' => $componentCode,
                'activity_type' => $activityType,
                'activity_key' => $activityKey,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'metadata' => $metadata,
                'completed_at' => now(),
            ]);

            $this->progress->handle($access);

            return $this->completion->handle($access, $actor);
        });
    }
}
