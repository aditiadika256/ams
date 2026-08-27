<?php

namespace App\Support\Access;

use App\Enums\AccessStatus;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\User;
use Illuminate\Support\Collection;

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
            || ! $this->hasValidParentChain($user, $access, true)) {
            return false;
        }

        return $this->hasAvailableComponent($access, $componentCode);
    }

    /**
     * @param  Collection<int, ProgramComponent>  $components
     * @return Collection<int, ProgramComponent>
     */
    public function readableComponents(User $user, ProgramAccess $access, Collection $components): Collection
    {
        if ($access->status === AccessStatus::Active) {
            $canRead = $access->user_id === $user->id
                && $this->isUsable($access)
                && $this->hasValidParentChain($user, $access, false);
        } else {
            $canRead = $access->user_id === $user->id
                && $access->status === AccessStatus::Completed
                && $this->hasValidParentChain($user, $access, true);
        }

        if (! $canRead) {
            return $components->take(0);
        }

        return $components->filter(fn (ProgramComponent $component): bool => $component->is_enabled
            && $component->definition !== null
            && ! $component->definition->trashed()
            && $component->definition->is_available)->values();
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
