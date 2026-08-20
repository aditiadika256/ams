<?php

namespace App\Actions\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RecordDomainAudit
{
    public function handle(
        Model $entity,
        string $action,
        ?User $actor,
        ?string $reason = null,
        array $before = [],
        array $after = [],
        array $payload = [],
        ?string $correlationId = null,
    ): AuditLog {
        return AuditLog::query()->create([
            'user_id' => $actor?->id,
            'actor_snapshot' => $actor === null ? null : [
                'id' => $actor->id,
                'name' => $actor->name,
                'email' => $actor->email,
            ],
            'action' => $action,
            'entity' => $entity::class,
            'entity_id' => $entity->getKey(),
            'correlation_id' => $correlationId ?? (string) Str::uuid(),
            'reason' => $reason,
            'before_state' => $before,
            'after_state' => $after,
            'payload' => $payload,
        ]);
    }
}
