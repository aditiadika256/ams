<?php

namespace App\Support\Access;

use App\Exceptions\DomainAuthorizationException;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\User;

class AssessmentAccessAuthorizer
{
    public function __construct(private readonly ComponentAccessGate $componentGate) {}

    public function authorize(User $user, ProgramAccess $access, int $packageId): void
    {
        if (! in_array($packageId, $this->authorizedPackageIds($user, $access), true)) {
            throw $this->denied($access);
        }
    }

    public function authorizedPackageIds(User $user, ProgramAccess $access): array
    {
        $component = ProgramComponent::query()
            ->where('program_id', $access->program_id)
            ->where('is_enabled', true)
            ->whereHas('definition', fn ($definition) => $definition
                ->where('code', 'assessment')
                ->where('is_available', true))
            ->first();
        $configuration = $component?->configuration ?? [];
        $allowedPackageIds = array_map('intval', $configuration['exam_package_ids'] ?? []);

        if (! $this->componentGate->allows($user, $access, 'assessment')) {
            throw $this->denied($access);
        }

        return $allowedPackageIds;
    }

    private function denied(ProgramAccess $access): DomainAuthorizationException
    {
        return new DomainAuthorizationException(
            'COMPONENT_ACCESS_DENIED',
            'Paket assessment tidak tersedia untuk enrollment ini.',
            ['program_access_id' => $access->id, 'component' => 'assessment'],
        );
    }
}
