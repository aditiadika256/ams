<?php

namespace App\Support\Access;

use App\Enums\AccessStatus;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\User;

class ComponentAccessGate
{
    public function allows(User $user, ProgramAccess $access, string $componentCode): bool
    {
        if ($access->user_id !== $user->id
            || ! $this->isUsable($access)
            || ! $this->hasValidParentChain($user, $access, false)) {
            return false;
        }

        return $this->hasAvailableComponent($access, $componentCode);
    }

    public function allowsRead(User $user, ProgramAccess $access, string $componentCode): bool
    {
        if ($access->status === AccessStatus::Active) {
            return $this->allows($user, $access, $componentCode);
        }

        if ($access->user_id !== $user->id
            || $access->status !== AccessStatus::Completed
            || ! in_array($componentCode, ['material', 'assessment', 'certificate'], true)
            || ! $this->hasValidParentChain($user, $access, true)) {
            return false;
        }

        return $this->hasAvailableComponent($access, $componentCode);
    }

    private function hasAvailableComponent(ProgramAccess $access, string $componentCode): bool
    {
        return ProgramComponent::query()
            ->where('program_id', $access->program_id)
            ->where('is_enabled', true)
            ->whereHas('definition', fn ($query) => $query
                ->where('code', $componentCode)
                ->where('is_available', true))
            ->exists();
    }

    private function hasValidParentChain(User $user, ProgramAccess $access, bool $allowCompleted): bool
    {
        $parentId = $access->parent_program_access_id;
        $visited = [$access->id];

        while ($parentId !== null) {
            if (in_array($parentId, $visited, true)) {
                return false;
            }

            $visited[] = $parentId;
            $parent = ProgramAccess::query()->find($parentId);
            $parentIsEffective = $parent !== null
                && $parent->user_id === $user->id
                && ($this->isUsable($parent) || ($allowCompleted && $parent->status === AccessStatus::Completed));

            if (! $parentIsEffective) {
                return false;
            }

            $parentId = $parent->parent_program_access_id;
        }

        return true;
    }

    private function isUsable(ProgramAccess $access): bool
    {
        return $access->status === AccessStatus::Active
            && ($access->starts_at === null || $access->starts_at->isPast() || $access->starts_at->isCurrentSecond())
            && ($access->ends_at === null || $access->ends_at->isFuture());
    }
}
