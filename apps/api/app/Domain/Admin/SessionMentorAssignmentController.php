<?php

namespace App\Domain\Admin;

use App\Actions\Programs\AssignSessionMentor;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MentorAssignmentEndRequest;
use App\Http\Requests\Admin\MentorAssignmentRequest;
use App\Http\Resources\SessionMentorAssignmentResource;
use App\Models\Mentor;
use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionMentorAssignmentController extends Controller
{
    public function options(Request $request): JsonResponse
    {
        abort_unless($request->user()?->checkPermissionTo('mentor-assignment.manage', 'web'), 403);

        $mentors = Mentor::query()
            ->where('is_active', true)
            ->with(['user:id,name', 'user.roles.permissions:id,name', 'user.permissions:id,name'])
            ->orderBy('id')
            ->get()
            ->filter(fn (Mentor $mentor): bool => $mentor->user->hasPermissionTo('view_dashboard_learning', 'web'))
            ->map(fn (Mentor $mentor): array => [
                'id' => $mentor->id,
                'name' => $mentor->user->name,
                'specialization' => $mentor->specialization,
            ])
            ->values();

        return $this->successResponse($mentors, 'Mentor options retrieved successfully');
    }

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
            $data['capacity'] ?? null,
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
