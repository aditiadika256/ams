<?php

namespace App\Support\Access;

use App\Exceptions\DomainAuthorizationException;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\User;

class AssessmentAccessAuthorizer
{
    public function __construct(private readonly ComponentAccessGate $componentGate) {}

    public function authorize(User $user, ProgramAccess $access, int $packageId, bool $readOnly = false): void
    {
        if (! in_array($packageId, $this->authorizedPackageIds($user, $access, $readOnly), true)) {
            throw $this->denied($access);
        }
    }

    public function authorizedPackageIds(User $user, ProgramAccess $access, bool $readOnly = false): array
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

        $allowed = $readOnly
            ? $this->componentGate->allowsRead($user, $access, 'assessment')
            : $this->componentGate->allows($user, $access, 'assessment');

        if (! $allowed) {
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
