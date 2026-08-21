<?php

namespace App\Domain\Workspace;

use App\Actions\Programs\ReserveSessionMentor;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceMentorReservationRequest;
use App\Http\Resources\SessionMentorReservationResource;
use App\Models\ProgramAccess;
use App\Models\ProgramSession;
use Illuminate\Http\JsonResponse;

class WorkspaceMentorReservationController extends Controller
{
    public function store(
        WorkspaceMentorReservationRequest $request,
        int $programAccess,
        int $session,
        ReserveSessionMentor $action,
    ): JsonResponse {
        $access = ProgramAccess::query()->forUser($request->user()->id)->findOrFail($programAccess);
        $session = ProgramSession::query()->findOrFail($session);
        $data = $request->validated();
        $reservation = $action->handle($access, $session, $data['mentor_assignment_id'], $data['idempotency_key']);

        $resource = new SessionMentorReservationResource($reservation);

        return $reservation->wasRecentlyCreated
            ? $this->createdResponse($resource, 'Mentor reserved successfully')
            : $this->successResponse($resource, 'Mentor reservation replayed successfully');
    }
}
