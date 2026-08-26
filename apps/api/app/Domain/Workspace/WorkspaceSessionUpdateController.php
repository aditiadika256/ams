<?php

namespace App\Domain\Workspace;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramSessionUpdateResource;
use App\Models\ProgramSessionUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceSessionUpdateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $updates = ProgramSessionUpdate::query()
            ->where('recipient_user_id', $request->user()->id)
            ->latest('occurred_at')
            ->limit(50)
            ->get();

        return $this->successResponse(
            ProgramSessionUpdateResource::collection($updates),
            'Session updates retrieved successfully',
        );
    }

    public function acknowledge(Request $request, ProgramSessionUpdate $sessionUpdate): JsonResponse
    {
        abort_unless($sessionUpdate->recipient_user_id === $request->user()->id, 404);

        ProgramSessionUpdate::query()
            ->whereKey($sessionUpdate->id)
            ->whereNull('acknowledged_at')
            ->update(['acknowledged_at' => now(), 'updated_at' => now()]);

        return $this->successResponse(
            new ProgramSessionUpdateResource($sessionUpdate->refresh()),
            'Session update acknowledged successfully',
        );
    }
}
