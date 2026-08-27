<?php

namespace App\Domain\Workspace;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceIndexRequest;
use App\Http\Resources\WorkspaceAccessDetailResource;
use App\Http\Resources\WorkspaceAccessResource;
use App\Models\ProgramAccess;
use App\Queries\WorkspaceQuery;
use App\Support\Access\ComponentAccessGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class WorkspaceController extends Controller
{
    public function __construct(
        private readonly WorkspaceQuery $workspace,
        private readonly ComponentAccessGate $componentGate,
    ) {}

    public function index(WorkspaceIndexRequest $request): JsonResponse
    {
        $user = $request->user();
        $resources = WorkspaceAccessResource::collection(
            $this->workspace->paginate($user->id, $request->validated()),
        )->additional(['summary' => $this->workspace->summary($user->id)]);

        return $this->successResponse(
            $resources->response()->getData(true),
            'Workspace retrieved successfully',
        );
    }

    public function show(int $programAccess): JsonResponse
    {
        $user = request()->user();
        $access = $this->workspace->findForUser($user->id, $programAccess);
        Gate::authorize('view', $access);
        $this->filterAuthorizedComponents($access);
        $access->forceFill(['last_accessed_at' => now()])->save();

        return $this->successResponse(
            new WorkspaceAccessDetailResource($access),
            'Workspace access retrieved successfully',
        );
    }

    public function archive(int $programAccess): JsonResponse
    {
        $access = $this->ownedAccess($programAccess);
        Gate::authorize('archive', $access);
        $access->forceFill(['archived_at' => $access->archived_at ?? now()])->save();

        return $this->successResponse(
            new WorkspaceAccessResource($this->workspace->findForUser($access->user_id, $access->id)),
            'Workspace access archived successfully',
        );
    }

    public function restore(int $programAccess): JsonResponse
    {
        $access = $this->ownedAccess($programAccess);
        Gate::authorize('restoreArchive', $access);
        $access->forceFill(['archived_at' => null])->save();

        return $this->successResponse(
            new WorkspaceAccessResource($this->workspace->findForUser($access->user_id, $access->id)),
            'Workspace access restored successfully',
        );
    }

    private function ownedAccess(int $programAccess): ProgramAccess
    {
        return ProgramAccess::query()
            ->forUser(request()->user()->id)
            ->findOrFail($programAccess);
    }

    private function filterAuthorizedComponents(ProgramAccess $access): void
    {
        $user = request()->user();
        $access->program->setRelation(
            'components',
            $this->componentGate->readableComponents($user, $access, $access->program->components),
        );

        if ($access->nextSession !== null && ! $this->componentGate->allows($user, $access, 'meeting')) {
            $access->nextSession->setAttribute('meeting_url', null);
        }
    }
}
