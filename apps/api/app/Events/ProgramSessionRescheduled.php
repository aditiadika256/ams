<?php

namespace App\Events;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProgramSessionRescheduled implements ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $sessionId,
        public readonly string $correlationId,
        public readonly array $recipients,
        public readonly array $snapshot,
        public readonly string $occurredAt,
    ) {}
}
