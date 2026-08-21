<?php

namespace App\Domain\Learning;

use App\Enums\AccessStatus;
use App\Enums\MentorAssignmentMode;
use App\Http\Controllers\Controller;
use App\Http\Resources\MentorParticipantResource;
use App\Models\Mentor;
use App\Models\ProgramAccess;
use App\Models\ProgramSession;
use App\Models\SessionMentorAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentorSessionParticipantController extends Controller
{
    public function __invoke(Request $request, int $session): JsonResponse
    {
        $session = ProgramSession::query()->findOrFail($session);
        $mentor = Mentor::query()->where('user_id', $request->user()->id)->firstOrFail();
        abort_unless(
            $mentor->is_active && $request->user()->hasPermissionTo('view_dashboard_learning', 'web'),
            403,
        );
        $assignment = SessionMentorAssignment::query()
            ->where('program_session_id', $session->id)
            ->where('mentor_id', $mentor->id)
            ->where('status', 'ACTIVE')
            ->firstOrFail();

        $participants = ProgramAccess::query()
            ->select(['id', 'user_id', 'program_batch_id', 'status'])
            ->where('program_batch_id', $session->program_batch_id)
            ->whereIn('status', [AccessStatus::Waiting->value, AccessStatus::Active->value])
            ->when(
                $session->mentor_assignment_mode !== MentorAssignmentMode::Admin,
                fn ($query) => $query->whereHas('mentorReservations', fn ($reservations) => $reservations
                    ->where('session_mentor_assignment_id', $assignment->id)
                    ->where('status', 'ACTIVE')),
            )
            ->with('user:id,name,email')
            ->orderBy('id')
            ->get();

        return $this->successResponse(
            MentorParticipantResource::collection($participants),
            'Mentor participants retrieved successfully',
        );
    }
}
