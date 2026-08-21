<?php

namespace App\Domain\Workspace;

use App\Actions\Access\RecordProgramActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceLessonCompleteRequest;
use App\Http\Resources\WorkspaceProgressResource;
use App\Models\ProgramAccess;
use App\Models\ProgramLesson;
use App\Support\Access\ComponentAccessGate;
use Illuminate\Http\JsonResponse;

class WorkspaceActivityController extends Controller
{
    public function completeLesson(
        WorkspaceLessonCompleteRequest $request,
        int $programAccess,
        int $lesson,
        ComponentAccessGate $gate,
        RecordProgramActivity $activity,
    ): JsonResponse {
        $access = ProgramAccess::query()->forUser($request->user()->id)->findOrFail($programAccess);
        $lesson = ProgramLesson::query()
            ->where('is_published', true)
            ->whereHas('module', fn ($query) => $query
                ->where('program_id', $access->program_id)
                ->where('is_published', true))
            ->findOrFail($lesson);

        abort_unless($gate->allows($request->user(), $access, 'material'), 403);
        $access = $activity->handle(
            $access,
            'material',
            'lesson_completed',
            "lesson:{$lesson->id}",
            $request->user(),
            ProgramLesson::class,
            (string) $lesson->id,
            ['idempotency_key' => $request->validated('idempotency_key')],
        );

        return $this->successResponse(
            new WorkspaceProgressResource($access->load('certificate')),
            'Lesson completion recorded successfully',
        );
    }
}
