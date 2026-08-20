<?php

namespace App\Domain\Admin;

use App\Actions\Programs\SaveProgramSession;
use App\Actions\Programs\TransitionSession;
use App\Enums\SessionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DeliveryTransitionRequest;
use App\Http\Requests\Admin\ProgramSessionStoreRequest;
use App\Http\Requests\Admin\ProgramSessionUpdateRequest;
use App\Http\Resources\ProgramSessionResource;
use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramSessionController extends Controller
{
    public function index(Request $request, Program $program, ProgramBatch $batch): JsonResponse
    {
        $this->authorizeRequest($request);
        $this->assertBatchScoped($program, $batch);
        $sessions = $batch->sessions()
            ->with(['mentorAssignments' => fn ($query) => $query
                ->where('status', 'ACTIVE')
                ->with('mentor.user:id,name')])
            ->orderBy('starts_at')
            ->get();

        return $this->successResponse(ProgramSessionResource::collection($sessions), 'Sessions retrieved successfully');
    }

    public function store(
        ProgramSessionStoreRequest $request,
        Program $program,
        ProgramBatch $batch,
        SaveProgramSession $action,
    ): JsonResponse {
        $this->assertBatchScoped($program, $batch);
        $session = $action->handle($batch, $request->validated(), $request->user());

        return $this->createdResponse(new ProgramSessionResource($session), 'Session created successfully');
    }

    public function show(
        Request $request,
        Program $program,
        ProgramBatch $batch,
        ProgramSession $session,
    ): JsonResponse {
        $this->authorizeRequest($request);
        $this->assertScoped($program, $batch, $session);

        return $this->successResponse(
            new ProgramSessionResource($session->load('mentorAssignments.mentor.user:id,name')),
            'Session retrieved successfully',
        );
    }

    public function update(
        ProgramSessionUpdateRequest $request,
        Program $program,
        ProgramBatch $batch,
        ProgramSession $session,
        SaveProgramSession $action,
    ): JsonResponse {
        $this->assertScoped($program, $batch, $session);
        $session = $action->handle($batch, $request->validated(), $request->user(), $session);

        return $this->successResponse(new ProgramSessionResource($session), 'Session updated successfully');
    }

    public function destroy(
        Request $request,
        Program $program,
        ProgramBatch $batch,
        ProgramSession $session,
    ): JsonResponse {
        $this->authorizeRequest($request);
        $this->assertScoped($program, $batch, $session);
        abort_if($session->status !== SessionStatus::Draft || $session->mentorAssignments()->exists(), 409, 'Only empty draft sessions can be deleted.');
        $session->delete();

        return $this->noContentResponse();
    }

    public function transition(
        DeliveryTransitionRequest $request,
        Program $program,
        ProgramBatch $batch,
        ProgramSession $session,
        TransitionSession $action,
    ): JsonResponse {
        $this->assertScoped($program, $batch, $session);
        $data = $request->validated();
        $session = $action->handle(
            $session,
            SessionStatus::from($data['status']),
            $request->user(),
            $data['reason'],
        );

        return $this->successResponse(new ProgramSessionResource($session), 'Session status updated successfully');
    }

    private function authorizeRequest(Request $request): void
    {
        abort_unless($request->user()?->checkPermissionTo('program-session.manage', 'web'), 403);
    }

    private function assertBatchScoped(Program $program, ProgramBatch $batch): void
    {
        abort_unless($batch->program_id === $program->id, 404);
    }

    private function assertScoped(Program $program, ProgramBatch $batch, ProgramSession $session): void
    {
        $this->assertBatchScoped($program, $batch);
        abort_unless($session->program_batch_id === $batch->id, 404);
    }
}
