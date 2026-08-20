<?php

namespace App\Domain\Admin;

use App\Actions\Access\GrantCollectionAccesses;
use App\Actions\Access\GrantProgramAccess;
use App\Actions\Access\TransitionProgramAccess;
use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Enums\AccessStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramAccessGrantRequest;
use App\Http\Requests\Admin\ProgramAccessTransitionRequest;
use App\Http\Resources\ProgramAccessResource;
use App\Models\ProgramAccess;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ProgramAccessController extends Controller
{
    public function grant(
        ProgramAccessGrantRequest $request,
        GrantProgramAccess $action,
        GrantCollectionAccesses $grantCollection,
    ): JsonResponse {
        $data = $request->validated();
        $grantKey = 'admin:'.$data['idempotency_key'];
        $wasExisting = ProgramAccess::query()->where('grant_key', $grantKey)->exists();
        $access = $action->handle(new AccessGrantData(
            userId: $data['user_id'],
            programId: $data['program_id'],
            batchId: $data['program_batch_id'] ?? null,
            source: AccessSource::AdminGrant,
            sourceId: $data['idempotency_key'],
            grantKey: $grantKey,
            startsAt: isset($data['starts_at']) ? Carbon::parse($data['starts_at']) : null,
            endsAt: isset($data['ends_at']) ? Carbon::parse($data['ends_at']) : null,
            metadata: $data['metadata'] ?? [],
            allowDuplicate: $data['allow_repeat'] ?? false,
        ), $request->user(), $data['reason']);

        if (! $wasExisting && $access->program()->whereHas('outgoingRelations')->exists()) {
            $grantCollection->handle($access, $request->user(), 'Grant child dari admin collection.');
        }

        return $wasExisting
            ? $this->successResponse(new ProgramAccessResource($access), 'Access grant already exists')
            : $this->createdResponse(new ProgramAccessResource($access), 'Access granted successfully');
    }

    public function activate(
        ProgramAccessTransitionRequest $request,
        ProgramAccess $programAccess,
        TransitionProgramAccess $action,
    ): JsonResponse {
        Gate::authorize('activate', $programAccess);

        return $this->transition($request, $programAccess, AccessStatus::Active, $action);
    }

    public function suspend(
        ProgramAccessTransitionRequest $request,
        ProgramAccess $programAccess,
        TransitionProgramAccess $action,
    ): JsonResponse {
        Gate::authorize('suspend', $programAccess);

        return $this->transition($request, $programAccess, AccessStatus::Suspended, $action);
    }

    public function restore(
        ProgramAccessTransitionRequest $request,
        ProgramAccess $programAccess,
        TransitionProgramAccess $action,
    ): JsonResponse {
        Gate::authorize('restore', $programAccess);

        return $this->transition($request, $programAccess, AccessStatus::Active, $action);
    }

    public function revoke(
        ProgramAccessTransitionRequest $request,
        ProgramAccess $programAccess,
        TransitionProgramAccess $action,
    ): JsonResponse {
        Gate::authorize('revoke', $programAccess);

        return $this->transition($request, $programAccess, AccessStatus::Revoked, $action);
    }

    public function extend(
        ProgramAccessTransitionRequest $request,
        ProgramAccess $programAccess,
        TransitionProgramAccess $action,
    ): JsonResponse {
        Gate::authorize('extend', $programAccess);
        $data = $request->validated();
        $access = $action->extend(
            $programAccess,
            Carbon::parse($data['ends_at']),
            $request->user(),
            $data['reason'],
        );

        return $this->successResponse(new ProgramAccessResource($access), 'Access extended successfully');
    }

    private function transition(
        ProgramAccessTransitionRequest $request,
        ProgramAccess $access,
        AccessStatus $target,
        TransitionProgramAccess $action,
    ): JsonResponse {
        $access = $action->transition(
            $access,
            $target,
            $request->user(),
            $request->validated('reason'),
        );

        return $this->successResponse(new ProgramAccessResource($access), 'Access status updated successfully');
    }
}
