<?php

namespace App\Domain\Admin;

use App\Actions\Programs\AssignSessionMentor;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MentorAssignmentEndRequest;
use App\Http\Requests\Admin\MentorAssignmentRequest;
use App\Http\Resources\SessionMentorAssignmentResource;
use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use Illuminate\Http\JsonResponse;

class SessionMentorAssignmentController extends Controller
{
    public function store(
        MentorAssignmentRequest $request,
        Program $program,
        ProgramBatch $batch,
        ProgramSession $session,
        AssignSessionMentor $action,
    ): JsonResponse {
        $this->assertScoped($program, $batch, $session);
        $data = $request->validated();
        $assignment = $action->assign(
            $session,
            $data['mentor_id'],
            $data['role'] ?? 'lead',
            $data['metadata'] ?? [],
            $request->user(),
            $data['reason'],
        );

        return $this->createdResponse(
            new SessionMentorAssignmentResource($assignment),
            'Mentor assigned successfully',
        );
    }

    public function destroy(
        MentorAssignmentEndRequest $request,
        Program $program,
        ProgramBatch $batch,
        ProgramSession $session,
        SessionMentorAssignment $mentorAssignment,
        AssignSessionMentor $action,
    ): JsonResponse {
        $this->assertScoped($program, $batch, $session);
        abort_unless($mentorAssignment->program_session_id === $session->id, 404);
        $action->end($mentorAssignment, $request->user(), $request->validated('reason'));

        return $this->noContentResponse();
    }

    private function assertScoped(Program $program, ProgramBatch $batch, ProgramSession $session): void
    {
        abort_unless($batch->program_id === $program->id, 404);
        abort_unless($session->program_batch_id === $batch->id, 404);
    }
}
