<?php

namespace App\Listeners;

use App\Events\ProgramSessionRescheduled;
use App\Models\ProgramSessionUpdate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProjectProgramSessionReschedule implements ShouldQueue
{
    public int $tries = 4;

    public int $timeout = 30;

    public function backoff(): array
    {
        return [1, 5, 30];
    }

    public function handle(ProgramSessionRescheduled $event): void
    {
        $now = now();
        $rows = collect($event->recipients)->map(fn (array $recipient): array => [
            'recipient_user_id' => $recipient['user_id'],
            'program_access_id' => $recipient['program_access_id'] ?? null,
            'mentor_id' => $recipient['mentor_id'] ?? null,
            'program_session_id' => $event->sessionId,
            'recipient_key' => 'user:'.$recipient['user_id'],
            'type' => 'SESSION_RESCHEDULED',
            'correlation_id' => $event->correlationId,
            'payload' => json_encode($event->snapshot, JSON_THROW_ON_ERROR),
            'occurred_at' => $event->occurredAt,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        if ($rows !== []) {
            ProgramSessionUpdate::query()->insertOrIgnore($rows);
        }
    }

    public function failed(ProgramSessionRescheduled $event, Throwable $exception): void
    {
        Log::error('Program Session reschedule projection failed.', [
            'session_id' => $event->sessionId,
            'correlation_id' => $event->correlationId,
            'exception' => $exception::class,
        ]);
    }
}
