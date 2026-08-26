<?php

namespace App\Actions\Access;

use App\Models\AccessEvent;
use App\Models\ProgramAccess;
use App\Models\User;
use Illuminate\Support\Str;

class RecordAccessEvent
{
    public function handle(
        ProgramAccess $access,
        string $action,
        ?User $actor,
        ?string $reason = null,
        array $before = [],
        array $after = [],
        array $metadata = [],
        ?string $correlationId = null,
    ): AccessEvent {
        return AccessEvent::query()->create([
            'program_access_id' => $access->id,
            'actor_user_id' => $actor?->id,
            'actor_snapshot' => $actor === null ? null : [
                'id' => $actor->id,
                'name' => $actor->name,
                'email' => $actor->email,
            ],
            'action' => $action,
            'reason' => $reason,
            'correlation_id' => $correlationId ?? (string) Str::uuid(),
            'before_state' => $before,
            'after_state' => $after,
            'metadata' => $metadata,
        ]);
    }
}
