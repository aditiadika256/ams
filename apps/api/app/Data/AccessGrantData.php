<?php

namespace App\Data;

use App\Enums\AccessSource;
use Carbon\CarbonInterface;

class AccessGrantData
{
    public function __construct(
        public readonly int $userId,
        public readonly int $programId,
        public readonly AccessSource $source,
        public readonly string $grantKey,
        public readonly ?int $batchId = null,
        public readonly ?string $sourceId = null,
        public readonly ?int $parentAccessId = null,
        public readonly ?CarbonInterface $startsAt = null,
        public readonly ?CarbonInterface $endsAt = null,
        public readonly array $metadata = [],
        public readonly bool $allowDuplicate = false,
        public readonly ?string $correlationId = null,
    ) {}
}
